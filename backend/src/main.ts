import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad OWASP: Cabeceras HTTP seguras y validación estricta de payloads
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración e inicialización de Swagger
  const config = new DocumentBuilder()
    .setTitle('Checkout API -  Integration')
    .setDescription('API Hexagonal para el procesamiento de compras y pagos')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Servidor NestJS Hexagonal ejecutándose en el puerto ${port}`);
  console.log(`📄 Documentación Swagger lista en: http://localhost:${port}/docs`);
}
bootstrap();