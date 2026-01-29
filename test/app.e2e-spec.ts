import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message', 'Application is running');
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@glowdesk.com',
        password: 'admin123'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('expiresAt');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user).toHaveProperty('role');
      });
  });

  it('/auth/login (POST) - Invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@glowdesk.com',
        password: 'wrongpassword'
      })
      .expect(401);
  });

  it('/clients (GET) - Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/api/v1/clients')
      .expect(401);
  });

  it('/clients (GET) - Authorized', async () => {
    // First login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@glowdesk.com',
        password: 'admin123'
      });

    const token = loginResponse.body.token;

    // Then use token to access protected route
    return request(app.getHttpServer())
      .get('/api/v1/clients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
