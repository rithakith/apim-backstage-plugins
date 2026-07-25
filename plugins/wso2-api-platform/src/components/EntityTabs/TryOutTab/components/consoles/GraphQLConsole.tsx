/*
 * Copyright 2026 WSO2 LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useMemo, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { GraphiQL } from 'graphiql';
import { buildSchema } from 'graphql';
import 'graphiql/graphiql.css';
import { Wso2ApiDetail } from '../../../../../api';

const useStyles = makeStyles((theme: any) => ({
  '@global': {
    ...(theme.palette.type === 'dark'
      ? {
          'body .graphiql-container, body .CodeMirror-info, body .CodeMirror-lint-tooltip, body reach-portal': {
            '--color-primary': '338, 100%, 67%',
            '--color-secondary': '243, 100%, 77%',
            '--color-tertiary': '188, 100%, 44%',
            '--color-info': '208, 100%, 72%',
            '--color-success': '158, 100%, 42%',
            '--color-warning': '30, 100%, 80%',
            '--color-error': '13, 100%, 58%',
            '--color-neutral': '219, 29%, 78%',
            '--color-base': '219, 29%, 18%',
            '--popover-box-shadow': 'none',
            '--popover-border': '1px solid hsl(var(--color-neutral))',
          },
        }
      : {}),
  },
}));

interface GraphQLConsoleProps {
  definition: string;
  gatewayUrls: Array<{ environmentName: string; url: string; environmentType?: string; description?: string }>;
  apiKeyRef: React.MutableRefObject<string | null>;
  externalApiKey: string;
  apiKeyAuthPolicy: any;
  isDeployed?: boolean;
  details?: Wso2ApiDetail;
}

export const GraphQLConsole = ({
  definition,
  gatewayUrls,
  apiKeyRef,
  externalApiKey,
  apiKeyAuthPolicy,
  isDeployed = true,
  details,
}: GraphQLConsoleProps) => {
  const [selectedUrl, setSelectedUrl] = useState('');
  useStyles();

  // Initialize selected URL
  useEffect(() => {
    if (gatewayUrls && gatewayUrls.length > 0) {
      setSelectedUrl(gatewayUrls[0].url);
    }
  }, [gatewayUrls]);

  const activeUrl = selectedUrl;

  const fetcher = useMemo(() => {
    if (!activeUrl) return null;
    return async (graphQLParams: any) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const currentKey = apiKeyRef.current;
      if (currentKey !== null) {
        const headerName = details?.apiKeyHeader || 'apikey';
        headers[headerName] = currentKey;
      }

      if (externalApiKey && apiKeyAuthPolicy) {
        const { in: location, key } = apiKeyAuthPolicy.params || {};
        if (location === 'header') {
          headers[key || 'x-api-key'] = externalApiKey;
        }
      }

      const response = await fetch(activeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(graphQLParams),
      });
      return response.json();
    };
  }, [activeUrl, apiKeyRef, externalApiKey, apiKeyAuthPolicy, details?.apiKeyHeader]);

  const schema = useMemo(() => {
    try {
      if (definition) {
        return buildSchema(definition);
      }
    } catch {
      // Invalid schemas are displayed without GraphiQL schema assistance.
    }
    return undefined;
  }, [definition]);

  return (
    <Box p={3}>
      <Typography variant="h5" style={{ fontWeight: 600, marginBottom: '8px' }}>
        GraphQL Console
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: '24px' }}>
        Author your GraphQL commands and test them dynamically against your current gateway environments.
      </Typography>

      {!isDeployed && (
        <Box mb={3}>
          <Alert severity="info">
            <strong>Not Deployed:</strong> This API is not deployed to any gateway. Try out functionality is disabled.
          </Alert>
        </Box>
      )}

      {isDeployed && (
        <>
          <Card style={{ marginBottom: '16px' }}>
            <CardContent>
              <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: '12px' }}>
                Gateway Endpoint
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel id="graphql-endpoint-label">Select Gateway Environment</InputLabel>
                    <Select
                      labelId="graphql-endpoint-label"
                      value={selectedUrl}
                      onChange={e => setSelectedUrl(e.target.value as string)}
                      label="Select Gateway Environment"
                    >
                      {gatewayUrls && gatewayUrls.map(urlObj => (
                        <MenuItem key={urlObj.url} value={urlObj.url}>
                          {urlObj.description || urlObj.environmentName || urlObj.url} ({urlObj.url})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {fetcher && (
            <Card>
              <CardContent style={{ padding: 0, height: '600px', display: 'flex' }}>
                <Box style={{ flex: 1, minHeight: '600px' }}>
                  <GraphiQL 
                    fetcher={fetcher} 
                    schema={schema}
                    defaultQuery=""
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};
