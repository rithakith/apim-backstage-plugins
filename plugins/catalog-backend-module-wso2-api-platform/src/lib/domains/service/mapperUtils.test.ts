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

import { mapWso2ServiceToEntity } from './mapperUtils';
import { Wso2Service } from './types';

describe('mapWso2ServiceToEntity', () => {
  it('maps a WSO2 service into a catalog API entity with common table annotations', () => {
    const service: Wso2Service = {
      id: 'svc-1',
      name: 'Inventory Service',
      description: 'Inventory service definition',
      version: '1.0.0',
      serviceKey: 'Inventory-Service-1.0.0',
      serviceUrl: 'https://services.example.com/inventory',
      definitionType: 'OAS',
      securityType: 'NONE',
      mutualSSLEnabled: false,
      usage: 2,
      createdTime: '2026-06-04 06:10:55.497',
      lastUpdatedTime: '2026-06-04 06:10:55.497',
      md5: '{"hash":"abc","algorithm":"SHA-256"}',
      definitionUrl: 'https://services.example.com/inventory/openapi.yaml',
    };

    const entity = mapWso2ServiceToEntity(service, 'wso2', 'default');

    expect(entity).toEqual(
      expect.objectContaining({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: expect.objectContaining({
          name: 'inventory-service',
          namespace: 'wso2',
          title: 'Inventory Service',
          description: 'Inventory service definition',
          annotations: expect.objectContaining({
            'wso2.com/is-service': 'true',
            'wso2.com/service-id': 'svc-1',
            'wso2.com/service-name': 'Inventory Service',
            'wso2.com/service-version': '1.0.0',
            'wso2.com/service-key': 'Inventory-Service-1.0.0',
            'wso2.com/service-url':
              'https://services.example.com/inventory',
            'wso2.com/service-definition-type': 'OAS',
            'wso2.com/service-security-type': 'NONE',
            'wso2.com/service-mutual-ssl-enabled': 'false',
            'wso2.com/service-usage-count': '2',
            'wso2.com/service-created-time': '2026-06-04 06:10:55.497',
            'wso2.com/service-last-updated-time':
              '2026-06-04 06:10:55.497',
            'wso2.com/service-md5': '{"hash":"abc","algorithm":"SHA-256"}',
            'wso2.com/service-definition-url':
              'https://services.example.com/inventory/openapi.yaml',
            'wso2.com/api-id': 'svc-1',
            'wso2.com/api-name': 'Inventory Service',
            'wso2.com/api-version': '1.0.0',
            'wso2.com/api-context':
              'https://services.example.com/inventory',
            'wso2.com/api-type': 'SERVICE',
            'wso2.com/api-lifecycle-status': '',
            'backstage.io/managed-by-location': 'wso2-apim:default',
            'backstage.io/managed-by-origin-location': 'wso2-apim:default',
          }),
        }),
        spec: expect.objectContaining({
          type: 'service',
          lifecycle: 'production',
          owner: 'wso2',
          definition: 'Inventory service definition',
        }),
      }),
    );
  });
});
