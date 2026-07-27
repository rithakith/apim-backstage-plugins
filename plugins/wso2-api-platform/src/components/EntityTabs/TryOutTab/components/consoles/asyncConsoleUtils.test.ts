/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import {
  getAsyncVerbColors,
  getHeaderFlags,
  isApiKeyAuthEnabled,
  normalizeAsyncOperations,
  useGatewaySelection,
  useCopiedIndex,
  usePaginatedOperations,
  useExpandedOperations,
  useAsyncAuthHeaders,
} from './asyncConsoleUtils';

describe('asyncConsoleUtils', () => {
  describe('getAsyncVerbColors', () => {
    it('returns green colors for SUB/SUBSCRIBE', () => {
      expect(getAsyncVerbColors('SUB')).toEqual({
        main: '#49cc90',
        light: 'rgba(73, 204, 144, 0.05)',
      });
      expect(getAsyncVerbColors('SUBSCRIBE')).toEqual({
        main: '#49cc90',
        light: 'rgba(73, 204, 144, 0.05)',
      });
    });

    it('returns blue colors for other verbs', () => {
      expect(getAsyncVerbColors('PUB')).toEqual({
        main: '#61affe',
        light: 'rgba(97, 175, 254, 0.05)',
      });
      expect(getAsyncVerbColors('')).toEqual({
        main: '#61affe',
        light: 'rgba(97, 175, 254, 0.05)',
      });
    });
  });

  describe('getHeaderFlags', () => {
    it('formats headers into curl-style flags', () => {
      const headers = [
        { name: 'Auth', value: 'Bearer 123' },
        { name: 'Accept', value: 'application/json' },
      ];
      expect(getHeaderFlags(headers)).toBe(
        "-H 'Auth: Bearer 123' -H 'Accept: application/json'",
      );
    });
  });

  describe('isApiKeyAuthEnabled', () => {
    it('returns true if details has api_key in securityScheme', () => {
      expect(
        isApiKeyAuthEnabled({ securityScheme: ['API_KEY'] } as any, null),
      ).toBe(true);
    });

    it('returns true if apiKeyAuthPolicy is provided', () => {
      expect(isApiKeyAuthEnabled({} as any, { name: 'test' } as any)).toBe(
        true,
      );
    });

    it('returns false otherwise', () => {
      expect(isApiKeyAuthEnabled(undefined, null)).toBe(false);
    });
  });

  describe('normalizeAsyncOperations', () => {
    it('returns empty array if no operations and no fallback', () => {
      expect(normalizeAsyncOperations(null, 'PUB')).toEqual([]);
    });

    it('uses fallback path if operations empty', () => {
      expect(normalizeAsyncOperations(null, 'PUB', '/ws')).toEqual([
        { verb: 'PUB', path: '/ws', target: '/ws' },
      ]);
    });

    it('normalizes object operations', () => {
      const ops = {
        '/test': { publish: true },
        '/test2': { subscribe: true },
      };
      expect(normalizeAsyncOperations(ops, 'PUB')).toEqual([
        { verb: 'PUB', path: '/test', target: '/test' },
        { verb: 'SUB', path: '/test2', target: '/test2' },
      ]);
    });
  });

  describe('useGatewaySelection', () => {
    it('selects the first url by default', () => {
      const urls = [
        { url: 'http://gw1', environmentName: 'e1' },
        { url: 'http://gw2', environmentName: 'e2' },
      ];
      const { result } = renderHook(() => useGatewaySelection(urls));
      expect(result.current.selectedUrl).toBe('http://gw1');
    });

    it('allows updating the selected url', () => {
      const urls = [{ url: 'http://gw1', environmentName: 'e1' }];
      const { result } = renderHook(() => useGatewaySelection(urls));
      act(() => {
        result.current.setSelectedUrl('http://gw2');
      });
      expect(result.current.selectedUrl).toBe('http://gw2');
    });
  });

  describe('useCopiedIndex', () => {
    it('temporarily marks an index as copied', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useCopiedIndex());
      expect(result.current.copiedIndex).toBeNull();

      act(() => {
        result.current.markCopied(2);
      });
      expect(result.current.copiedIndex).toBe(2);

      act(() => {
        jest.runAllTimers();
      });
      expect(result.current.copiedIndex).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('usePaginatedOperations', () => {
    it('paginates correctly', () => {
      const ops = [1, 2, 3, 4, 5];
      const { result } = renderHook(() => usePaginatedOperations(ops, 2));

      expect(result.current.paginatedOperations).toEqual([1, 2]);
      expect(result.current.totalPages).toBe(3);

      act(() => {
        result.current.setCurrentPage(3);
      });
      expect(result.current.paginatedOperations).toEqual([5]);
    });
  });

  describe('useExpandedOperations', () => {
    it('defaults index 0 to expanded', () => {
      const { result } = renderHook(() => useExpandedOperations());
      expect(result.current.isExpanded(0)).toBe(true);
      expect(result.current.isExpanded(1)).toBe(false);

      act(() => {
        result.current.toggleExpanded(1);
      });
      expect(result.current.isExpanded(1)).toBe(true);
    });
  });

  describe('useAsyncAuthHeaders', () => {
    it('uses Bearer token by default when preferApiKeyHeader is false and key is null', () => {
      const apiKeyRef = { current: null };
      const { result } = renderHook(() =>
        useAsyncAuthHeaders({
          apiKeyRef,
          externalApiKey: '',
          apiKeyAuthPolicy: null,
          refreshToken: 0,
        }),
      );

      expect(result.current).toEqual([
        { name: 'Authorization', value: 'Bearer undefined' },
      ]);
    });

    it('uses api key header when preferApiKeyHeader is true', () => {
      const apiKeyRef = { current: 'token123' };
      const { result } = renderHook(() =>
        useAsyncAuthHeaders({
          apiKeyRef,
          externalApiKey: '',
          apiKeyAuthPolicy: null,
          refreshToken: 0,
          preferApiKeyHeader: true,
        }),
      );

      expect(result.current).toEqual([{ name: 'apikey', value: 'token123' }]);
    });
  });
});
