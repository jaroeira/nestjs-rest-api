import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NESTJS REST API - Joao Aroeira')
    .setDescription('A Simple Rest API created with NEST.JS')
    .setVersion('1.0')
    .addBearerAuth()
    // .addTag('nestjs')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  console.log(`App listening on port ${port}`);
}
bootstrap();
