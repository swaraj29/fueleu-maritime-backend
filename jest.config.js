module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@prisma/client$': '<rootDir>/generated/prisma/client'
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        baseUrl: '.',
        paths: {
          '@core/*': ['./src/core/*'],
          '@shared/*': ['./src/shared/*'],
          '@adapters/*': ['./src/adapters/*'],
          '@infrastructure/*': ['./src/infrastructure/*'],
          '@prisma/client': ['./generated/prisma/client']
        }
      }
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/infrastructure/server/server.ts',
    '!src/infrastructure/db/prisma.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  verbose: true
};
