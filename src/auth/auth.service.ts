import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailService } from './services/email.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import * as uuid from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Generate verification token
    const token = uuid.v4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

    // Create user and token in transaction
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        emailVerified: false,
        isActive: false,
        emailVerificationToken: {
          create: {
            token,
            expiresAt,
          },
        },
      },
    });

    // Return HTTP response IMMEDIATELY - email will be sent after response
    const response = {
      message: 'Verification email sent',
    };

    // Schedule email sending AFTER response is sent (fire-and-forget)
    // Using setImmediate ensures this runs in the next event loop tick
    // AFTER the HTTP response has been sent to the client
    // NO await - completely fire-and-forget
    setImmediate(() => {
      // Wrap in try-catch to ensure no errors escape
      try {
        this.emailService.sendVerificationEmail(
          user.email,
          token,
          user.firstName || undefined,
        ).then((result) => {
          if (!result.sent) {
            this.logger.warn(`Failed to send verification email to ${user.email}: ${result.reason}`);
          } else {
            this.logger.log(`Verification email sent to ${user.email}`);
          }
        }).catch((error) => {
          // Log email errors but don't block response
          this.logger.error(`Email sending error for ${user.email}:`, error instanceof Error ? error.message : 'Unknown error');
        });
      } catch (error) {
        // Catch any synchronous errors
        this.logger.error('Email scheduling failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    return response;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // Find token with indexed lookup
    const tokenRecord = await this.prisma.emailVerificationToken.findUnique({
      where: { token: verifyEmailDto.token },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new BadRequestException({
        code: 'INVALID_TOKEN',
        message: 'Invalid verification token',
      });
    }

    // Check expiry BEFORE any updates (fail fast)
    const now = new Date();
    if (tokenRecord.expiresAt < now) {
      // Delete expired token in transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.emailVerificationToken.delete({
          where: { id: tokenRecord.id },
        });
      });

      throw new BadRequestException({
        code: 'TOKEN_EXPIRED',
        message: 'Verification token has expired',
      });
    }

    // Update user and delete token in single transaction
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          emailVerified: true,
          isActive: true,
        },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { id: tokenRecord.id },
      }),
    ]);

    return {
      message: 'Email verified successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before logging in',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      currentSalonId: user.currentSalonId || undefined,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
        currentSalonId: user.currentSalonId || undefined,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        currentSalonId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      currentSalonId: user.currentSalonId || undefined,
    };
  }
}
