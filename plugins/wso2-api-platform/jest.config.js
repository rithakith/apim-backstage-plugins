/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const baseConfig = require('@backstage/cli/config/jest.js');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
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
  testEnvironment: 'jsdom',
  transform: {
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
  transformIgnorePatterns: ['node_modules/(?!.*@backstage)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e-tests/'],
};
