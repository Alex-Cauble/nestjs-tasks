import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import * as uuid from 'uuid/v1';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTaskFilterDTO } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getTasksWithFilters(filterDTO: GetTaskFilterDTO): Task[] {
    const { status, search } = filterDTO;

    let tasks = this.getAllTasks();

    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(
        task =>
          task.title.includes(search) || task.description.includes(search),
      );
    }

    return tasks;
  }

  getTaskByID(id: string): Task {
    return this.tasks.find(task => task.id === id);
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task = this.getTaskByID(id);
    task.status = status;
    return task;
  }

  createTask(createTaskDTO: CreateTaskDTO): Task {
    const { title, description } = createTaskDTO;

    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks = [...this.tasks, task];

    return task;
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }
}
