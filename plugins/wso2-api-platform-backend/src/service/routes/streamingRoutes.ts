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
import { pipeWebStreamToResponse } from './streamUtils';

export function registerStreamingRoutes(
  router: express.Router,
  { client, logger }: RouteContext,
) {
  router.get('/apis/:apiId/wsdl', async (req, res) => {
    const { apiId } = req.params;
    logger.debug(`[WSO2-Backend] WSDL request received for API: ${apiId}`);
    try {
      logger.debug(
        `[WSO2-Backend] Fetching WSDL stream from APIM for API: ${apiId}`,
      );
      const response = await client.getApiWsdlStream(apiId);

      logger.debug(
        `[WSO2-Backend] APIM responded with status: ${response.status} for API WSDL: ${apiId}`,
      );
      if (!response.ok) {
        let errBody = '';
        try {
          errBody = await response.text();
        } catch {
          errBody = response.statusText;
        }
        logger.error(
          `[WSO2-Backend] Failed to fetch WSDL from APIM for API ${apiId}: status ${response.status}, error: ${errBody}`,
        );
        res.status(response.status).send(errBody);
        return;
      }

      const contentType =
        response.headers.get('content-type') || 'application/xml';
      const disposition =
        response.headers.get('content-disposition') ||
        `attachment; filename="${apiId}-wsdl"`;

      logger.debug(
        `[WSO2-Backend] WSDL content info for ${apiId} - Content-Type: ${contentType}, Content-Disposition: ${disposition}`,
      );

      if (contentType) res.setHeader('Content-Type', contentType);
      if (disposition) res.setHeader('Content-Disposition', disposition);

      if (!response.body) {
        logger.warn(
          `[WSO2-Backend] WSDL response body is empty for API: ${apiId}`,
        );
        res.status(204).send();
        return;
      }

      logger.debug(
        `[WSO2-Backend] Streaming WSDL content to client for API: ${apiId}`,
      );
      pipeWebStreamToResponse({
        body: response.body,
        res,
        errorMessage: 'Error streaming WSDL content',
        logMessage: `[WSO2-Backend] Stream reading error for API ${apiId}`,
        logger,
      });
    } catch (e: any) {
      logger.error(
        `[WSO2-Backend] Failed to stream WSDL content for API ${apiId}: ${e.message}`,
        e,
      );
      res.status(500).send(e.message);
    }
  });

  router.get('/apis/:apiId/documents/:documentId/content', async (req, res) => {
    const { apiId, documentId } = req.params;
    try {
      const response = await client.getDocumentContentStream(apiId, documentId);

      if (!response.ok) {
        if (response.status === 404) {
          const docData = await client.getDocument(apiId, documentId);
          if (
            docData &&
            (docData.sourceType === 'INLINE' ||
              docData.sourceType === 'MARKDOWN')
          ) {
            const inlineText = docData.inlineContent || '';
            const isMarkdown = docData.sourceType === 'MARKDOWN';
            res.setHeader(
              'Content-Type',
              isMarkdown ? 'text/markdown' : 'text/plain',
            );
            res.setHeader(
              'Content-Disposition',
              `attachment; filename="${docData.name || 'document'}.${
                isMarkdown ? 'md' : 'txt'
              }"`,
            );
            res.send(inlineText);
            return;
          }
        }
        let errBody = '';
        try {
          errBody = await response.text();
        } catch {
          errBody = response.statusText;
        }
        res.status(response.status).send(errBody);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      const disposition = response.headers.get('content-disposition');

      if (!response.body) {
        res.status(204).send();
        return;
      }

      if (contentType.includes('application/json')) {
        const json = (await response.json()) as any;
        const content = json.inlineContent || JSON.stringify(json, null, 2);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader(
          'Content-Disposition',
          disposition || `attachment; filename="document-${documentId}.txt"`,
        );
        res.send(content);
        return;
      }

      if (contentType) res.setHeader('Content-Type', contentType);
      if (disposition) res.setHeader('Content-Disposition', disposition);
      pipeWebStreamToResponse({
        body: response.body,
        res,
        errorMessage: 'Error streaming document content',
        logMessage: 'Stream reading error',
        logger,
      });
    } catch (e: any) {
      logger.error(`Failed to stream document content: ${e.message}`, e);
      res.status(500).send(e.message);
    }
  });
}
