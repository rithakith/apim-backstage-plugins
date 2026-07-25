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

import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { wso2ApiPlatformApiRef } from '../../../../api';

const API_POLICY_DETAILS_ANNOTATION = 'wso2.com/api-level-policies';
const API_OPERATIONS_ANNOTATION = 'wso2.com/operation-level-policies';

function parseAnnotationJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const useWso2ApiPolicies = (options: {
  entity: Entity;
  apiId?: string;
  isApiPlatform: boolean;
}) => {
  const { entity, apiId, isApiPlatform } = options;
  const apiClient = useApi(wso2ApiPlatformApiRef);

  const details = useMemo(() => {
    const annotations = entity.metadata.annotations || {};
    const apiPolicies = parseAnnotationJson<any>(
      annotations[API_POLICY_DETAILS_ANNOTATION],
      undefined,
    );
    const operations = parseAnnotationJson<any[]>(
      annotations[API_OPERATIONS_ANNOTATION],
      [],
    );
    return { apiPolicies, operations };
  }, [entity.metadata.annotations]);

  const definitionState = useMemo(() => {
    const definition = entity.spec?.definition as string | undefined;
    if (!definition) return { value: null, loading: false };
    if (typeof definition === 'string' && definition.trim().startsWith('{')) {
      try {
        return { value: JSON.parse(definition), loading: false };
      } catch (e) {
        /* ignore */
      }
    }
    return { value: definition, loading: false };
  }, [entity.spec?.definition]);

  const gatewayOperations = useMemo(() => {
    if (details?.operations && details.operations.length > 0) {
      return details.operations;
    }
    const val = definitionState.value as any;
    if (!val) return [];
    return val.channels || val.operations || val.configuration?.spec?.operations || [];
  }, [definitionState.value, details?.operations]);

  const gatewayApiPolicies = useMemo(() => {
    if (details?.apiPolicies) return details.apiPolicies;
    const val = definitionState.value as any;
    if (!val) return [];
    return val.policies || val.configuration?.spec?.policies || [];
  }, [definitionState.value, details?.apiPolicies]);

  const revisionsState = useAsync(async () => {
    if (!apiId || isApiPlatform) return undefined;
    try {
      return await apiClient.getRevisions(apiId, {
        query: 'deployed:true',
      });
    } catch (e: any) {
      return null;
    }
  }, [apiClient, apiId, isApiPlatform]);

  const isPlaceholder = useMemo(() => {
    const val = definitionState.value;
    return (
      typeof val === 'string' &&
      (val.includes('WSO2 API Document content placeholder') ||
        val.includes('WSO2 Discovered API'))
    );
  }, [definitionState.value]);

  return {
    details,
    definition: definitionState.value,
    isDefinitionLoading: definitionState.loading,
    gatewayOperations,
    gatewayApiPolicies,
    isPlaceholder,
    isRevisionsLoading: revisionsState.loading,
  };
};
