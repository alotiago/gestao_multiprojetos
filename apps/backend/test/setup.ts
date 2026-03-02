// __tests__/setup.ts
export const setupTestEnvironment = () => {
  // Global test setup
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.JWT_SECRET = 'test-secret';
};

setupTestEnvironment();
