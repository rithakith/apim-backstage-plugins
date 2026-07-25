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

import React, { useState, useMemo } from 'react';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Wso2ApiDetail } from '../../../../../api';
import { CODE_FONT_FAMILY } from '../../../../../styles/fonts';
import {
  GatewayUrl,
  getAsyncVerbColors,
  getHeaderFlags,
  normalizeAsyncOperations,
  useAsyncAuthHeaders,
  useCopiedIndex,
  useExpandedOperations,
  useGatewaySelection,
  usePaginatedOperations,
} from './asyncConsoleUtils';

interface WebSocketConsoleProps {
  operations: any[];
  gatewayUrls: GatewayUrl[];
  apiKeyRef: React.MutableRefObject<string | null>;
  externalApiKey: string;
  apiKeyAuthPolicy: any;
  isDeployed?: boolean;
  details?: Wso2ApiDetail;
}

export const WebSocketConsole = ({
  operations = [],
  gatewayUrls,
  apiKeyRef,
  externalApiKey,
  apiKeyAuthPolicy,
  isDeployed = true,
  details,
}: WebSocketConsoleProps) => {
  const { selectedUrl, setSelectedUrl, activeUrl } =
    useGatewaySelection(gatewayUrls);
  const { copiedIndex, markCopied } = useCopiedIndex();
  const { isExpanded, toggleExpanded } = useExpandedOperations();
  const [refreshToken, setRefreshToken] = useState(0);
  const itemsPerPage = 5;

  // Convert HTTP/HTTPS endpoint to WS/WSS format
  const websocketBaseUrl = useMemo(() => {
    if (!activeUrl) return 'wss://gateway.wso2.com';
    try {
      const url = new URL(activeUrl);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return url.toString().replace(/\/$/, ''); // Remove trailing slash
    } catch (e) {
      return activeUrl
        .replace(/^https:/i, 'wss:')
        .replace(/^http:/i, 'ws:')
        .replace(/\/$/, '');
    }
  }, [activeUrl]);

  const authHeaders = useAsyncAuthHeaders({
    apiKeyRef,
    externalApiKey,
    apiKeyAuthPolicy,
    details,
    refreshToken,
  });

  const getWscatCommand = (path: string) => {
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${websocketBaseUrl}${formattedPath}`;
    const headerFlags = getHeaderFlags(authHeaders);

    return `wscat -c '${fullUrl}' ${headerFlags}`.trim();
  };

  const handleCopy = (path: string, index: number) => {
    const command = getWscatCommand(path);
    navigator.clipboard.writeText(command);
    markCopied(index);
  };

  const safeOperations = useMemo(() => {
    return normalizeAsyncOperations(operations, 'PUB');
  }, [operations]);

  const { currentPage, setCurrentPage, totalPages, paginatedOperations } =
    usePaginatedOperations(safeOperations, itemsPerPage);

  if (safeOperations.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary" style={{ fontStyle: 'italic' }}>
          No topics or channels available for this WebSocket API.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" style={{ fontWeight: 600, marginBottom: '8px' }}>
        WebSocket Console (wscat generator)
      </Typography>
     

      {!isDeployed && (
        <Box mb={3}>
          <Alert severity="info">
            <strong>Not Deployed:</strong> This API is not deployed to any gateway. Try out functionality is disabled.
          </Alert>
        </Box>
      )}

      {/* Gateway Endpoint URL selector */}
      {isDeployed && (
      <Card style={{ marginBottom: '24px' }}>
        <CardContent>
          <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: '12px' }}>
            Gateway Endpoint
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={selectedUrl === 'custom' ? 6 : 12}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel id="ws-endpoint-label">Select Gateway Environment</InputLabel>
                <Select
                  labelId="ws-endpoint-label"
                  value={selectedUrl}
                  onChange={e => setSelectedUrl(e.target.value as string)}
                  label="Select Gateway Environment"
                >
                  {gatewayUrls.map(urlObj => (
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
      )}

      {/* Topics Accordion List */}
      <Box>
        {paginatedOperations.map((op: any, index: number) => {
          const globalIdx = (currentPage - 1) * itemsPerPage + index;
          const verb = (op.verb || op.method || 'PUB').toUpperCase();
          const colors = getAsyncVerbColors(verb);
          const path = op.target || op.path || '/*';

          return (
            <Accordion
              key={globalIdx}
              expanded={isExpanded(globalIdx)}
              onChange={() => toggleExpanded(globalIdx)}
              elevation={0}
              style={{
                marginBottom: '8px',
                border: `1px solid ${colors.main}`,
                borderRadius: '4px',
                backgroundColor: colors.light,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center">
                  <Box
                    px={1.5}
                    py={0.5}
                    mr={2}
                    borderRadius={4}
                    style={{
                      backgroundColor: colors.main,
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'center',
                      fontSize: '0.72rem',
                    }}
                  >
                    {verb}
                  </Box>
                  <Typography
                    variant="body2"
                    style={{
                      fontFamily: CODE_FONT_FAMILY,
                      fontWeight: 600,
                    }}
                  >
                    {path}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails style={{ display: 'block', padding: '16px 24px' }}>
                {!isDeployed ? (
                  <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                    Connect functionality is disabled because the API is not deployed.
                  </Typography>
                ) : (
                  <>
                    <Typography variant="caption" color="textSecondary" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      cURL
                    </Typography>
                <Box
                  p={2}
                  style={{
                    backgroundColor: '#1E1E1E',
                    color: '#D4D4D4',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    fontFamily: CODE_FONT_FAMILY,
                    fontSize: '12.5px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    marginBottom: '8px',
                  }}
                >
                  {getWscatCommand(path)}
                </Box>
                <Box display="flex" justifyContent="flex-end" gridGap="16px" style={{ gap: '16px', marginRight: '8px' }}>
                  <Button
                    color="primary"
                    style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.5px' }}
                    onClick={() => setRefreshToken(prev => prev + 1)}
                  >
                    GENERATE CURL
                  </Button>
                  <Button
                    color="primary"
                    style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.5px' }}
                    onClick={() => handleCopy(path, globalIdx)}
                  >
                    {copiedIndex === globalIdx ? 'COPIED' : 'COPY CURL'}
                  </Button>
                </Box>
                </>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Stateful Inline Paginator */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3} style={{ gap: '16px' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{ textTransform: 'none' }}
          >
            &lt; Prev
          </Button>
          <Typography variant="body2" color="textSecondary">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{ textTransform: 'none' }}
          >
            Next &gt;
          </Button>
        </Box>
      )}
    </Box>
  );
};
