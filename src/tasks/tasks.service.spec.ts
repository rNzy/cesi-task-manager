import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { InMemoryTaskRepository } from './repositories/in-memory-task.repository';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let repo: InMemoryTaskRepository;

  beforeEach(async () => {
    repo = new InMemoryTaskRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: TASK_REPOSITORY, useValue: repo }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    repo.clear();
  });

  it('should create a task', async () => {
    const task = await service.create({
      title: 'Test',
      description: 'Description',
    });

    expect(task).toBeDefined();
    expect(task.title).toBe('Test');
    expect(task.done).toBe(false);
  });

  it('should list all tasks', async () => {
    await service.create({ title: 'Task A', description: 'Desc A' });
    await service.create({ title: 'Task B', description: 'Desc B' });

    const tasks = await service.findAll();

    expect(tasks).toHaveLength(2);
  });

  it('should find one task by id', async () => {
    const created = await service.create({
      title: 'Find me',
      description: '',
    });

    const found = await service.findOne(created.id);

    expect(found.title).toBe('Find me');
  });

  it('should throw NotFoundException for non-existent task', async () => {
    await expect(service.findOne('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update task status', async () => {
    const task = await service.create({
      title: 'Toggle me',
      description: '',
    });

    const updated = await service.updateStatus(task.id, true);

    expect(updated.done).toBe(true);
  });

  it('should delete a task', async () => {
    const task = await service.create({
      title: 'To delete',
      description: '',
    });

    await service.remove(task.id);

    const tasks = await service.findAll();
    expect(tasks).toHaveLength(0);
  });
});
