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

import { mapWso2ProductToEntity } from './mapperUtils';
import {
  fetchApiProductDefinition,
  fetchApiProductDetail,
  fetchApiProductList,
} from './productUtils';
import { mockServices } from '@backstage/backend-test-utils';
import { Wso2ApiProduct } from './types';

describe('product domain', () => {
  const formatTestCaseDoc = (details: string) => {
    return `\n================================================================================\nTEST CASE: ${
      expect.getState().currentTestName
    }\n================================================================================\n${details.trim()}\n================================================================================\n`;
  };

  const logger = mockServices.logger.mock();
  const mockClient = {
    getPublisherBasePath: jest.fn().mockReturnValue('/api/am/publisher/v3'),
    getApiProductDefinition: jest.fn(),
    getApiProductDetail: jest.fn(),
    getApiProductList: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapWso2ProductToEntity', () => {
    it('should map a raw API Product into a Backstage API Entity with full fields', () => {
      const product: Wso2ApiProduct = {
        id: 'prod-123',
        name: 'Super Product',
        displayName: 'Super API Product',
        description: 'Unified billing and telemetry API Product',
        version: '1.0',
        context: 'billing',
        provider: 'billing-team',
        state: 'PUBLISHED',
        gatewayVendor: 'wso2',
        initiatedFromGateway: true,
        businessInformation: {
          businessOwner: 'Alice',
          businessOwnerEmail: 'alice@company.com',
          technicalOwner: 'Bob',
          technicalOwnerEmail: 'bob@company.com',
        },
        apiThrottlingPolicy: 'Bronze',
        visibility: 'PUBLIC',
        transport: ['http'],
        tags: ['finance', 'billing'],
        definition: 'openapi: 3.0.0...',
        policies: ['DefaultSubscriptionless'],
        securityScheme: ['api_key'],
        authorizationHeader: 'Authorization',
        apiKeyHeader: 'ApiKey',
        maxTps: 100,
        apiPolicies: {
          request: [{ policyName: 'addHeader', policyVersion: 'v1' }],
        },
        apis: [
          {
            apiId: 'api-1',
            name: 'Billing API',
            version: '1.0',
            operations: [
              {
                target: '/invoices',
                verb: 'GET',
                operationPolicies: {
                  request: [
                    { policyName: 'addQueryParam', policyVersion: 'v1' },
                  ],
                  response: [],
                  fault: [],
                },
              },
            ],
          },
        ],
      };

      const entity = mapWso2ProductToEntity(
        product,
        'my-namespace',
        'my-provider',
        undefined,
      );

      expect(entity).toEqual({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'super-product-1-0',
          namespace: 'my-namespace',
          title: 'Super API Product',
          description: 'Unified billing and telemetry API Product',
          annotations: {
            'backstage.io/managed-by-location': 'wso2-apim:my-provider',
            'backstage.io/managed-by-origin-location': 'wso2-apim:my-provider',
            'wso2.com/api-id': 'prod-123',
            'wso2.com/api-name': 'Super Product',
            'wso2.com/api-version': '1.0',
            'wso2.com/api-context': 'billing',
            'wso2.com/api-provider': 'billing-team',
            'wso2.com/api-type': 'API_PRODUCT',
            'wso2.com/api-lifecycle-status': 'PUBLISHED',
            'wso2.com/api-gateway': 'wso2',
            'wso2.com/is-discovered': 'true',
            'wso2.com/is-api-product': 'true',
            'wso2.com/gateway-endpoints': '[]',
            'wso2.com/product-resources': JSON.stringify(product.apis),
            'wso2.com/business-owner': 'Alice',
            'wso2.com/business-owner-email': 'alice@company.com',
            'wso2.com/technical-owner': 'Bob',
            'wso2.com/technical-owner-email': 'bob@company.com',
            'wso2.com/api-throttling-policy': 'Bronze',
            'wso2.com/api-visibility': 'PUBLIC',
            'wso2.com/api-transports': JSON.stringify(['http']),
            'wso2.com/api-security-scheme': JSON.stringify(['api_key']),
            'wso2.com/api-authorization-header': 'Authorization',
            'wso2.com/api-key-header': 'ApiKey',
            'wso2.com/api-max-tps': '100',
            'wso2.com/policies': JSON.stringify([
              'DefaultSubscriptionless',
            ]),
            'wso2.com/api-level-policies': JSON.stringify({
              request: [{ policyName: 'addHeader', policyVersion: 'v1' }],
            }),
            'wso2.com/operation-level-policies': JSON.stringify([
              {
                target: '/invoices',
                verb: 'GET',
                operationPolicies: {
                  request: [
                    { policyName: 'addQueryParam', policyVersion: 'v1' },
                  ],
                  response: [],
                  fault: [],
                },
                apiName: 'Billing API',
                apiVersion: '1.0',
                apiId: 'api-1',
              },
            ]),
          },
          tags: ['finance', 'billing', 'wso2-discovered'],
        },
        spec: {
          type: 'api_product',
          lifecycle: 'production',
          owner: 'Bob',
          definition: 'openapi: 3.0.0...',
        },
      });

      console.log(
        formatTestCaseDoc(`
=== [Product Mapper: API Product Mapping (Published)] ===
Product name: "${entity.metadata.name}"
Spec lifecycle: "${entity.spec.lifecycle}"
Spec owner: "${entity.spec.owner}" (from technicalOwner)
`),
      );
    });

    it('should fallback to businessOwner, provider, and unknown for owner, and production lifecycle', () => {
      // 1. Fallback to businessOwner
      const prod1: Wso2ApiProduct = {
        id: '1',
        name: 'p1',
        version: '1',
        context: 'c',
        provider: 'p',
        businessInformation: { businessOwner: 'Alice Business' },
      };
      const ent1 = mapWso2ProductToEntity(
        prod1,
        'default',
        'prov',
        undefined,
      );
      expect(ent1.spec.owner).toBe('Alice Business');
      expect(ent1.spec.lifecycle).toBe('production');

      // 2. Fallback to provider
      const prod2: Wso2ApiProduct = {
        id: '2',
        name: 'p2',
        version: '1',
        context: 'c',
        provider: 'p-team',
      };
      const ent2 = mapWso2ProductToEntity(
        prod2,
        'default',
        'prov',
        undefined,
      );
      expect(ent2.spec.owner).toBe('p-team');

      // 3. Fallback to unknown
      const prod3 = {
        id: '3',
        name: 'p3',
        version: '1',
        context: 'c',
      } as unknown as Wso2ApiProduct;
      const ent3 = mapWso2ProductToEntity(
        prod3,
        'default',
        'prov',
        undefined,
      );
      expect(ent3.spec.owner).toBe('unknown');

      console.log(
        formatTestCaseDoc(`
=== [Product Mapper: API Product Spec Fallbacks] ===
Fallback 1: owner="${ent1.spec.owner}" (businessOwner)
Fallback 2: owner="${ent2.spec.owner}" (provider)
Fallback 3: owner="${ent3.spec.owner}" (unknown)
`),
      );
    });

    it('should map alternate API Product lifecycle status casing', () => {
      const product: Wso2ApiProduct = {
        id: 'prod-456',
        name: 'Alternate Lifecycle Product',
        version: '1.0',
        context: '/alternate',
        provider: 'product-team',
        lifecycleStatus: 'PUBLISHED',
      };

      const entity = mapWso2ProductToEntity(
        product,
        'my-namespace',
        'my-provider',
        undefined,
      );

      expect(
        entity.metadata.annotations?.['wso2.com/api-lifecycle-status'],
      ).toBe('PUBLISHED');
    });

    it('should map API Product state into lifecycle status annotation', () => {
      const product: Wso2ApiProduct = {
        id: 'prod-789',
        name: 'State Lifecycle Product',
        version: 'v1',
        context: '/prod2',
        provider: 'admin',
        state: 'PUBLISHED',
      };

      const entity = mapWso2ProductToEntity(
        product,
        'my-namespace',
        'my-provider',
        undefined,
      );

      expect(
        entity.metadata.annotations?.['wso2.com/api-lifecycle-status'],
      ).toBe('PUBLISHED');
    });
  });

  describe('fetchApiProductDefinition', () => {
    it('should delegate to client.getApiProductDefinition', async () => {
      const mockSwagger = 'swagger-def';
      mockClient.getApiProductDefinition.mockResolvedValueOnce(mockSwagger);

      const result = await fetchApiProductDefinition(mockClient, logger, 'prod-1', 'MyProduct');
      expect(result).toBe(mockSwagger);
      expect(mockClient.getApiProductDefinition).toHaveBeenCalledWith('prod-1', 'MyProduct');
    });
  });

  describe('fetchApiProductDetail', () => {
    it('should delegate to client.getApiProductDetail', async () => {
      const summary = { id: 'prod-1', name: 'MyProduct' };
      const detail = { ...summary, enriched: true };
      mockClient.getApiProductDetail.mockResolvedValueOnce(detail);

      const result = await fetchApiProductDetail(mockClient, logger, summary);
      expect(result).toEqual(detail);
      expect(mockClient.getApiProductDetail).toHaveBeenCalledWith(summary);
    });
  });

  describe('fetchApiProductList', () => {
    it('should fetch list and enrich each api product', async () => {
      const mockList = {
        list: [
          { id: 'prod-1', name: 'Prod-1' },
          { id: 'prod-2', name: 'Prod-2' },
        ],
      };

      mockClient.getApiProductList.mockResolvedValueOnce(mockList);
      mockClient.getApiProductDetail.mockImplementation(async (summary: any) => ({
        ...summary,
        enriched: true,
      }));

      const result = await fetchApiProductList(mockClient, logger);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ id: 'prod-1', enriched: true }));
      expect(result[1]).toEqual(expect.objectContaining({ id: 'prod-2', enriched: true }));
      expect(mockClient.getApiProductList).toHaveBeenCalled();
      expect(mockClient.getApiProductDetail).toHaveBeenCalledTimes(2);
    });

    it('should log error and throw on outer list fetch error', async () => {
      mockClient.getApiProductList.mockRejectedValueOnce(new Error('List failure'));

      await expect(fetchApiProductList(mockClient, logger)).rejects.toThrow('List failure');
    });
  });
});
