import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('user entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.username = 'testUsername';
    user.password = 'testPassword';
    user.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });

  describe('method_validatePassword', () => {
    it('should return true as password is valid', async () => {
      bcrypt.hash.mockReturnValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('123456');

      expect(bcrypt.hash).toHaveBeenLastCalledWith('123456', 'testSalt');
      expect(result).toEqual(true);
    });

    it('should return false as password is invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('123456');

      expect(bcrypt.hash).toHaveBeenLastCalledWith('123456', 'testSalt');
      expect(result).toEqual(false);
    });
  });

  describe('User properties', () => {
    beforeEach(() => {
      user.id = 1;
      user.salt = 'testSalt';
      user.tasks = [];
    });
    afterEach(() => {
      user = undefined;
    });
    it('should be an instance of class User', () => {
      expect(user).toBeInstanceOf(User);
    });
    it('should have id of type number', () => {
      user.id = 1;
      expect(user).toHaveProperty('id', user.id);
    });
    it('should have a username of type string', () => {
      expect(user).toHaveProperty('username', 'testUsername');
    });
    it('should have a password of type string', () => {
      expect(user).toHaveProperty('password', 'testPassword');
    });
    it('should have a salt of type string', () => {
      expect(user).toHaveProperty('salt', 'testSalt');
    });
    it('should have property tasks of type array', () => {
      expect(user).toHaveProperty('tasks', []);
    });
  });
});
