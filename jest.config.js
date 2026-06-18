const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path to the Next.js app, used to load next.config.ts and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // Automatically clear mock calls, instances, contexts, and results before every test
  clearMocks: true,

  // Use jsdom for browser-like environment (required for React component tests)
  testEnvironment: 'jest-environment-jsdom',

  // Runs after the test framework is installed in the environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapper for the @/* path alias defined in tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Glob patterns for test file discovery
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage collection scope
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};

// createJestConfig merges Next.js defaults (transforms, module file extensions, etc.)
// with the custom config above
module.exports = createJestConfig(config);
