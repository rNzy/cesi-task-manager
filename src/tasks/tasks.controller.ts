import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() body: { title: string; description: string }) {
    return this.tasksService.create(body.title, body.description);
  }

  @Patch(':id/status')
  update(@Param('id') id: string, @Body() body: { done: boolean }) {
    return this.tasksService.updateStatus(id, body.done);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
