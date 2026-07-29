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

/** @jest-environment jsdom */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiKeyGenerator } from './useApiKeyGenerator';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn().mockReturnValue({}),
  alertApiRef: { id: 'alertApiRef' },
}));

describe('useApiKeyGenerator', () => {
  const mockApiClient = {
    generateApiKey: jest.fn(),
  };
  const mockAlertApi = {
    post: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApi as jest.Mock).mockImplementation(apiRef => {
      if (apiRef === alertApiRef) return mockAlertApi;
      return mockApiClient;
    });
  });

  it('should initially not fetch key until triggered', async () => {
    const { result } = renderHook(() =>
      useApiKeyGenerator({ apiId: '123', isApiPlatform: false }),
    );

    await waitFor(() => expect(result.current.isKeyLoading).toBe(false));

    expect(result.current.apiKey).toBeNull();
    expect(result.current.isKeyLoading).toBe(false);
    expect(mockApiClient.generateApiKey).not.toHaveBeenCalled();
  });

  it('should generate key when refreshKey is called', async () => {
    mockApiClient.generateApiKey.mockResolvedValue({
      apikey: 'test-key',
      validityPeriod: 3600,
    });

    const { result } = renderHook(() =>
      useApiKeyGenerator({ apiId: '123', isApiPlatform: false }),
    );

    act(() => {
      result.current.refreshKey('custom-name');
    });

    expect(result.current.isKeyLoading).toBe(true);
    expect(result.current.customKeyName).toBe('custom-name');

    await waitFor(() => expect(result.current.isKeyLoading).toBe(false));

    expect(result.current.isKeyLoading).toBe(false);
    expect(result.current.apiKey).toBe('test-key');
    expect(result.current.expiresIn).toBe(3600);
    // Initial fetch should not trigger alert
    expect(mockAlertApi.post).not.toHaveBeenCalled();
  });

  it('should trigger alert on subsequent refreshes', async () => {
    mockApiClient.generateApiKey
      .mockResolvedValueOnce({ apikey: 'test-key-1' })
      .mockResolvedValueOnce({ apikey: 'test-key-2' });

    const { result } = renderHook(() =>
      useApiKeyGenerator({ apiId: '123', isApiPlatform: false }),
    );

    act(() => {
      result.current.refreshKey();
    });
    await waitFor(() => expect(result.current.apiKey).toBe('test-key-1'));

    expect(result.current.apiKey).toBe('test-key-1');
    expect(mockAlertApi.post).not.toHaveBeenCalled(); // First time no alert

    // Refresh again
    act(() => {
      result.current.refreshKey();
    });
    await waitFor(() => expect(result.current.apiKey).toBe('test-key-2'));

    expect(result.current.apiKey).toBe('test-key-2');
    expect(mockAlertApi.post).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'API Key refreshed',
        severity: 'success',
      }),
    );
  });

  it('should handle API errors gracefully', async () => {
    mockApiClient.generateApiKey.mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() =>
      useApiKeyGenerator({ apiId: '123', isApiPlatform: false }),
    );

    act(() => {
      result.current.refreshKey();
    });
    await waitFor(() => expect(result.current.generateKeyError).toBe(true));

    expect(result.current.apiKey).toBeNull();
    expect(result.current.generateKeyError).toBe(true);
  });

  it('should allow applying a manual key', async () => {
    const { result } = renderHook(() =>
      useApiKeyGenerator({ apiId: '123', isApiPlatform: false }),
    );

    await waitFor(() => expect(result.current.isKeyLoading).toBe(false));

    act(() => {
      result.current.applyManualKey('my-manual-key');
    });

    expect(result.current.apiKey).toBe('my-manual-key');
    expect(result.current.expiresIn).toBeNull();
  });
});
