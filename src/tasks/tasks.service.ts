import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDTO } from './dto/create-task.dto';
import { TaskFilterDTO } from './dto/tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDTO: TaskFilterDTO, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDTO, user);
  }

  async getTaskByID(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException(`Task With id "${id}" not found`);
    }
    return found;
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskByID(id, user);
    task.status = status;
    task.save();
    return task;
  }

  createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDTO, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id });
    if (result.affected === 0) {
      throw new NotFoundException(`Task With id "${id}" not found`);
    }
    console.log(result);
  }
}
