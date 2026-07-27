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

import { Entity } from '@backstage/catalog-model';

/**
 * Checks if the entity is a WSO2 API based on the existence of the 'wso2.com/api-id' annotation.
 */
export const isWso2Api = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.['wso2.com/api-id']);

/**
 * Checks if the entity is an MCP server based on the 'wso2.com/is-mcp-server' annotation.
 */
export const isMcpEntity = (entity: Entity) =>
  entity.metadata.annotations?.['wso2.com/is-mcp-server'] === 'true';

/**
 * Checks if the entity is a WSO2 Service Catalog service.
 */
export const isServiceEntity = (entity: Entity) =>
  entity.metadata.annotations?.['wso2.com/is-service'] === 'true';

/**
 * Checks if the entity is a WSO2 API Product.
 */
export const isApiProductEntity = (entity: Entity) =>
  entity.metadata.annotations?.['wso2.com/is-api-product'] === 'true' ||
  entity.metadata.annotations?.['wso2.com/api-type'] === 'API_PRODUCT' ||
  entity.spec?.type === 'api_product';

/**
 * Builds the catalog header type text for WSO2 API entities.
 */
export const getWso2EntityHeaderType = (entity: Entity) => {
  if (isServiceEntity(entity)) {
    return 'service';
  }

  if (isMcpEntity(entity)) {
    return 'mcp';
  }

  if (isApiProductEntity(entity)) {
    return 'api product';
  }

  const apiType =
    entity.spec && 'type' in entity.spec ? entity.spec.type : undefined;
  return apiType
    ? `api — ${String(apiType).toLocaleLowerCase('en-US')}`
    : 'api';
};

/**
 * Checks if the entity has multiple component relations.
 */
export const hasMultipleComponentRelations = (entity: Entity) => {
  const componentRelations =
    entity.relations?.filter(
      r => r.type.includes('api') && r.targetRef.startsWith('component:'),
    ) || [];
  return componentRelations.length > 1;
};

/**
 * Quick and dirty GraphQL SDL formatter.
 */
export const formatGraphQL = (sdl: any): string => {
  if (!sdl) return '';
  if (typeof sdl !== 'string') {
    try {
      return JSON.stringify(sdl, null, 2);
    } catch (e) {
      return String(sdl);
    }
  }
  let workingSdl = sdl;
  if (workingSdl.includes('\\n')) {
    workingSdl = workingSdl.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  let indent = 0;
  let result = '';
  const lines = workingSdl.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (
      trimmedLine.length > 100 &&
      (trimmedLine.includes('{') || trimmedLine.includes('}'))
    ) {
      const parts = trimmedLine.split(/([{}])/);
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;
        if (trimmedPart === '{') {
          result += ' {\n';
          indent++;
          result += '  '.repeat(indent);
        } else if (trimmedPart === '}') {
          indent--;
          result = `${result.trimEnd()}\n${'  '.repeat(indent)}}\n${'  '.repeat(
            indent,
          )}`;
        } else {
          result += trimmedPart;
        }
      }
    } else {
      if (trimmedLine.includes('}')) indent = Math.max(0, indent - 1);
      result += `${'  '.repeat(indent)}${trimmedLine}\n`;
      if (trimmedLine.includes('{')) indent++;
    }
  }
  return result.replace(/\n\s*\n/g, '\n').trim();
};

/**
 * Helper to check if an API type is event-driven/async.
 */
export const isAsyncType = (type?: string) =>
  ['ASYNC', 'WS', 'SSE', 'WEBHOOK', 'WEBSUB'].includes(type || '');

export const formatLifecycleStatus = (status?: string) => {
  if (!status) {
    return status;
  }

  return status
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.toUpperCase())
    .join(' ');
};

/**
 * Quick and dirty AsyncAPI/YAML formatter.
 */
export const formatAsyncApi = (yaml: string): string => {
  if (!yaml) return yaml;
  let workingYaml = yaml;
  if (workingYaml.includes('\\n')) {
    workingYaml = workingYaml.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  try {
    if (workingYaml.trim().startsWith('{')) {
      const json = JSON.parse(workingYaml);
      return JSON.stringify(json, null, 2);
    }
  } catch (e) {
    // Not JSON
  }
  return workingYaml.trim();
};
