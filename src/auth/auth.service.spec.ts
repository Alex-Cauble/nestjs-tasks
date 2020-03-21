import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { async } from 'rxjs/internal/scheduler/async';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  signUp: jest.fn(),
  validateUserPassword: jest.fn(),
});

describe('Auth Service', () => {
  let authService;
  let userRepository;

  const mockAuthCreds: AuthCredentialsDto = {
    password: 'TestPassword',
    username: 'TestUsername',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'testSecret',
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    it('should call sign up with authCredentialsDto', async () => {
      const testValue = 'someValue';
      userRepository.signUp.mockResolvedValue(testValue);

      expect(userRepository.signUp).not.toHaveBeenCalled();
      const result = await authService.signUp(mockAuthCreds);
      expect(result).toEqual(testValue);
      expect(userRepository.signUp).toHaveBeenCalled();
    });
  });

  describe('singIn', () => {
    it('should call sing in with authCredentialsDto', async () => {
      const testValue = 'someValue';
      userRepository.validateUserPassword.mockResolvedValue(testValue);

      expect(userRepository.signUp).not.toHaveBeenCalled();
      const result = await authService.signIn(mockAuthCreds);
      expect(result).toBeDefined();
      expect(userRepository.validateUserPassword).toHaveBeenCalledWith(
        mockAuthCreds,
      );
    });

    it('should throw unauthorized if username not return validated form the validateUserPassword', async () => {
      userRepository.validateUserPassword.mockResolvedValue(null);

      expect(authService.signIn(mockAuthCreds)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
