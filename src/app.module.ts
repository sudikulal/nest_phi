import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './global/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
