import { Test } from '@nestjs/testing';
import { TaskRepository } from './task.repository';
import { UserRepository } from 'src/auth/user.repository';
import { CreateTaskDTO } from './dto/create-task.dto';
import { User } from 'src/auth/user.entity';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';

describe('Task Repository', () => {
  let taskRepository;

  const mockUser = {
    id: 1,
    username: 'TestUsername',
    password: 'TestPassword',
    salt: 'TestSalt',
    tasks: [],
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TaskRepository],
    }).compile();

    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('#getTask', () => {
    let query;
    beforeEach(() => {
      query = {
        where: jest.fn(),
        andWhere: jest.fn(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      taskRepository.createQueryBuilder = jest.fn().mockReturnValue(query);
    });

    it('should have two parameters', () => {
      expect(taskRepository.getTasks.length).toEqual(2);
    });

    it('should call getMany', async () => {
      expect(query.getMany).not.toHaveBeenCalled();
      await taskRepository.getTasks({}, mockUser);
      expect(query.getMany).toHaveBeenCalled();
    });

    it('should filter for task status when called with task status', async () => {
      expect(query.andWhere).not.toHaveBeenCalled();
      const status = TaskStatus.DONE;
      await taskRepository.getTasks({ status }, mockUser);
      expect(query.andWhere).toHaveBeenCalledWith('task.status = :status', {
        status,
      });
    });

    it('should not filter if no filter parameters have been provided', async () => {
      expect(query.andWhere).not.toHaveBeenCalled();
      await taskRepository.getTasks({}, mockUser);
      expect(query.andWhere).not.toHaveBeenCalled();
    });

    it('should filter for search term if one provided', async () => {
      expect(query.andWhere).not.toHaveBeenCalled();
      const search = 'testSearch';
      await taskRepository.getTasks({ search }, mockUser);
      expect(query.andWhere).toHaveBeenCalledWith(
        'task.title LIKE :search OR task.description LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    });

    it('should return an array of tasks', async () => {
      expect(query.getMany).not.toHaveBeenCalled();
      const result = await taskRepository.getTasks({}, mockUser);
      expect(query.getMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('#createTask', () => {
    let save;

    const mockCreateTaskDto: CreateTaskDTO = {
      title: 'TestTitle',
      description: 'TestDescription',
    };

    beforeEach(() => {
      save = jest.fn();
      taskRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('should have two parameters', () => {
      expect(taskRepository.createTask.length).toEqual(2);
    });

    it('should call the save method', async () => {
      expect(save).not.toHaveBeenCalled();
      await taskRepository.createTask(mockCreateTaskDto, mockUser);
      expect(save).toHaveBeenCalled();
    });

    it('should return the saved tasks', async () => {
      expect(taskRepository.create).not.toHaveBeenCalled();
      const result = await taskRepository.createTask(
        mockCreateTaskDto,
        mockUser,
      );
      expect(taskRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('title', 'TestTitle');
      expect(result).toHaveProperty('description', 'TestDescription');
      expect(result).toHaveProperty('status', TaskStatus.OPEN);
      expect(result).not.toHaveProperty('user');
    });
  });
});
