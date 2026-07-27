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
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, viewTechDocRouteRef } from './routes';

export const wso2ApiPlatformPlugin = createPlugin({
  id: 'wso2-api-platform',
  routes: {
    root: rootRouteRef,
  },
  externalRoutes: {
    viewTechDoc: viewTechDocRouteRef,
  },
});

export const Wso2ApiPlatformPage = wso2ApiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'Wso2ApiPlatformPage',
    component: () =>
      import('./components/ApiManagerPage').then(m => m.Wso2ApiPlatformPage),
    mountPoint: rootRouteRef,
  }),
);
