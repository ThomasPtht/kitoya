import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable rawBody for Stripe webhook verification
  });

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
