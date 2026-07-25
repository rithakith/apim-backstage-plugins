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

export interface VHost {
  host: string;
  basePath?: string;
  httpContext?: string;
  httpPort?: number | null;
  httpsPort?: number | null;
  wsPort?: number | null;
  wsHost?: string;
  wssPort?: number | null;
  wssHost?: string;
  websubHttpPort?: number | null;
  websubHttpsPort?: number | null;
}

export interface EnvironmentEndpoint {
  url?: string;
  endpointURL?: string;
}

export interface Environment {
  id?: string;
  name: string;
  displayName?: string;
  type?: string;
  gatewayType?: string;
  mode?: string;
  serverUrl?: string | null;
  provider?: string;
  showInApiConsole?: boolean;
  vhosts?: VHost[];
  endpoints?: EnvironmentEndpoint[];
  endpointURIs?: unknown[];
  additionalProperties?: { key: string; value: string }[];
  permissions?: {
    permissionType: string;
    roles: string[];
  };
}

export interface GlobalSettings {
  devportalUrl?: string;
  environment?: Environment[];
  gatewayTypes?: string[];
  gatewayFeatureCatalog?: {
    gatewayFeatures: Record<string, unknown>;
    apiTypes: Record<string, string[]>;
  };
  scopes?: string[];
  monetizationAttributes?: unknown[];
  subscriberContactAttributes?: { recipient: string; delimiter: string }[];
  securityAuditProperties?: Record<string, unknown>;
  externalStoresEnabled?: boolean;
  docVisibilityEnabled?: boolean;
  portalConfigurationOnlyModeEnabled?: boolean;
  retryCallWithNewOAuthTokenEnabled?: boolean;
  crossTenantSubscriptionEnabled?: boolean;
  defaultAdvancePolicy?: string;
  defaultSubscriptionPolicy?: string;
  authorizationHeader?: string;
  isJWTEnabledForLoginTokens?: boolean;
  orgAccessControlEnabled?: boolean;
  allowSubscriptionValidationDisabling?: boolean;
  designAssistantEnabled?: boolean;
  aiAuthTokenProvided?: boolean;
  isGatewayNotificationEnabled?: boolean;
  isMCPSupportEnabled?: boolean;
  customProperties?: unknown[];
}
