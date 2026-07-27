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

import { test, expect } from '@playwright/test';

test.describe('WSO2 API Platform Backend API', () => {
  test('should respond to config endpoint', async ({ request }) => {
    const response = await request.get('/api/wso2-api-platform/config');
    // If the backend is running, it will respond (may be 401 if auth is enabled, or 500 if no APIM configured)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('config response should have expected shape', async ({ request }) => {
    const response = await request.get('/api/wso2-api-platform/config');
    const status = response.status();

    if (status === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('apiManager');
      expect(body).toHaveProperty('platformGateway');
      expect(body.apiManager).toHaveProperty('enabled');
      expect(body.platformGateway).toHaveProperty('enabled');
      expect(body.platformGateway).toHaveProperty('gatewayCount');
    }
  });

  test('should respond to gateways endpoint', async ({ request }) => {
    const response = await request.get('/api/wso2-api-platform/gateways');
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    }
  });
});
