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

import { ApiEntity } from '@backstage/catalog-model';
import { Wso2ApiProduct } from './types';
import { GlobalSettings } from '../settings/types';
import {
  normalizeEntityName,
  reconstructGatewayEndpoints,
} from '../api';

/**
 * Maps a WSO2 API Product to a Backstage ApiEntity.
 */
export function mapWso2ProductToEntity(
  product: Wso2ApiProduct,
  namespace: string,
  providerId: string,
  globalSettings: GlobalSettings | undefined,
): ApiEntity {
  const nameWithVersion = product.version ? `${product.name}-${product.version}` : product.name;
  const normalizedName = normalizeEntityName(nameWithVersion);
  const productOperations = getProductOperations(product.apis);
  const productLifecycle = getProductLifecycle(product);

  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
      name: normalizedName,
      namespace,
      title: product.displayName || product.name,
      description: product.description || `WSO2 API Product: ${product.name}`,
      annotations: {
        'backstage.io/managed-by-location': `wso2-apim:${providerId}`,
        'backstage.io/managed-by-origin-location': `wso2-apim:${providerId}`,
        'wso2.com/api-id': product.id,
        'wso2.com/api-name': product.name,
        'wso2.com/api-version': product.version,
        'wso2.com/api-context': product.context,
        'wso2.com/api-provider': product.provider,
        'wso2.com/api-type': 'API_PRODUCT',
        'wso2.com/api-lifecycle-status': productLifecycle,
        'wso2.com/api-gateway': product.gatewayVendor || '',
        'wso2.com/is-discovered':
          product.initiatedFromGateway === true ? 'true' : 'false',
        'wso2.com/is-api-product': 'true',
        'wso2.com/gateway-endpoints': reconstructGatewayEndpoints(
          product,
          globalSettings,
        ),
        'wso2.com/product-resources': product.apis
          ? JSON.stringify(product.apis)
          : '[]',
        'wso2.com/api-throttling-policy': product.apiThrottlingPolicy || '',
        'wso2.com/api-visibility': product.visibility || '',
        'wso2.com/api-transports': Array.isArray(product.transport)
          ? JSON.stringify(product.transport)
          : '[]',
        'wso2.com/api-security-scheme': product.securityScheme
          ? JSON.stringify(product.securityScheme)
          : '',
        'wso2.com/api-authorization-header': product.authorizationHeader || '',
        'wso2.com/api-key-header': product.apiKeyHeader || '',
        'wso2.com/api-max-tps':
          product.maxTps !== undefined ? String(product.maxTps) : '',
        'wso2.com/policies': Array.isArray(product.policies)
          ? JSON.stringify(product.policies)
          : '[]',
        'wso2.com/api-level-policies': product.apiPolicies
          ? JSON.stringify(product.apiPolicies)
          : '{}',
        'wso2.com/operation-level-policies': JSON.stringify(productOperations),
      },
      tags: [
        ...(product.tags || []),
        ...(product.initiatedFromGateway ? ['wso2-discovered'] : []),
      ],
    },
    spec: {
      type: 'api_product',
      lifecycle: 'production',
      owner:
        'wso2',
      definition: product.definition || `WSO2 API Product: ${product.name}`,
    },
  } as ApiEntity;
}

function getProductLifecycle(product: Wso2ApiProduct): string {
  return (
    product.state ||
    product.status ||
    product.lifeCycleStatus ||
    product.lifecycleStatus ||
    product.lifecycleState ||
    ''
  );
}

function getProductOperations(apis: Wso2ApiProduct['apis']): any[] {
  if (!Array.isArray(apis)) return [];

  return apis.flatMap(api => {
    const operations = Array.isArray(api?.operations) ? api.operations : [];
    return operations.map((operation: any) => ({
      ...operation,
      apiName: api?.name,
      apiVersion: api?.version,
      apiId: api?.apiId,
    }));
  });
}
