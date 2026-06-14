import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to authorize requests from the frontend (React Native app) to the backend (NestJS API)
  app.enableCors();

  // Starts the server on the specified port (default 3000) and binds to all network interfaces (0.0.0.0).
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
