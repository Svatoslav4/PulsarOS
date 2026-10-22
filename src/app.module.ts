
import { Module } from '@nestjs/common';
import { SystemModule } from './system/system.module.js';

@Module({
  imports: [SystemModule],
})
export class AppModule {}
