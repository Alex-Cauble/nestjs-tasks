import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { async } from 'rxjs/internal/scheduler/async';

const mockCredentialsDTO = {
  username: 'TestUsername',
  password: 'TestPassword',
};

describe('UserRepository', () => {
  let userRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = module.get(UserRepository);
  });

  describe('method_signUp', () => {
    let save, hashPassword;

    beforeEach(() => {
      save = jest.fn();
      userRepository.hashPassword = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save, hashPassword });
    });

    it('should successfully sign up the user', async () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDTO)).resolves.not.toThrow();
    });

    it('should not have a return', async () => {
      save.mockResolvedValue(undefined);
      const result = await userRepository.signUp(mockCredentialsDTO);
      expect(result).toBeUndefined();
    });

    it('should call method save on the user object', async () => {
      expect(save).not.toHaveBeenCalled();
      await userRepository.signUp(mockCredentialsDTO);
      expect(save).toHaveBeenCalled();
    });

    it('should call the method hashPassword', async () => {
      expect(userRepository.hashPassword).not.toHaveBeenCalled();
      await userRepository.signUp(mockCredentialsDTO);
      expect(userRepository.hashPassword).toHaveBeenCalled();
    });

    it('should throw a conflict exception if the username already exists', () => {
      save.mockRejectedValue({ code: 23505 });
      expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a Internal server error if problems with save', () => {
      save.mockRejectedValue({ code: 0 });
      expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('method_validateUserPassword', () => {
    let user;
    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'TestUsername';
      user.validatePassword = jest.fn();
    });
    it('returns the username as value is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDTO,
      );

      expect(result).toEqual(user.username);
    });

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDTO,
      );

      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(null);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDTO,
      );

      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('method_hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash');
    });
  });
});
