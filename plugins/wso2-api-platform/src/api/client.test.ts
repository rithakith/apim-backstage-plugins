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

import { Wso2ApiPlatformClient } from './client';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

describe('Wso2ApiPlatformClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockFetchApi: jest.Mocked<FetchApi>;
  let client: Wso2ApiPlatformClient;

  beforeEach(() => {
    mockDiscoveryApi = {
      getBaseUrl: jest
        .fn()
        .mockResolvedValue('https://wso2-api-platform.backend'),
    } as any;

    mockFetchApi = {
      fetch: jest.fn(),
    } as any;

    client = new Wso2ApiPlatformClient({
      discoveryApi: mockDiscoveryApi,
      fetchApi: mockFetchApi,
    });
  });

  describe('request helper and generateApiKey', () => {
    it('should perform a POST request with correct URL, body, and headers', async () => {
      const mockResult = { key: 'secret-key-123' };
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResult)),
      } as any);

      const result = await client.generateApiKey('api-123', {
        keyName: 'test-key',
        keyType: 'PRODUCTION',
        validityPeriod: 345600,
        additionalProperties: {
          permittedIP: '192.168.1.1',
          permittedReferer: '',
        },
      });

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith(
        'wso2-api-platform',
      );
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'https://wso2-api-platform.backend/apis/api-123/generate-key',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyName: 'test-key',
            keyType: 'PRODUCTION',
            validityPeriod: 345600,
            additionalProperties: {
              permittedIP: '192.168.1.1',
              permittedReferer: '',
            },
          }),
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('should encode API ids before building generate-key URLs', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest
          .fn()
          .mockResolvedValueOnce(JSON.stringify({ key: 'secret' })),
      } as any);

      await client.generateApiKey('api/id with spaces');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'https://wso2-api-platform.backend/apis/api%2Fid%20with%20spaces/generate-key',
        expect.anything(),
      );
    });

    it('should throw an error if the response is not ok', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValueOnce('Invalid key request format'),
      } as any);

      await expect(client.generateApiKey('api-123')).rejects.toThrow(
        'WSO2 API request failed [400]: Invalid key request format',
      );
    });

    it('should return empty object if response is empty', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(''),
      } as any);

      const result = await client.generateApiKey('api-123');
      expect(result).toEqual({});
    });

    it('should throw parse error if JSON is malformed', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce('{invalid-json'),
      } as any);

      await expect(client.generateApiKey('api-123')).rejects.toThrow(
        'Failed to parse WSO2 API response: {invalid-json',
      );
    });
  });

  describe('getRevisions', () => {
    it('should call revisions endpoint with token and query parameters', async () => {
      const mockResult = { list: [{ id: 'rev-1' }] };
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResult)),
      } as any);

      const result = await client.getRevisions('api-123', {
        query: 'status:active',
        token: 'user-token',
      });

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'https://wso2-api-platform.backend/apis/api-123/revisions?query=status%3Aactive',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-WSO2-Access-Token': 'user-token',
          },
        }),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getGateways', () => {
    it('should return arrays from endpoint successfully', async () => {
      const mockResult = [{ name: 'Production Gateway' }];
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResult)),
      } as any);

      const result = await client.getGateways('user-token');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'https://wso2-api-platform.backend/gateways',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-WSO2-Access-Token': 'user-token',
          },
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('should return fallback empty array if response is not an array', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest
          .fn()
          .mockResolvedValueOnce(JSON.stringify({ notAnArray: true })),
      } as any);

      const result = await client.getGateways();
      expect(result).toEqual([]);
    });
  });

  describe('getRuntimeConfig', () => {
    it('should fetch runtime config', async () => {
      const mockResult = {
        apiManager: { enabled: true },
        platformGateway: { enabled: true, gatewayCount: 1 },
      };
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResult)),
      } as any);

      const result = await client.getRuntimeConfig('user-token');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'https://wso2-api-platform.backend/config',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-WSO2-Access-Token': 'user-token',
          },
        }),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getApiWsdl operations', () => {

    it('should getApiWsdl successfully', async () => {
      const mockBlob = {};
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        blob: jest.fn().mockResolvedValueOnce(mockBlob),
      } as any);

      const result = await client.getApiWsdl('api-123', 'user-token');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'https://wso2-api-platform.backend/apis/api-123/wsdl',
        expect.objectContaining({
          headers: {
            'X-WSO2-Access-Token': 'user-token',
          },
        }),
      );
      expect(result).toBe(mockBlob);
    });

    it('should throw error on getApiWsdl failure', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockRejectedValueOnce(new Error('fail text')),
      } as any);

      await expect(client.getApiWsdl('api-123')).rejects.toThrow(
        'WSO2 API request failed [400]: Bad Request',
      );
    });
  });
});
