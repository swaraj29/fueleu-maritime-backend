// Jest setup file
// This file runs before all tests

// Suppress console.log during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:1234@localhost:5432/fueleu_maritime_test';
