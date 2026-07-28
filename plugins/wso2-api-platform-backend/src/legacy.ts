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
import { Config } from '@backstage/config';
import {
  BackstageCredentials,
  BackstagePrincipalTypes,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export interface LegacyIdentityApi {
  getIdentity(options: { request: express.Request }): Promise<unknown>;
}

export interface LegacyRouterOptions {
  logger: LoggerService;
  config: Config;
  /**
   * Legacy Backstage backends commonly expose this as env.identity.
   */
  identity?: LegacyIdentityApi;
  /**
   * Optional hook for apps with custom auth middleware.
   */
  authenticate?: (req: express.Request) => Promise<void>;
}

function getUserEntityRef(identity: unknown): string {
  if (identity && typeof identity === 'object') {
    const userEntityRef = (identity as { userEntityRef?: unknown })
      .userEntityRef;
    if (typeof userEntityRef === 'string') {
      return userEntityRef;
    }
  }

  return 'user:default/unknown';
}

function createLegacyCredentials<
  TAllowed extends keyof BackstagePrincipalTypes = 'unknown',
>(
  userEntityRef: string,
): BackstageCredentials<BackstagePrincipalTypes[TAllowed]> {
  return {
    $$type: '@backstage/BackstageCredentials',
    principal: {
      type: 'user',
      userEntityRef,
    },
  } as BackstageCredentials<BackstagePrincipalTypes[TAllowed]>;
}

/**
 * Creates the WSO2 API Manager router for legacy Backstage backends.
 *
 * Modern backends should use the default backend plugin export instead:
 * backend.add(import('@wso2/backstage-plugin-wso2-api-platform-backend')).
 */
export async function createLegacyRouter(
  options: LegacyRouterOptions,
): Promise<express.Router> {
  const { logger, config, identity, authenticate } = options;

  return createRouter({
    logger,
    config,
    httpAuth: {
      credentials: async (req, credentialsOptions) => {
        if (
          credentialsOptions?.allow &&
          !credentialsOptions.allow.includes('user' as any)
        ) {
          throw new Error(
            'Legacy authentication only supports user credentials',
          );
        }

        let userEntityRef = 'user:default/unknown';
        if (authenticate) {
          await authenticate(req);
          return createLegacyCredentials(userEntityRef);
        }

        if (identity) {
          const legacyIdentity = await identity.getIdentity({ request: req });
          userEntityRef = getUserEntityRef(legacyIdentity);
          return createLegacyCredentials(userEntityRef);
        }

        if (!req.header('authorization')) {
          throw new Error('Missing Backstage authorization header');
        }

        return createLegacyCredentials(userEntityRef);
      },
      issueUserCookie: async () => {
        throw new Error('User cookies are not supported in legacy backends');
      },
    },
  });
}
