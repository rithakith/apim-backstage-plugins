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
import { useTryOutData } from './useTryOutData';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn().mockReturnValue({}),
}));

describe('useTryOutData', () => {
  const mockApiClient = {
    getRevisions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApi as jest.Mock).mockReturnValue(mockApiClient);
    // Default: resolve with undefined so useAsync settles without revisions
    mockApiClient.getRevisions.mockResolvedValue(undefined);
  });

  it('should parse basic try-out data from annotations', async () => {
    const entity = {
      metadata: {
        annotations: {
          'wso2.com/api-type': 'HTTP',
          'wso2.com/policies': '["policy-1"]',
          'wso2.com/api-endpoints': JSON.stringify([
            { environmentName: 'PROD', url: 'https://test.com' },
          ]),
        },
      },
      spec: { definition: '{}' },
    } as any;

    const { result } = renderHook(() =>
      useTryOutData({ entity, isApiPlatform: true }),
    );

    // Wait for the internal useAsync to settle so no state update leaks
    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));

    expect(result.current.details?.type).toBe('HTTP');
    expect(result.current.details?.policies).toEqual(['policy-1']);
    expect(result.current.gatewayUrls).toEqual([
      {
        description: 'PROD',
        environmentName: 'PROD',
        environmentType: undefined,
        url: 'https://test.com',
      },
    ]);
  });

  it('should build swagger spec and inject gateway urls as servers', async () => {
    const entity = {
      metadata: {
        annotations: {
          'wso2.com/api-type': 'HTTP',
          'wso2.com/api-endpoints': JSON.stringify([
            { environmentName: 'PROD', url: 'https://test.com' },
          ]),
        },
      },
      spec: {
        definition: JSON.stringify({
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {},
        }),
      },
    } as any;

    const { result } = renderHook(() =>
      useTryOutData({ entity, isApiPlatform: true }),
    );

    // Wait for the internal useAsync to settle
    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));

    expect(result.current.swaggerSpec).toBeDefined();
    expect(result.current.swaggerSpec.servers).toEqual([
      { description: 'PROD', url: 'https://test.com' },
    ]);
  });

  it('should consider discovered APIs deployed if gateway URLs exist', async () => {
    const entity = {
      metadata: {
        annotations: {
          'wso2.com/api-type': 'HTTP',
          'wso2-gateway.com/api-id': 'gw-123',
          'wso2-gateway.com/api-endpoints': JSON.stringify([
            { environmentName: 'PROD', url: 'https://test.com' },
          ]),
        },
      },
      spec: { definition: '{}' },
    } as any;

    const { result } = renderHook(() =>
      useTryOutData({ entity, isApiPlatform: true }),
    );

    // Wait for the internal useAsync to settle
    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));

    expect(result.current.isDeployed).toBe(true);
  });

  it('should consider publisher APIs deployed only if revisions exist', async () => {
    const entity = {
      metadata: {
        annotations: {
          'wso2.com/api-type': 'HTTP',
        },
      },
      spec: { definition: '{}' },
    } as any;

    mockApiClient.getRevisions.mockResolvedValue({ list: [{ id: 'rev-1' }] });

    const { result } = renderHook(() =>
      useTryOutData({ entity, apiId: 'api-123', isApiPlatform: false }),
    );

    // Initially false before revisions load
    expect(result.current.isDeployed).toBe(false);

    // waitFor already wraps in act internally
    await waitFor(() => expect(result.current.isDeployed).toBe(true));
  });

  it('should correctly format GraphQL source', async () => {
    const entity = {
      metadata: {
        annotations: {
          'wso2.com/api-type': 'GRAPHQL',
        },
      },
      spec: {
        definition: 'type Query { hello: String }',
      },
    } as any;

    const { result } = renderHook(() =>
      useTryOutData({ entity, isApiPlatform: true }),
    );

    // Wait for the internal useAsync to settle
    await waitFor(() => expect(result.current.isRevisionsLoading).toBe(false));

    // Should format standard GraphQL schema instead of JSON stringify
    expect(result.current.formattedSource).toContain('type Query');
  });
});
