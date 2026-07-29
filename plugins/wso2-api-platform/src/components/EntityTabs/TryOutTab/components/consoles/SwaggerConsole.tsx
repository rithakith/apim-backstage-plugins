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

import { MutableRefObject } from 'react';
// @ts-ignore
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Wso2ApiDetail } from '../../../../../api';

interface SwaggerConsoleProps {
  swaggerSpec: any;
  tryOutPlugin: any;
  apiKeyRef: MutableRefObject<string | null>;
  externalApiKey: string;
  apiKeyAuthPolicy: any;
  details?: Wso2ApiDetail;
}

export const SwaggerConsole = ({
  swaggerSpec,
  tryOutPlugin,
  apiKeyRef,
  externalApiKey,
  apiKeyAuthPolicy,
  details,
}: SwaggerConsoleProps) => {
  const defaultApiKeyHeader =
    details?.type?.toUpperCase() === 'SOAP' ? 'ApiKey' : 'apikey';

  return (
    <SwaggerUI
      spec={swaggerSpec}
      plugins={[tryOutPlugin]}
      supportedSubmitMethods={[
        'get',
        'put',
        'post',
        'delete',
        'options',
        'head',
        'patch',
        'trace',
      ]}
      requestInterceptor={(req: any) => {
        const currentKey = apiKeyRef.current;
        if (currentKey !== null) {
          const headerName = details?.apiKeyHeader || defaultApiKeyHeader;
          req.headers[headerName] = currentKey;
        }
        if (externalApiKey && apiKeyAuthPolicy) {
          const { in: location, key } = apiKeyAuthPolicy.params || {};
          if (location === 'header') {
            req.headers[key || 'x-api-key'] = externalApiKey;
          } else if (location === 'query') {
            const separator = req.url.includes('?') ? '&' : '?';
            req.url = `${req.url}${separator}${
              key || 'api-key'
            }=${encodeURIComponent(externalApiKey)}`;
          }
        }
        return req;
      }}
    />
  );
};
