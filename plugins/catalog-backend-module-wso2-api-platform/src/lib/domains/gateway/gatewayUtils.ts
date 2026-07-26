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

import { Wso2Client } from '../../client';
import { PlatformGateway } from './types';

/**
 * Discovers APIs directly from self-hosted gateways.
 */
export async function discoverWSO2PlatformGatewayApis(
  platformGateways: PlatformGateway[],
  client: Wso2Client,
): Promise<any[]> {
  const discoveredWso2PlatformGatewayApis: any[] = [];

  for (const gw of platformGateways) {
    if (gw.discoveryUrl) {
      try {
        const data = await client.getGatewayApis(
          gw.discoveryUrl,
          gw.discoveryAuth,
        );
        const wso2ApiPlatformGatewayApis =
          data.apis ||
          data.list ||
          data.items ||
          (Array.isArray(data) ? data : [data]) ||
          [];

        for (const gatewayApiItem of wso2ApiPlatformGatewayApis) {
          const gatewayApiId = gatewayApiItem.id;
          if (!gatewayApiId) continue;

          try {
            const detailData = await client.getGatewayApiDetail(
              gw.discoveryUrl,
              gatewayApiId,
              gw.discoveryAuth,
            );

            if (detailData.status !== 'success' || !detailData.api) {
              continue;
            }

            const gatewayApiDetails = detailData.api;

            const gatewayApi = {
              ...gatewayApiDetails,
              id: gatewayApiDetails.id,
              initiatedFromGateway: true,
              isDirectDiscovery: true,
              environmentName: gw.environmentName,
              environmentType: gw.environmentType,
              gatewayUrls: gw.urls,
              fullConfig: gatewayApiDetails.configuration,
            };

            const gwSpec = gatewayApiDetails.configuration.spec;
            gatewayApi.fetchedSwagger = JSON.stringify(gwSpec, null, 2);
            discoveredWso2PlatformGatewayApis.push(gatewayApi);
          } catch (err) {
            // Client already logs errors, continue to the next API
          }
        }
      } catch (error: any) {
        // Client already logs errors, continue to the next gateway
      }
    }
  }
  return discoveredWso2PlatformGatewayApis;
}
