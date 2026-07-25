import { Entity } from '@backstage/catalog-model';
import type { Wso2Service } from './types';
import { normalizeEntityName } from '../api';

export function mapWso2ServiceToEntity(
  service: Wso2Service,
  namespace: string,
  providerId: string,
): Entity {
  const entityName = normalizeEntityName(service.name || 'unknown');
  const serviceDetails = service as Wso2Service & {
    lifeCycleStatus?: string;
    lifecycleStatus?: string;
    lifecycleState?: string;
    provider?: string;
  };
  const lifecycleStatus =
    serviceDetails.lifeCycleStatus ||
    serviceDetails.lifecycleStatus ||
    serviceDetails.lifecycleState ||
    '';

  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
      name: entityName,
      namespace,
      title: service.name,
      description: service.description || `Service ${service.name}`,
      annotations: {
        'wso2.com/is-service': 'true',
        'wso2.com/service-id': service.id || '',
        'wso2.com/service-name': service.name || '',
        'wso2.com/service-version': service.version || '',
        'wso2.com/service-key': service.serviceKey || '',
        'wso2.com/service-url': service.serviceUrl || '',
        'wso2.com/service-definition-type': service.definitionType || '',
        'wso2.com/service-security-type': service.securityType || '',
        'wso2.com/service-mutual-ssl-enabled':
          service.mutualSSLEnabled === undefined
            ? ''
            : String(service.mutualSSLEnabled),
        'wso2.com/service-usage-count':
          service.usage === undefined ? '' : String(service.usage),
        'wso2.com/service-created-time': service.createdTime || '',
        'wso2.com/service-last-updated-time': service.lastUpdatedTime || '',
        'wso2.com/service-md5': service.md5 || '',
        'wso2.com/service-definition-url': service.definitionUrl || '',
        'wso2.com/api-id': service.id || '',
        'wso2.com/api-name': service.name || '',
        'wso2.com/api-version': service.version || '',
        'wso2.com/api-context': service.serviceUrl || '',
        'wso2.com/api-provider': serviceDetails.provider || '',
        'wso2.com/api-type': 'SERVICE',
        'wso2.com/api-lifecycle-status': lifecycleStatus,
        'wso2.com/api-gateway': '',
        'wso2.com/service-usage-list': JSON.stringify(
          service.usageList || [],
        ),
        'backstage.io/managed-by-location': `wso2-apim:${providerId}`,
        'backstage.io/managed-by-origin-location': `wso2-apim:${providerId}`,
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: normalizeEntityName(serviceDetails.provider || 'wso2'),
      definition:
        service.rawDefinition ||
        service.description ||
        'WSO2 Service Definition placeholder',
    },
  };
}
