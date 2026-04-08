import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskTypeormEntity } from '../tasks.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ITaskRepository } from '../interfaces/task-repository.interface';

@Injectable()
export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: TaskTypeormEntity[] = [];

  findAll(): Promise<TaskTypeormEntity[]> {
    return Promise.resolve([...this.tasks]);
  }

  findById(id: string): Promise<TaskTypeormEntity | null> {
    return Promise.resolve(this.tasks.find((t) => t.id === id) || null);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(dto: CreateTaskDto): Promise<TaskTypeormEntity> {
    const task: TaskTypeormEntity = {
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description,
      done: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async updateStatus(id: string, done: boolean): Promise<TaskTypeormEntity> {
    const task = await this.findById(id);
    if (!task) throw new NotFoundException(`Task ${id} introuvable`);
    task.done = done;
    task.updatedAt = new Date();
    return task;
  }

  delete(id: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException(`Task ${id} introuvable`);
    this.tasks.splice(index, 1);
    return Promise.resolve();
  }

  clear(): void {
    this.tasks = [];
  }
}
