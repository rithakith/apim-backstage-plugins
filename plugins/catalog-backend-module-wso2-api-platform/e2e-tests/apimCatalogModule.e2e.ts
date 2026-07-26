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

test.describe('WSO2 API Platform - Catalog Integration', () => {
  test('catalog entities should be accessible', async ({ page }) => {
    await page.goto('/catalog');

    const enterButton = page.getByRole('button', { name: 'Enter' });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }

    await page.waitForLoadState('networkidle');

    // The catalog page should render with a list header
    const catalogHeader = page.getByText(/Catalog/i);
    await expect(catalogHeader).toBeVisible();
  });

  test('catalog API entities should have WSO2 entity content tabs', async ({
    page,
  }) => {
    // Navigate to catalog
    await page.goto('/catalog');

    const enterButton = page.getByRole('button', { name: 'Enter' });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }

    await page.waitForLoadState('networkidle');

    // If there are API entities in the catalog, clicking them should show
    // the WSO2 entity content tabs (Overview, Definition, Tools, etc.)
    // This test validates the catalog module is integrated and serving,
    // but may need catalog data populated to fully exercise.
    const apiEntities = page.locator('a:has-text("API")');

    // If the catalog has WSO2 API entities from the provider, we can test entity-specific pages
    if ((await apiEntities.count()) > 0) {
      await apiEntities.first().click();
      await page.waitForLoadState('networkidle');

      // Verify WSO2 entity content tabs are present
      await expect(page.getByText(/Overview/i)).toBeVisible();
    }
  });
});
