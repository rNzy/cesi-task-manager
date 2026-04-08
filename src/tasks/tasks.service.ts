import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskTypeormEntity } from './tasks.entity';
import type { ITaskRepository } from './interfaces/task-repository.interface';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async findAll(): Promise<TaskTypeormEntity[]> {
    return this.taskRepo.findAll();
  }

  async findOne(id: string): Promise<TaskTypeormEntity> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      throw new NotFoundException(`Task ${id} introuvable`);
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<TaskTypeormEntity> {
    return this.taskRepo.create(dto);
  }

  async updateStatus(id: string, done: boolean): Promise<TaskTypeormEntity> {
    return this.taskRepo.updateStatus(id, done);
  }

  async remove(id: string): Promise<void> {
    return this.taskRepo.delete(id);
  }
}
