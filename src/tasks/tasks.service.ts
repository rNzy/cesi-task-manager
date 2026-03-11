import { Injectable, NotFoundException } from '@nestjs/common';

export interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
}

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: '1',
      title: 'Lire Tasks',
      description: 'Lire la liste des tasks',
      done: true,
    },
  ];
  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string) {
    const task = this.tasks.find((t) => t.id === id);

    if (!task) throw new NotFoundException(`Task ${id} introuvable`);

    return task;
  }

  create(title: string, description: string): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      done: false,
    };

    this.tasks.push(task);

    return task;
  }

  updateStatus(id: string, done: boolean): Task {
    const task = this.findOne(id);

    task.done = done;

    return task;
  }

  remove(id: string): void {
    const index = this.tasks.findIndex((t) => t.id === id);

    if (index === -1) throw new NotFoundException(`Task ${id} introuvable`);

    this.tasks.splice(index, 1);
  }
}
