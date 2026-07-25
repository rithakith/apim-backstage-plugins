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
/* eslint-disable no-nested-ternary */
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
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Alert from '@material-ui/lab/Alert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Wso2ApiDetail } from '../../../../../api';
import { CODE_FONT_FAMILY } from '../../../../../styles/fonts';
import {
  GatewayUrl,
  getAsyncVerbColors,
  getHeaderFlags,
  isApiKeyAuthEnabled,
  normalizeAsyncOperations,
  useAsyncAuthHeaders,
  useCopiedIndex,
  useExpandedOperations,
  useGatewaySelection,
  usePaginatedOperations,
} from './asyncConsoleUtils';

interface WebSubConsoleProps {
  operations: any[];
  gatewayUrls: GatewayUrl[];
  apiKeyRef: React.MutableRefObject<string | null>;
  externalApiKey: string;
  apiKeyAuthPolicy: any;
  isDeployed?: boolean;
  details?: Wso2ApiDetail;
}

export const WebSubConsole = ({
  operations = [],
  gatewayUrls,
  apiKeyRef,
  externalApiKey,
  apiKeyAuthPolicy,
  isDeployed = true,
  details,
}: WebSubConsoleProps) => {
  const { selectedUrl, setSelectedUrl, activeUrl } =
    useGatewaySelection(gatewayUrls);
  const { copiedIndex, markCopied } = useCopiedIndex();
  const { isExpanded, toggleExpanded } = useExpandedOperations();
  const [refreshToken, setRefreshToken] = useState(0);
  const itemsPerPage = 5;

  // Form states per topic path
  const [modes, setModes] = useState<Record<string, 'subscribe' | 'unsubscribe'>>({});
  const [callbackUrls, setCallbackUrls] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [leaseSeconds, setLeaseSeconds] = useState<Record<string, string>>({});

  const isApiKeyEnabled = useMemo(() => {
    return isApiKeyAuthEnabled(details, apiKeyAuthPolicy);
  }, [details, apiKeyAuthPolicy]);

  const authHeaders = useAsyncAuthHeaders({
    apiKeyRef,
    externalApiKey,
    apiKeyAuthPolicy,
    details,
    refreshToken,
    preferApiKeyHeader: isApiKeyEnabled,
  });

  const getCurlCommand = (path: string) => {
    const mode = modes[path] || 'subscribe';
    const rawCallback = callbackUrls[path] || '';
    const callbackVal = rawCallback === '' ? 'null' : rawCallback;
    const rawLease = leaseSeconds[path] || '';
    const leaseVal = rawLease === '' ? '50000' : rawLease;
    const secretVal = secrets[path] || '';

    const secretFlag = secretVal ? `-d 'hub.secret=${secretVal}' ` : '';
    const headerFlags = getHeaderFlags(authHeaders);

    return `curl -X POST '${activeUrl}' -H 'Content-Type: application/x-www-form-urlencoded' -d 'hub.topic=${path}' -d 'hub.callback=${callbackVal}' -d 'hub.mode=${mode}' -d 'hub.lease_seconds=${leaseVal}' ${secretFlag}${headerFlags}`.trim();
  };

  const handleCopy = (path: string, index: number) => {
    const command = getCurlCommand(path);
    navigator.clipboard.writeText(command);
    markCopied(index);
  };

  const safeOperations = useMemo(() => {
    return normalizeAsyncOperations(operations, 'SUB', '_default');
  }, [operations]);

  const { currentPage, setCurrentPage, totalPages, paginatedOperations } =
    usePaginatedOperations(safeOperations, itemsPerPage);

  return (
    <Box p={3}>
      <Typography variant="h5" style={{ fontWeight: 600, marginBottom: '8px' }}>
        WebSub Console
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: '24px' }}>
        Generate WebSub subscription/unsubscription requests using target server environments and authorization credentials.
      </Typography>

      {!isDeployed && (
        <Box mb={3}>
          <Alert severity="info">
            <strong>Not Deployed:</strong> This API is not deployed to any gateway. Try out functionality is disabled.
          </Alert>
        </Box>
      )}

      {isDeployed && !isApiKeyEnabled && (
        <Box mb={3}>
          <Alert severity="warning">
            <strong>API Key Disabled:</strong> Invocation is only supported when API Key authentication is enabled.
          </Alert>
        </Box>
      )}

      {/* Gateway Endpoint URL selector */}
      {isDeployed && isApiKeyEnabled && (
        <Card style={{ marginBottom: '24px' }}>
          <CardContent>
            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: '12px' }}>
              Server
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={selectedUrl === 'custom' ? 6 : 12}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel id="websub-endpoint-label">Select Gateway Environment</InputLabel>
                  <Select
                    labelId="websub-endpoint-label"
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
          const verb = (op.verb || op.method || 'SUB').toUpperCase();
          const colors = getAsyncVerbColors(verb);
          const path = op.target || op.path || '_default';

          // Get fields values for the path
          const mode = modes[path] || 'subscribe';
          const callbackUrl = callbackUrls[path] || '';
          const secret = secrets[path] || '';
          const leaseSec = leaseSeconds[path] || '';

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
                ) : !isApiKeyEnabled ? (
                  <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                    Invocation is disabled because API Key authentication is not enabled for this API.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <RadioGroup
                        row
                        value={mode}
                        onChange={e => {
                          const val = e.target.value as 'subscribe' | 'unsubscribe';
                          setModes(prev => ({ ...prev, [path]: val }));
                        }}
                      >
                        <FormControlLabel value="subscribe" control={<Radio color="primary" />} label="Subscribe" />
                        <FormControlLabel value="unsubscribe" control={<Radio color="primary" />} label="Unsubscribe" />
                      </RadioGroup>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Callback URL *"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={callbackUrl}
                        onChange={e => {
                          const val = e.target.value;
                          setCallbackUrls(prev => ({ ...prev, [path]: val }));
                        }}
                        placeholder="www.webhook.site"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Secret"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={secret}
                        onChange={e => {
                          const val = e.target.value;
                          setSecrets(prev => ({ ...prev, [path]: val }));
                        }}
                        placeholder="secret"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Lease Seconds"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={leaseSec}
                        onChange={e => {
                          const val = e.target.value;
                          setLeaseSeconds(prev => ({ ...prev, [path]: val }));
                        }}
                        placeholder="50000"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} style={{ marginTop: '16px' }}>
                      <Typography variant="caption" color="textSecondary" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        curl
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
                        {getCurlCommand(path)}
                      </Box>
                      <Box display="flex" justifyContent="flex-end" style={{ gap: '16px', marginTop: '8px' }}>
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
                    </Grid>
                  </Grid>
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
