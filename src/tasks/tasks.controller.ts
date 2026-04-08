import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Patch(':id/status')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateTaskDto) {
    return this.tasksService.updateStatus(id, body.done);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }

  // Route admin uniquement (exemple d'utilisation du décorateur @Roles)
  @Get('admin/all')
  @Roles('admin')
  findAllAdmin() {
    return { message: 'Route admin — accès restreint' };
  }
}
