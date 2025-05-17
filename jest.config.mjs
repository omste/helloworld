import nextJest from 'next/jest.js'; // Note .js extension for ESM import

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // if you use a setup file
  testEnvironment: 'jest-environment-jsdom',
  // If using TypeScript with a baseUrl to import modules from a directory
  // (e.g. import Something from '@/components/Something'),
  // you need to configure moduleNameMapper below
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/', // Ignore Playwright's main test directory
    '<rootDir>/tests-examples/', // Ignore Playwright's example test directory
  ],
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig); 