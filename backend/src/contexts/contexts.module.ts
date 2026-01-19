import { Module } from '@nestjs/common';
import { ContextsService } from './contexts.service';
import { ContextsController } from './contexts.controller';

@Module({
  controllers: [ContextsController],
  providers: [ContextsService],
})
export class ContextsModule {}
