import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { TaskStatus } from './task-status.enum';
import { TaskFilterDTO } from './dto/tasks-filter.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';

const mockUser = { username: 'testuser', id: 12 };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockTask = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('Task Service', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTask', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: TaskFilterDTO = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();

      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskByID', () => {
    it('calls task repository.findOne() and successfully returns a task', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };

      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskByID(1, mockUser);

      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskByID(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should return a task created with data provided in CreateTaskDTO', async () => {
      const mockCreateTaskDTO: CreateTaskDTO = {
        title: 'Test Title',
        description: 'Test Description',
      };
      const mockTask = 'TestValue';

      taskRepository.createTask.mockResolvedValue(mockTask);

      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const result = await tasksService.createTask(mockCreateTaskDTO, mockUser);
      expect(taskRepository.createTask).not.toHaveBeenCalledWith(
        mockCreateTaskDTO,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should call taskRepository.delete() to delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();

      const result = await tasksService.deleteTask(1, mockUser);

      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('should throw an error if task can not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });

      expect(taskRepository.delete).not.toHaveBeenCalled();
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('updates a tasks status', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskByID = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(tasksService.getTaskByID).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        2,
        TaskStatus.IN_PROGRESS,
        mockUser,
      );

      expect(tasksService.getTaskByID).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
