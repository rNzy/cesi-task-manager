import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TaskTypeormEntity } from './tasks.entity';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskTypeormEntity])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
