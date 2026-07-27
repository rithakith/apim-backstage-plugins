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
