import { Module } from '@nestjs/common';
import { UserDbService } from './user/user.service';

@Module({
  providers: [UserDbService],
  exports: [UserDbService],
})
export class DbModule { }
