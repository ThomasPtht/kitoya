import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetController rate limiting', () => {
  let app: INestApplication;

  const mockPasswordResetService = {
    forgotPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
    resetPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }])],
      controllers: [PasswordResetController],
      providers: [
        { provide: PasswordResetService, useValue: mockPasswordResetService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('should return 429 after 5 forgot-password requests within a minute', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'thomas@example.com' })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'thomas@example.com' })
      .expect(429);

    // the 6th request never reaches the service, so no extra email is sent
    expect(mockPasswordResetService.forgotPassword).toHaveBeenCalledTimes(5);
  });

  it('should return 429 after 5 reset-password requests within a minute', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: 'thomas@example.com', code: '000000', newPassword: 'x' })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ email: 'thomas@example.com', code: '000000', newPassword: 'x' })
      .expect(429);
  });
});
