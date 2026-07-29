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

export interface Config {
  wso2ApiPlatform?: {
    /**
     * Enables WSO2 API Manager integration.
     * Defaults to false.
     * @visibility frontend
     */
    enabled?: boolean;
    baseUrl: string;
    publisherBasePath: string;
    developerBasePath: string;
    serviceCatalogBasePath?: string;
    tls?: {
      rejectUnauthorized?: boolean;
    };
    auth: {
      tokenUrl?: string;
      /** @visibility secret */
      clientId: string;
      /** @visibility secret */
      clientSecret: string;
      /** @visibility secret */
      username?: string;
      /** @visibility secret */
      password?: string;
      additionalScopes?: string[];
    };
    /**
     * The timeout in seconds for the catalog synchronization polling.
     * @visibility frontend
     */
    catalogSyncTimeoutSeconds?: number;
  };
  /**
   * Configuration for self-hosted WSO2 API Platform Gateways.
   * @visibility frontend
   */
  wso2ApiPlatformGateway?: {
    /**
     * Enables WSO2 API Platform Gateway discovery.
     * Defaults to false.
     * @visibility frontend
     */
    enabled?: boolean;
    gateways?: Array<{
      name: string;
      urls: string[];
      /** @visibility frontend */
      discoveryUrl?: string;
      /** @visibility secret */
      discoveryUsername?: string;
      /** @visibility secret */
      discoveryPassword?: string;
      environmentType?: string;
      description?: string;
      organizationId?: string;
    }>;
  };
}
