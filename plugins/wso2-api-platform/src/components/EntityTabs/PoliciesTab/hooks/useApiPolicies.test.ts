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
