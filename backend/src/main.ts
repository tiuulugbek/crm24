import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Enable CORS – localhost, FRONTEND_URL va IP orqali tashqaridan ulanish
  const frontendUrl = configService.get('FRONTEND_URL');
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3301',
    'http://localhost:3305',
    'http://localhost:5173',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/[\d.]+(:\d+)?$/.test(origin); // IP orqali: http://192.168.1.5:5173 yoki http://YOUR_PUBLIC_IP:5173
      callback(null, allowed ? origin : false);
    },
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  const port = configService.get('PORT') || 3000;
  const host = configService.get('HOST') || '0.0.0.0'; // 0.0.0.0 = tashqaridan (IP orqali) ulanish
  await app.listen(port, host);

  console.log(`🚀 Acoustic CRM Backend: http://localhost:${port}`);
  if (host === '0.0.0.0') {
    console.log(`   Tashqaridan: http://SIZNING_IP:${port} (IP ni o‘rnating)`);
  }
}

bootstrap();
