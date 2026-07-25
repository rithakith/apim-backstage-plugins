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

import express from 'express';
import Router from 'express-promise-router';
import {
  AuthService,
  HttpAuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import type { CatalogService } from '@backstage/plugin-catalog-node';

import { Wso2ApiPlatformClient, readWso2ApiPlatformConfig } from './client';
import { registerApiRoutes } from './routes/apiRoutes';
import { registerConfigRoutes } from './routes/configRoutes';
import { registerStreamingRoutes } from './routes/streamingRoutes';
import { registerGatewayRoutes } from './routes/gatewayRoutes';
import { RouteContext } from './routes/types';

export interface RouterOptions {
  auth?: AuthService;
  catalog?: CatalogService;
  logger: LoggerService;
  httpAuth: HttpAuthService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, httpAuth, config } = options;
  const wso2Config = readWso2ApiPlatformConfig(config);
  const client = new Wso2ApiPlatformClient({
    config: wso2Config,
    rawConfig: config,
    logger,
  });

  async function ensureAuthenticated(
    req: express.Request,
  ): Promise<string | undefined> {
    await httpAuth.credentials(req, { allow: ['user'] });

    return req.headers['x-wso2-access-token'] as string | undefined;
  }

  const router = Router();
  router.use(express.json({ limit: '10mb' }));

  const routeContext: RouteContext = {
    client,
    ensureAuthenticated,
    logger,
  };

  registerConfigRoutes(router, routeContext);
  registerApiRoutes(router, routeContext);
  registerStreamingRoutes(router, routeContext);
  registerGatewayRoutes(router, routeContext);

  logger.info('WSO2 API Manager backend router initialized');
  return router;
}
