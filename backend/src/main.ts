import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Enable rawBody for Stripe webhook verification
  });

  // The API runs behind Nginx: trust its X-Forwarded-For header so req.ip is the
  // real client IP (used by the rate limiter) instead of the proxy's IP
  app.set('trust proxy', 1);

  // Enable CORS to authorize requests from the frontend (React Native app) to the backend (NestJS API)
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // active @Type() / @Transform() in DTOs (ex: convert string to number)
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true, // Mandatory for FormData to work with @Transform() in DTOs (ex: convert string to number)
      },
      exceptionFactory: (errors) => {
        console.log(
          '[Validation] DTO errors:',
          JSON.stringify(errors, null, 2),
        );
        return new BadRequestException(errors);
      },
    }),
  );

  // Starts the server on the specified port (default 3000) and binds to all network interfaces (0.0.0.0).
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
