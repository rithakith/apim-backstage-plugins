/*
 * Copyright 2026 WSO2 LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  fetchApiDefinition,
  fetchApiDocuments,
  fetchApiDetail,
  fetchApiList,
  fetchApiWsdl,
} from './apiUtils';

describe('api/apiUtils', () => {
  const mockClient = {
    getPublisherBasePath: jest.fn().mockReturnValue('/api/am/publisher/v3'),
    getApiDefinition: jest.fn(),
    getApiDocuments: jest.fn(),
    getApiWsdl: jest.fn(),
    getApiDetail: jest.fn(),
    getApiList: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchApiDefinition', () => {
    it('should delegate to client.getApiDefinition', async () => {
      mockClient.getApiDefinition.mockResolvedValueOnce('mock-def');
      const result = await fetchApiDefinition(
        mockClient,
        'api-123',
        'HTTP',
        'MyAPI',
      );
      expect(result).toBe('mock-def');
      expect(mockClient.getApiDefinition).toHaveBeenCalledWith(
        'api-123',
        'HTTP',
        'MyAPI',
      );
    });
  });

  describe('fetchApiWsdl', () => {
    it('should delegate to client.getApiWsdl', async () => {
      mockClient.getApiWsdl.mockResolvedValueOnce('mock-wsdl');
      const result = await fetchApiWsdl(mockClient, 'api-123');
      expect(result).toBe('mock-wsdl');
      expect(mockClient.getApiWsdl).toHaveBeenCalledWith('api-123');
    });
  });

  describe('fetchApiDocuments', () => {
    it('should delegate to client.getApiDocuments', async () => {
      mockClient.getApiDocuments.mockResolvedValueOnce(['doc-1']);
      const result = await fetchApiDocuments(mockClient, 'api-123');
      expect(result).toEqual(['doc-1']);
      expect(mockClient.getApiDocuments).toHaveBeenCalledWith('api-123');
    });
  });

  describe('fetchApiDetail', () => {
    it('should delegate to client.getApiDetail', async () => {
      const summary = { id: 'api-123', name: 'MyAPI', type: 'HTTP' };
      mockClient.getApiDetail.mockResolvedValueOnce({ ...summary, detail: true });
      const result = await fetchApiDetail(mockClient, summary);
      expect(result).toEqual({ ...summary, detail: true });
      expect(mockClient.getApiDetail).toHaveBeenCalledWith(summary);
    });
  });

  describe('fetchApiList', () => {
    it('should fetch all APIs and enrich each with detailed metadata', async () => {
      const mockApisList = {
        list: [
          { id: 'api-1', name: 'API-1', type: 'HTTP' },
          { id: 'api-2', name: 'API-2', type: 'WS' },
        ],
        pagination: { total: 2 },
      };

      mockClient.getApiList.mockResolvedValueOnce(mockApisList);
      mockClient.getApiDetail.mockImplementation(async (summary: any) => {
        return { ...summary, enriched: true };
      });

      const result = await fetchApiList(mockClient);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'api-1',
          enriched: true,
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 'api-2',
          enriched: true,
        }),
      );

      expect(mockClient.getApiList).toHaveBeenCalledWith({ limit: 1000, offset: 0 });
    });

    it('should page through APIs beyond the first 1000 results', async () => {
      const firstPage = Array.from({ length: 1000 }, (_, index) => ({
        id: `api-${index + 1}`,
        name: `API-${index + 1}`,
        type: 'HTTP',
      }));
      const secondPage = [{ id: 'api-1001', name: 'API-1001', type: 'HTTP' }];

      mockClient.getApiList.mockImplementation(async (options: any) => {
        if (options.offset === 0) {
          return { list: firstPage, pagination: { total: 1001 } };
        }
        if (options.offset === 1000) {
          return { list: secondPage, pagination: { total: 1001 } };
        }
        throw new Error(`Unexpected request offset: ${options.offset}`);
      });

      mockClient.getApiDetail.mockImplementation(async (summary: any) => {
        return { ...summary, enriched: true };
      });

      const result = await fetchApiList(mockClient);

      expect(result).toHaveLength(1001);
      expect(result[1000]).toEqual(
        expect.objectContaining({
          id: 'api-1001',
          enriched: true,
        }),
      );
      expect(mockClient.getApiList).toHaveBeenNthCalledWith(
        1,
        { limit: 1000, offset: 0 },
      );
      expect(mockClient.getApiList).toHaveBeenNthCalledWith(
        2,
        { limit: 1000, offset: 1000 },
      );
    });

    it('should report list fetch failures through progress callback', async () => {
      const onProgress = jest.fn();
      mockClient.getApiList.mockRejectedValueOnce(new Error('Publisher timeout'));

      await expect(
        fetchApiList(mockClient, { onProgress }),
      ).rejects.toThrow('Publisher timeout');

      expect(onProgress).toHaveBeenLastCalledWith({
        loaded: 0,
        total: undefined,
        message: 'Failed to load Publisher API list: Publisher timeout',
      });
    });
  });
});
