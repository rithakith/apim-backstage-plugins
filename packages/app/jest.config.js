const baseConfig = require('@backstage/cli/config/jest.js');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  transform: {
    ...baseConfig.transform,
    '^.+\\.(js|jsx|ts|tsx|mjs)$': [
      require.resolve('@backstage/cli/config/jestSwcTransform.js'),
      {
        module: { type: 'commonjs' },
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/setupTests.ts',
    '!src/index.ts',
    '!src/**/*.esm.js',
    '!src/**/*.cjs.js',
    '!src/**/*.chunk.js',
    '!**/jest.config.js',
  ],
  transformIgnorePatterns: ['node_modules/(?!.*@backstage)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e-tests/'],
};
