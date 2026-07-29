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

export type Wso2GatewayInfo = {
  name?: string;
  displayName?: string;
  gatewayType: string;
};

export type Wso2ApiSummary = {
  id: string;
  name: string;
  displayName?: string;
  entityName?: string;
  namespace?: string;
  version?: string;
  provider?: string;
  context?: string;
  lifeCycleStatus?: string;
  type?: string;
  isDiscovered?: boolean;
  source?: string;
  gateways?: Wso2GatewayInfo[];
};
export type Wso2ApiProductSummary = {
  id: string;
  name: string;
  displayName?: string;
  entityName?: string;
  namespace?: string;
  version?: string;
  provider?: string;
  context?: string;
  lifeCycleStatus?: string;
  type?: string;
  isDiscovered?: boolean;
  gateways?: Wso2GatewayInfo[];
};

export type Wso2ApiProductOperation = {
  target: string;
  verb: string;
};

export type Wso2ApiProductResource = {
  apiId: string;
  name: string;
  version: string;
  operations: Wso2ApiProductOperation[];
};

export type Wso2ApiProductDetail = Wso2ApiProductSummary & {
  description?: string;
  apis: Wso2ApiProductResource[];
};

export type Wso2McpTool = {
  name: string;
  description?: string;
  authType?: string;
  throttlingPolicy?: string;
  schemaDefinition?: string;
  backendOperation?: {
    target?: string;
    verb?: string;
  };
  version?: string;
};

export type Wso2McpSummary = {
  id: string;
  name: string;
  namespace?: string;
  version?: string;
  provider?: string;
  context?: string;
  lifeCycleStatus?: string;
  lifecycleStatus?: string;
  lifecycleState?: string;
  description?: string;
  throttlingPolicy?: string;
  transport?: string[];
  visibility?: string;
  policies?: string[];
  securityScheme?: string[];
  maxTps?: number;
  authorizationHeader?: string;
  apiKeyHeader?: string;
  gateways?: Wso2GatewayInfo[];
};

export type Wso2McpDetail = Wso2McpSummary & {
  description?: string;
};

export type Wso2ApiDetail = Wso2ApiSummary & {
  description?: string;
  endpointURLs?: Array<{
    environmentName?: string;
    environmentType?: string;
    urls?: string[];
  }>;
  businessInformation?: {
    businessOwner?: string;
    businessOwnerEmail?: string;
    technicalOwner?: string;
    technicalOwnerEmail?: string;
  };
  apiThrottlingPolicy?: string;
  visibility?: string;
  transport?: string[];
  apiPolicies?: {
    request?: any[];
    response?: any[];
    fault?: any[];
  };
  operations?: any[];
  accessControlAllowHeaders?: string[];
  corsConfiguration?: {
    corsConfigurationEnabled?: boolean;
    accessControlAllowOrigins?: string[];
    accessControlAllowCredentials?: boolean;
    accessControlAllowHeaders?: string[];
    accessControlAllowMethods?: string[];
  };
  policies?: string[];
  securityScheme?: string[];
  apiKeyHeader?: string;
  authorizationHeader?: string;
};

export type Wso2ApiDocument = {
  id: string;
  name: string;
  summary?: string;
  sourceType?: string;
  sourceUrl?: string;
  documentId?: string;
  type?: string;
};

export type Wso2ApiDocumentType =
  | 'HOWTO'
  | 'SAMPLES'
  | 'PUBLIC_FORUM'
  | 'SUPPORT_FORUM'
  | 'OTHER'
  | 'SWAGGER_DOC';
export type Wso2ApiDocumentSourceType = 'INLINE' | 'URL' | 'FILE' | 'MARKDOWN';
export type Wso2ApiRevision = {
  id: string;
  displayName: string;
  description?: string;
  createdTime?: string;
  deploymentInfo?: Array<{
    name: string;
    type: string;
    deployedTime: string;
  }>;
};

export type Wso2ApiRevisionsResponse = {
  count: number;
  list: Wso2ApiRevision[];
};

export type Wso2HealthStatus = 'Online' | 'Offline';

export type Wso2HealthReport = {
  apim: {
    status: Wso2HealthStatus;
  };
  platform: Array<{
    name: string;
    status: Wso2HealthStatus;
    type: string;
  }>;
  configs: Array<{
    name: string;
    status: Wso2HealthStatus;
  }>;
};

export type Wso2ApiPlatformRuntimeConfig = {
  apiManager: {
    enabled: boolean;
  };
  platformGateway: {
    enabled: boolean;
    gatewayCount: number;
  };
};

export type Wso2GenerateApiKeyOptions = {
  keyName?: string;
  keyType?: string;
  validityPeriod?: number;
  additionalProperties?: {
    permittedIP?: string;
    permittedReferer?: string;
  };
};

export interface Wso2ApiPlatformApi {
  generateApiKey(
    apiId: string,
    options?: Wso2GenerateApiKeyOptions,
  ): Promise<any>;
  getRevisions(
    apiId: string,
    options?: { query?: string; token?: string },
  ): Promise<Wso2ApiRevisionsResponse>;
  getGateways(token?: string): Promise<any[]>;
  getRuntimeConfig(token?: string): Promise<Wso2ApiPlatformRuntimeConfig>;
  getApiWsdl(apiId: string, token?: string): Promise<Blob>;
}
