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
import { renderHook, waitFor } from '@testing-library/react';
import { useWso2ApiPolicies } from './useApiPolicies';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn().mockReturnValue({}),
}));

describe('useWso2ApiPolicies', () => {
  const mockApiClient = {
    getRevisions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApi as jest.Mock).mockReturnValue(mockApiClient);
  });

  it('should parse policies and operations from annotations', async () => {
    const entity = {
      metadata: {
        annotations: {
          'wso2.com/api-level-policies': JSON.stringify({ policy1: 'test' }),
          'wso2.com/operation-level-policies': JSON.stringify([
            { op: 'testOp' },
          ]),
        },
      },
      spec: { definition: '{}' },
    } as any;

    const { result } = renderHook(() =>
      useWso2ApiPolicies({ entity, isApiPlatform: true }),
    );

    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));

    expect(result.current.details.apiPolicies).toEqual({ policy1: 'test' });
    expect(result.current.details.operations).toEqual([{ op: 'testOp' }]);
  });

  it('should fallback to definition operations if annotations missing', async () => {
    const entity = {
      metadata: { annotations: {} },
      spec: {
        definition: JSON.stringify({
          operations: [{ fallbackOp: 'testFallback' }],
        }),
      },
    } as any;

    const { result } = renderHook(() =>
      useWso2ApiPolicies({ entity, isApiPlatform: true }),
    );

    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));
    expect(result.current.gatewayOperations).toEqual([
      { fallbackOp: 'testFallback' },
    ]);
  });

  it('should detect placeholder definition string', async () => {
    const entity = {
      metadata: { annotations: {} },
      spec: {
        definition: 'WSO2 API Document content placeholder: something else',
      },
    } as any;

    const { result } = renderHook(() =>
      useWso2ApiPolicies({ entity, isApiPlatform: true }),
    );

    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));
    expect(result.current.isPlaceholder).toBe(true);
  });

  it('should fetch revisions if apiId is provided and not apiPlatform', async () => {
    const entity = { metadata: { annotations: {} }, spec: {} } as any;
    mockApiClient.getRevisions.mockResolvedValue({ list: [] });

    const { result } = renderHook(() =>
      useWso2ApiPolicies({ entity, apiId: '123', isApiPlatform: false }),
    );

    expect(result.current.isRevisionsLoading).toBe(true);
    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));
    expect(mockApiClient.getRevisions).toHaveBeenCalledWith('123', {
      query: 'deployed:true',
    });
  });
});
