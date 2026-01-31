import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Starting application...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable shutdown hooks for graceful Prisma disconnection
    app.enableShutdownHooks();

    app.use(helmet());

    // CORS Configuration - Production Safe
    const isDevelopment = process.env.NODE_ENV === 'development';
    const frontendUrl = process.env.FRONTEND_URL;
    const corsOriginsEnv = process.env.CORS_ORIGINS?.split(',').filter(Boolean) || [];

    // Build allowed origins list
    const allowedOrigins: string[] = [];

    // Always allow localhost:3000 for frontend
    allowedOrigins.push('http://localhost:3000');

    // In development: also allow localhost:5005 and any CORS_ORIGINS
    if (isDevelopment) {
      allowedOrigins.push('http://localhost:5005');
      if (corsOriginsEnv.length > 0) {
        allowedOrigins.push(...corsOriginsEnv);
      }
    }

    // In production: use FRONTEND_URL and CORS_ORIGINS
    if (!isDevelopment) {
      if (frontendUrl) {
        allowedOrigins.push(frontendUrl);
      }
      if (corsOriginsEnv.length > 0) {
        allowedOrigins.push(...corsOriginsEnv);
      }
    }

    // Dynamic origin validation function (NestJS pattern)
    const originValidator = (origin: string | undefined): boolean => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return true;
      }

      // Check if origin is in allowed list
      return allowedOrigins.includes(origin);
    };

    app.enableCors({
      origin: originValidator,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 86400, // 24 hours
    });

    // Global request timeout (10 seconds)
    app.use((req: any, res: any, next: any) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            statusCode: 408,
            message: 'Request timeout',
          });
        }
      }, 10000);

      res.on('finish', () => {
        clearTimeout(timeout);
      });

      next();
    });

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Glow Flow Salon Management API')
      .setDescription('Multi-tenant Salon Management SaaS Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const PORT = 3001;
    
    // Create HTTP server manually for proper shutdown handling
    let server: any;
    try {
      server = await app.listen(PORT, '0.0.0.0');
    } catch (error: any) {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please stop the process using this port or change PORT in .env`);
        logger.error(`To find the process: lsof -ti:${PORT} | xargs kill -9`);
        process.exit(1);
      }
      throw error;
    }
    
    // Store server reference for graceful shutdown
    const shutdown = async (signal: string) => {
      logger.log(`Received ${signal}, shutting down gracefully...`);
      try {
        if (server) {
          await new Promise<void>((resolve) => {
            server.close(() => {
              logger.log('HTTP server closed');
              resolve();
            });
          });
        }
        await app.close();
        logger.log('NestJS application closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', reason);
      shutdown('unhandledRejection');
    });

    logger.log(`Application is running on: http://localhost:${PORT}/api`);
    logger.log(`Swagger documentation: http://localhost:${PORT}/api/docs`);
  } catch (error: any) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
