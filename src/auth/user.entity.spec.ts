import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('user entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
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
});
