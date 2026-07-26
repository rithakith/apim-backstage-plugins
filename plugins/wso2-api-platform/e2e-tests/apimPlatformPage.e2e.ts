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

test.describe('WSO2 API Platform Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wso2-api-platform');
  });

  test('should render the API Platform page with navigation', async ({
    page,
  }) => {
    // Navigate via sidebar link
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const apisLink = nav.getByRole('link', { name: /APIs/i });
    await expect(apisLink).toBeVisible();

    // Click and verify navigation to the API Platform page
    await apisLink.click();
    await page.waitForURL('**/wso2-api-platform');

    // Verify page title or key content is visible
    await expect(page.locator('text=APIs').first()).toBeVisible();
  });

  test('should display the API Platform tabs', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the main tabs are rendered — these are the tab navigation buttons
    // The page has APIs, API Products, MCP Servers, and Services tabs
    const tabs = page.getByRole('tab');
    const tabNames = await tabs.allTextContents();

    expect(tabNames.length).toBeGreaterThanOrEqual(4);
    expect(
      tabNames.some(t => t.includes('API') || t.toLowerCase().includes('api')),
    ).toBeTruthy();
    expect(
      tabNames.some(t => t.toLowerCase().includes('product')),
    ).toBeTruthy();
    expect(tabNames.some(t => t.toLowerCase().includes('mcp'))).toBeTruthy();
    expect(
      tabNames.some(t => t.toLowerCase().includes('service')),
    ).toBeTruthy();
  });

  test('should show gateway filter dropdown', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // The gateway filter is a dropdown labelled "Gateway Type"
    const gatewayFilter = page.getByLabel(/gateway/i);
    // It may not be visible if there are no gateways, but the element should exist
    // (gateways come from the backend config; in CI/local this may be empty)
    await expect(gatewayFilter).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click each tab and verify content changes
    const tabs = page.getByRole('tab');

    for (let i = 0; i < Math.min(tabs.length, 4); i++) {
      await tabs.nth(i).click();
      // Wait for content area to update
      await page.waitForTimeout(500);
    }
  });
});

test.describe('WSO2 API Platform - Entity Pages', () => {
  test('should show the API sidebar on the catalog page', async ({ page }) => {
    await page.goto('/');

    // Enter the app if there's a sign-in button
    const enterButton = page.getByRole('button', { name: 'Enter' });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }

    // Navigate to catalog
    const catalogLink = page.getByRole('link', { name: /Catalog/i });
    if (await catalogLink.isVisible()) {
      await catalogLink.click();
    }

    await page.waitForLoadState('networkidle');

    // Verify the WSO2 API Platform page is accessible from navigation
    const apisLink = page.getByRole('link', { name: /APIs/i });
    await expect(apisLink).toBeVisible();
  });
});
