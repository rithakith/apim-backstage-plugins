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

import {
  isWso2Api,
  isMcpEntity,
  isApiProductEntity,
  getWso2EntityHeaderType,
  hasMultipleComponentRelations,
  formatGraphQL,
  isAsyncType,
  formatAsyncApi,
  formatLifecycleStatus,
} from './utils';
import { Entity } from '@backstage/catalog-model';

describe('wso2-api-platform utils', () => {
  describe('isWso2Api', () => {
    it('should return true if wso2.com/api-id annotation is present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-api',
          annotations: {
            'wso2.com/api-id': 'api-12345',
          },
        },
        spec: { type: 'openapi' },
      };
      const res = isWso2Api(entity);
      expect(res).toBe(true);

    });

    it('should return false if wso2.com/api-id annotation is missing', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-api',
          annotations: {
            'other-annotation': 'xyz',
          },
        },
        spec: { type: 'openapi' },
      };
      expect(isWso2Api(entity)).toBe(false);
    });

    it('should return false if annotations are completely missing', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-api',
        },
        spec: { type: 'openapi' },
      };
      expect(isWso2Api(entity)).toBe(false);
    });
  });

  describe('isMcpEntity', () => {
    it('should return true if wso2.com/is-mcp-server is "true"', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'mcp-server',
          annotations: {
            'wso2.com/is-mcp-server': 'true',
          },
        },
        spec: { type: 'openapi' },
      };
      const res = isMcpEntity(entity);
      expect(res).toBe(true);

    });

    it('should return false if wso2.com/is-mcp-server is "false"', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'mcp-server',
          annotations: {
            'wso2.com/is-mcp-server': 'false',
          },
        },
        spec: { type: 'openapi' },
      };
      expect(isMcpEntity(entity)).toBe(false);
    });

    it('should return false if annotation is missing', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'mcp-server',
        },
        spec: { type: 'openapi' },
      };
      expect(isMcpEntity(entity)).toBe(false);
    });
  });

  describe('isApiProductEntity', () => {
    it('should return true for API Product annotations', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'product',
          annotations: {
            'wso2.com/is-api-product': 'true',
          },
        },
        spec: { type: 'api_product' },
      };

      expect(isApiProductEntity(entity)).toBe(true);
    });

    it('should return false for standard APIs', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'standard-api',
          annotations: {
            'wso2.com/api-type': 'HTTP',
          },
        },
        spec: { type: 'http' },
      };

      expect(isApiProductEntity(entity)).toBe(false);
    });
  });

  describe('getWso2EntityHeaderType', () => {
    it('should use MCP as the header type for MCP server entities', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'mcp-server',
          annotations: {
            'wso2.com/is-mcp-server': 'true',
            'wso2.com/api-type': 'MCP',
          },
        },
        spec: { type: 'mcp' },
      };

      expect(getWso2EntityHeaderType(entity)).toBe('mcp');
    });

    it('should use API Product as the header type for API Product entities', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'product',
          annotations: {
            'wso2.com/api-type': 'API_PRODUCT',
          },
        },
        spec: { type: 'api_product' },
      };

      expect(getWso2EntityHeaderType(entity)).toBe('api product');
    });

    it('should keep the existing API type format for standard APIs', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'standard-api',
        },
        spec: { type: 'http' },
      };

      expect(getWso2EntityHeaderType(entity)).toBe('api — http');
    });
  });

  describe('formatLifecycleStatus', () => {
    it('should normalize lifecycle status text for display', () => {
      expect(formatLifecycleStatus('PUBLISHED')).toBe('PUBLISHED');
      expect(formatLifecycleStatus('created')).toBe('CREATED');
      expect(formatLifecycleStatus('PENDING_APPROVAL')).toBe('PENDING APPROVAL');
      expect(formatLifecycleStatus('BLOCKED-STATE')).toBe('BLOCKED STATE');
      expect(formatLifecycleStatus(undefined)).toBeUndefined();
    });
  });

  describe('hasMultipleComponentRelations', () => {
    it('should return false if entity.relations is missing or empty', () => {
      const entity1: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: { name: 'test' },
        spec: { type: 'openapi' },
      };
      const entity2: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: { name: 'test' },
        relations: [],
        spec: { type: 'openapi' },
      };
      expect(hasMultipleComponentRelations(entity1)).toBe(false);
      expect(hasMultipleComponentRelations(entity2)).toBe(false);
    });

    it('should return false if there is only one component api relation', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: { name: 'test' },
        relations: [
          {
            type: 'api',
            targetRef: 'component:default/my-component',
          },
          {
            type: 'owner',
            targetRef: 'group:default/team-a',
          },
        ],
        spec: { type: 'openapi' },
      };
      expect(hasMultipleComponentRelations(entity)).toBe(false);
    });

    it('should return true if there are multiple component api relations', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: { name: 'test' },
        relations: [
          {
            type: 'api',
            targetRef: 'component:default/comp-1',
          },
          {
            type: 'api',
            targetRef: 'component:default/comp-2',
          },
        ],
        spec: { type: 'openapi' },
      };
      const res = hasMultipleComponentRelations(entity);
      expect(res).toBe(true);

    });
  });

  describe('formatGraphQL', () => {
    it('should return empty string for null/undefined/empty input', () => {
      expect(formatGraphQL(null)).toBe('');
      expect(formatGraphQL(undefined)).toBe('');
      expect(formatGraphQL('')).toBe('');
    });

    it('should return JSON.stringify output if input is an object', () => {
      const obj = { query: 'hello' };
      expect(formatGraphQL(obj)).toBe(JSON.stringify(obj, null, 2));
    });

    it('should fallback to String(sdl) if object stringify throws', () => {
      const obj: any = {};
      obj.self = obj; // Circular reference throws
      expect(formatGraphQL(obj)).toBe('[object Object]');
    });

    it('should format escaped newlines in SDL', () => {
      const input = 'type Query {\\n  hello: String\\n}';
      const expected = 'type Query {\n  hello: String\n}';
      expect(formatGraphQL(input)).toBe(expected);
    });

    it('should format complex multiline SDL with brackets and indentation', () => {
      const input = `
        type User {
          id: ID!
          name: String
          address {
            street: String
            city: String
          }
        }
      `;
      const result = formatGraphQL(input);
      expect(result).toContain('type User {');
      expect(result).toContain('  id: ID!');
      expect(result).toContain('  address {');
      expect(result).toContain('    street: String');
    });
  });

  describe('isAsyncType', () => {
    it('should return true for known async api types', () => {
      expect(isAsyncType('ASYNC')).toBe(true);
      expect(isAsyncType('WS')).toBe(true);
      expect(isAsyncType('SSE')).toBe(true);
      expect(isAsyncType('WEBHOOK')).toBe(true);
      expect(isAsyncType('WEBSUB')).toBe(true);

    });

    it('should return false for HTTP/REST and undefined/null type', () => {
      expect(isAsyncType('HTTP')).toBe(false);
      expect(isAsyncType('REST')).toBe(false);
      expect(isAsyncType(undefined)).toBe(false);
      expect(isAsyncType('')).toBe(false);
    });
  });

  describe('formatAsyncApi', () => {
    it('should return input if it is empty/falsy', () => {
      expect(formatAsyncApi('')).toBe('');
      expect(formatAsyncApi(null as any)).toBe(null as any);
    });

    it('should handle JSON content and format it nicely', () => {
      const input = '{"asyncapi":"2.0.0","info":{"title":"My API"}}';
      const result = formatAsyncApi(input);
      const parsed = JSON.parse(result);
      expect(parsed.asyncapi).toBe('2.0.0');
      expect(result).toContain('  "asyncapi": "2.0.0"');
    });
  });
});
