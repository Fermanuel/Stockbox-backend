import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // prefijo de la api para todas las rutas
  app.setGlobalPrefix('api/');

  app.enableCors();
  
    // validacion de los datos de entrada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  // documentacion de la api con swagger
  const config = new DocumentBuilder()
    .setTitle("STOCKBOX API")
    .setDescription("API para gestionar la aplicacion de stockbox")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // puerto de escucha
  await app.listen(process.env.PORT);
}
bootstrap();
