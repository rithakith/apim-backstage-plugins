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
import { RouteContext } from './types';

export function registerApiRoutes(
  router: express.Router,
  { client, ensureAuthenticated, logger }: RouteContext,
) {
  router.post('/apis/:apiId/generate-key', async (req, res) => {
    logger.info(`Generating API key for API: ${req.params.apiId}`);
    try {
      await ensureAuthenticated(req);
      const apiId = req.params.apiId;
      const { keyName, keyType, validityPeriod, additionalProperties } =
        req.body;
      const result = await client.generateApiKey(apiId, {
        keyName,
        keyType,
        validityPeriod,
        additionalProperties,
      });
      res.json(result);
    } catch (e: any) {
      logger.error(
        `Failed to generate API key for ${req.params.apiId}: ${e.message}`,
      );
      res.status(500).json({ message: e.message });
    }
  });

  router.get('/apis/:apiId/revisions', async (req, res) => {
    const apiId = req.params.apiId;
    const query = (req.query.query as string) || undefined;
    try {
      const token = await ensureAuthenticated(req);
      const result = await client.getRevisions(apiId, { query, token });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });
}
