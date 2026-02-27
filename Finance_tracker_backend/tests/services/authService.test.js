const authService = require('../../services/authService');
const { User } = require('../../models');

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        userName: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user).toHaveProperty('id');
      expect(result.user.userName).toBe(userData.userName);
      expect(result.user.email).toBe(userData.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        name: 'Test User',
        userName: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      await authService.register(userData);

      await expect(authService.register(userData))
        .rejects.toThrow('username already exists');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        userName: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!'
      };
      await authService.register(userData);
    });

    it('should throw error if email is not verified', async () => {
      const credentials = {
        userName: 'testuser',
        password: 'TestPass123!'
      };

      await expect(authService.login(credentials))
        .rejects.toThrow('Email not verified');
    });

    it('should login user successfully after email verified', async () => {
      const { User } = require('../../models');
      const user = await User.findOne({ where: { userName: 'testuser' } });
      user.emailVerified = true;
      await user.save();

      const credentials = {
        userName: 'testuser',
        password: 'TestPass123!'
      };

      const result = await authService.login(credentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.userName).toBe(credentials.userName);
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        userName: 'testuser',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
