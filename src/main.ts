import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /** 添加静态资源目录 */
  app.useStaticAssets(join(__dirname, 'public'));
  app.useStaticAssets(join(__dirname, 'front-end/src'));
  await app.listen(3000);
}
bootstrap();
