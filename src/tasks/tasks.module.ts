import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskTypeormEntity } from './tasks.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmTaskRepository } from './repositories/typeorm-task.repository';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TaskTypeormEntity])],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TASK_REPOSITORY,
      useClass: TypeOrmTaskRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
