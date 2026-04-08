import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTypeormEntity } from '../tasks.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ITaskRepository } from '../interfaces/task-repository.interface';

@Injectable()
export class TypeOrmTaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(TaskTypeormEntity)
    private readonly repo: Repository<TaskTypeormEntity>,
  ) {}

  async findAll(): Promise<TaskTypeormEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<TaskTypeormEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async create(dto: CreateTaskDto): Promise<TaskTypeormEntity> {
    const task = this.repo.create(dto);
    return this.repo.save(task);
  }

  async updateStatus(id: string, done: boolean): Promise<TaskTypeormEntity> {
    const task = await this.findById(id);
    if (!task) {
      throw new NotFoundException(`Task ${id} introuvable`);
    }
    task.done = done;
    return this.repo.save(task);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task ${id} introuvable`);
    }
  }
}
