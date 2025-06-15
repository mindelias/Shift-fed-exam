export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/inertia/$1',
    '^~/(.*)$' : '<rootDir>/inertia/$1',
    '^@hooks/(.*)$': '<rootDir>/inertia/hooks/$1',
    '^./useDebounce$': '<rootDir>/inertia/hooks/useDebounce',
    '^./useIntersection$': '<rootDir>/inertia/hooks/useIntersection',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      // {
      //   tsconfig: 'tsconfig.json'
      // }
      { tsconfig: 'tsconfig.jest.json', useESM: true },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Treat TS files as ESM
  roots: ['<rootDir>/inertia'], // Start looking for tests here
  transformIgnorePatterns: ['/node_modules/(?!(your-module-to-transform)/)'],
}
