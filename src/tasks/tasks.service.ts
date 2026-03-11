import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTypeormEntity } from './tasks.entity';

export interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskTypeormEntity)
    private readonly taskRepo: Repository<TaskTypeormEntity>,
  ) {}

  async findAll(): Promise<Task[]> {
    const tasks = await this.taskRepo.find();

    return tasks;
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });

    if (!task) throw new NotFoundException(`Task ${id} introuvable`);

    return task;
  }

  async create(title: string, description: string): Promise<Task> {
    const newTask = await this.taskRepo.save({ title, description });

    return newTask;
  }

  async updateStatus(id: string, done: boolean): Promise<Task> {
    const task = await this.findOne(id);

    task.done = done;

    await this.taskRepo.save(task);

    return task;
  }

  async remove(id: string): Promise<void> {
    await this.taskRepo.delete({ id });
  }
}
