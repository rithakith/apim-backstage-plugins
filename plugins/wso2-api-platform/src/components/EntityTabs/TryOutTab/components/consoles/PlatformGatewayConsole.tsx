import { useState, useMemo, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CheckIcon from '@material-ui/icons/Check';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { CODE_FONT_FAMILY } from '../../../../../styles/fonts';

const useStyles = makeStyles(theme => ({
  swaggerContainer: {
    padding: theme.spacing(2),
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.03)'
        : 'rgba(0,0,0,0.01)',
  },
  curlBox: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: theme.spacing(2),
    borderRadius: '4px',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: '0.875rem',
    position: 'relative',
    marginTop: theme.spacing(2),
    border: '1px solid #333',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  paramRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.03)',
    borderRadius: '4px',
  },
}));

const PlatformGatewayOperationConsole = ({
  op,
  externalApiKey,
  apiKeyAuthPolicy,
  classes,
  serverUrl,
}: any) => {
  const theme = useTheme();
  const method = (op.verb || op.method || 'GET').toUpperCase();
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  const path = op.target || op.path || '';

  // Detect path parameters
  const detectedPathParams = useMemo(() => {
    const matches = path.match(/\{([^}]+)\}/g);
    return matches ? matches.map((m: string) => m.slice(1, -1)) : [];
  }, [path]);

  // States
  const [pathParamValues, setPathParamValues] = useState<
    Record<string, string>
  >({});
  const [requestBody, setRequestBody] = useState('');
  const [bodyFormat, setBodyFormat] = useState('Raw'); // Raw, form-data, x-www-form-urlencoded
  const [contentType, setContentType] = useState('JSON'); // JSON, XML, Text
  const [formDataParams, setFormDataParams] = useState<
    Array<{ name: string; value: string }>
  >([]);

  // Initialize with common headers if applicable
  const initialHeaders = useMemo(() => {
    const list: { name: string; value: string }[] = [];
    if (externalApiKey && apiKeyAuthPolicy) {
      const { in: location, key: name } = apiKeyAuthPolicy.params || {};
      if (location === 'header') {
        list.push({ name: name || 'x-api-key', value: externalApiKey });
      }
    }
    return list;
  }, [externalApiKey, apiKeyAuthPolicy]);

  const [manualHeaders, setManualHeaders] = useState(initialHeaders);

  // Sync headers when apiKey changes
  useEffect(() => {
    setManualHeaders(prev => {
      // Filter out existing external keys to avoid duplicates
      const filtered = prev.filter(
        h =>
          !apiKeyAuthPolicy ||
          h.name.toLowerCase() !==
            (apiKeyAuthPolicy.params?.key || 'x-api-key').toLowerCase(),
      );

      const next = [...filtered];
      if (externalApiKey && apiKeyAuthPolicy) {
        const { in: location, key: name } = apiKeyAuthPolicy.params || {};
        if (location === 'header') {
          next.push({ name: name || 'x-api-key', value: externalApiKey });
        }
      }
      return next;
    });
  }, [externalApiKey, apiKeyAuthPolicy]);

  // Sync Content-Type header
  useEffect(() => {
    if (!hasBody) return;
    setManualHeaders(prev => {
      const newList = [...prev];
      const ctIdx = newList.findIndex(
        h => h.name.toLowerCase() === 'content-type',
      );

      let targetValue = '';
      if (bodyFormat === 'Raw') {
        if (contentType === 'JSON') targetValue = 'application/json';
        else if (contentType === 'XML') targetValue = 'application/xml';
        else if (contentType === 'Text') targetValue = 'text/plain';
      } else if (bodyFormat === 'x-www-form-urlencoded') {
        targetValue = 'application/x-www-form-urlencoded';
      }

      if (targetValue) {
        if (ctIdx >= 0) {
          newList[ctIdx].value = targetValue;
        } else {
          newList.push({ name: 'Content-Type', value: targetValue });
        }
        return newList;
      }

      if (ctIdx >= 0 && !requestBody.trim()) {
        newList.splice(ctIdx, 1);
        return newList;
      }

      return prev;
    });
  }, [bodyFormat, contentType, hasBody, requestBody]);

  const addHeader = () => {
    setManualHeaders([...manualHeaders, { name: '', value: '' }]);
  };

  const removeHeader = (idx: number) => {
    const newList = [...manualHeaders];
    newList.splice(idx, 1);
    setManualHeaders(newList);
  };

  const updateHeader = (idx: number, field: 'name' | 'value', val: string) => {
    const newList = [...manualHeaders];
    newList[idx][field] = val;
    setManualHeaders(newList);
  };

  const addFormDataParam = () => {
    setFormDataParams([...formDataParams, { name: '', value: '' }]);
  };

  const removeFormDataParam = (idx: number) => {
    const newList = [...formDataParams];
    newList.splice(idx, 1);
    setFormDataParams(newList);
  };

  const updateFormDataParam = (
    idx: number,
    field: 'name' | 'value',
    val: string,
  ) => {
    const newList = [...formDataParams];
    newList[idx][field] = val;
    setFormDataParams(newList);
  };

  const substitutedPath = useMemo(() => {
    let result = path;
    detectedPathParams.forEach((param: string) => {
      const val = pathParamValues[param];
      const placeholder = `{${param}}`;
      result = result.replace(placeholder, val || `<${param}>`);
    });
    return result;
  }, [path, pathParamValues, detectedPathParams]);

  const fullEndpointUrl = useMemo(() => {
    if (!serverUrl) return substitutedPath;
    const base = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    const resource = substitutedPath.startsWith('/')
      ? substitutedPath
      : `/${substitutedPath}`;
    return `${base}${resource}`;
  }, [substitutedPath, serverUrl]);

  const [opCopied, setOpCopied] = useState(false);

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(fullEndpointUrl);
    setOpCopied(true);
    setTimeout(() => setOpCopied(false), 2000);
  };

  const curlCommand = useMemo(() => {
    let url = fullEndpointUrl;

    // Handle external API key in query if applicable
    if (externalApiKey && apiKeyAuthPolicy) {
      const { in: location, key: name } = apiKeyAuthPolicy.params || {};
      if (location === 'query') {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}${name || 'api-key'}=${externalApiKey}`;
      }
    }

    const headerStrings = manualHeaders
      .filter(h => h.name.trim())
      .map(h => `-H '${h.name}: ${h.value}'`)
      .join(' \\\n  ');

    let bodyString = '';
    if (hasBody) {
      if (bodyFormat === 'form-data') {
        if (formDataParams.length > 0) {
          bodyString = formDataParams
            .filter(p => p.name.trim())
            .map(
              p =>
                ` \\\n  -F '${p.name.replace(/'/g, "'\\''")}=${p.value.replace(
                  /'/g,
                  "'\\''",
                )}'`,
            )
            .join('');
        } else {
          bodyString = ` \\\n  -F 'key=value'`;
        }
      } else if (bodyFormat === 'x-www-form-urlencoded') {
        if (formDataParams.length > 0) {
          const joined = formDataParams
            .filter(p => p.name.trim())
            .map(
              p =>
                `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`,
            )
            .join('&');
          bodyString = ` \\\n  -d '${joined.replace(/'/g, "'\\''")}'`;
        } else {
          bodyString = ` \\\n  -d 'key=value'`;
        }
      } else {
        const defaultVal = bodyFormat === 'Raw' ? '{}' : 'key=value';
        const content = requestBody.trim()
          ? requestBody.replace(/'/g, "'\\''")
          : defaultVal;
        if (content) {
          bodyString = ` \\\n  -d '${content}'`;
        }
      }
    }

    const headerSegment = headerStrings ? ` \\\n  ${headerStrings}` : '';
    return `curl -X ${method} "${url}"${headerSegment}${bodyString} -k`;
  }, [
    method,
    hasBody,
    fullEndpointUrl,
    manualHeaders,
    requestBody,
    bodyFormat,
    formDataParams,
    externalApiKey,
    apiKeyAuthPolicy,
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
  };

  return (
    <Box className={classes.swaggerContainer}>
      <Typography
        variant="subtitle2"
        gutterBottom
        style={{ fontWeight: 'bold', marginTop: '8px' }}
      >
        Request Configuration
      </Typography>

      <Box mt={2} mb={3}>
        <Typography
          variant="caption"
          style={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#718096',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          Endpoint URL
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          p={1.5}
          borderRadius={4}
          style={{
            backgroundColor: 'rgba(128, 128, 128, 0.06)',
            border: '1px solid rgba(128, 128, 128, 0.15)',
          }}
        >
          <Typography
            variant="body2"
            style={{
              flexGrow: 1,
              wordBreak: 'break-all',
              fontFamily: CODE_FONT_FAMILY,
              fontSize: '0.8125rem',
            }}
          >
            {fullEndpointUrl}
          </Typography>
          <Box ml={1}>
            <Tooltip title={opCopied ? 'Copied!' : 'Copy Endpoint URL'}>
              <IconButton
                size="small"
                onClick={handleCopyEndpoint}
                style={{ color: opCopied ? '#49cc90' : 'inherit' }}
              >
                {opCopied ? (
                  <CheckIcon fontSize="small" />
                ) : (
                  <FileCopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Path Parameters Section */}
      {detectedPathParams.length > 0 && (
        <Box mb={3}>
          <Typography
            variant="caption"
            style={{
              fontWeight: 'bold',
              opacity: 0.7,
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Path Parameters
          </Typography>
          {detectedPathParams.map((param: string) => (
            <Box key={param} className={classes.paramRow}>
              <Typography
                variant="body2"
                style={{ minWidth: '80px', fontWeight: 'bold' }}
              >
                {param}{' '}
                <span style={{ color: theme.palette.error.main }}>*</span>
              </Typography>
              <TextField
                placeholder={`Enter ${param}`}
                value={pathParamValues[param] || ''}
                onChange={e =>
                  setPathParamValues((prev: any) => ({
                    ...prev,
                    [param]: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{ style: { fontSize: '0.8125rem' } }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Request Body Section */}
      {hasBody && (
        <Box mb={3}>
          <Typography
            variant="caption"
            style={{
              fontWeight: 'bold',
              opacity: 0.7,
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Request Body
          </Typography>
          <Box display="flex" mb={1} style={{ gap: '8px' }}>
            <FormControl variant="outlined" size="small">
              <Select
                value={bodyFormat}
                onChange={e => setBodyFormat(e.target.value as string)}
                style={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="Raw">Raw</MenuItem>
                <MenuItem value="form-data">form-data</MenuItem>
                <MenuItem value="x-www-form-urlencoded">
                  x-www-form-urlencoded
                </MenuItem>
              </Select>
            </FormControl>
            {bodyFormat === 'Raw' && (
              <FormControl variant="outlined" size="small">
                <Select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as string)}
                  style={{ fontSize: '0.75rem' }}
                >
                  <MenuItem value="JSON">JSON</MenuItem>
                  <MenuItem value="XML">XML</MenuItem>
                  <MenuItem value="Text">Text</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
          {bodyFormat === 'form-data' ||
          bodyFormat === 'x-www-form-urlencoded' ? (
            <Box mt={1}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography
                  variant="caption"
                  style={{ fontWeight: 'bold', opacity: 0.7 }}
                >
                  {bodyFormat === 'form-data'
                    ? 'Form Data Entries'
                    : 'URL Encoded Entries'}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addFormDataParam}
                  style={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Add Entry
                </Button>
              </Box>

              {formDataParams.map((param, idx) => (
                <Box key={idx} className={classes.headerRow}>
                  <TextField
                    placeholder="Key"
                    value={param.name}
                    onChange={e =>
                      updateFormDataParam(idx, 'name', e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    style={{ flex: 1 }}
                    inputProps={{ style: { fontSize: '0.8125rem' } }}
                  />
                  <TextField
                    placeholder="Value"
                    value={param.value}
                    onChange={e =>
                      updateFormDataParam(idx, 'value', e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    style={{ flex: 2 }}
                    inputProps={{ style: { fontSize: '0.8125rem' } }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeFormDataParam(idx)}
                    color="secondary"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ) : (
            <TextField
              placeholder={
                bodyFormat === 'Raw' ? '{"key": "value"}' : 'key=value'
              }
              value={requestBody}
              onChange={e => setRequestBody(e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              InputProps={{
                style: { fontFamily: CODE_FONT_FAMILY, fontSize: '0.8125rem' },
              }}
            />
          )}
        </Box>
      )}

      <Box mb={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="caption"
            style={{ fontWeight: 'bold', opacity: 0.7 }}
          >
            Headers
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addHeader}
            style={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            Add Header
          </Button>
        </Box>

        {manualHeaders.map((header, idx) => (
          <Box key={idx} className={classes.headerRow}>
            <TextField
              placeholder="Header name"
              value={header.name}
              onChange={e => updateHeader(idx, 'name', e.target.value)}
              variant="outlined"
              size="small"
              style={{ flex: 1 }}
              inputProps={{ style: { fontSize: '0.8125rem' } }}
            />
            <TextField
              placeholder="Header value"
              value={header.value}
              onChange={e => updateHeader(idx, 'value', e.target.value)}
              variant="outlined"
              size="small"
              style={{ flex: 2 }}
              inputProps={{ style: { fontSize: '0.8125rem' } }}
            />
            <IconButton
              size="small"
              onClick={() => removeHeader(idx)}
              color="secondary"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      <Divider style={{ margin: '16px 0' }} />

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="caption"
            style={{ fontWeight: 'bold', opacity: 0.7 }}
          >
            Generated cURL Command
          </Typography>
          <IconButton
            size="small"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            <AssignmentIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box className={classes.curlBox}>{curlCommand}</Box>
      </Box>
    </Box>
  );
};

export const PlatformGatewayConsole = ({
  operations,
  apiKey,
  externalApiKey,
  apiKeyAuthPolicy,
  gatewayUrls,
}: any) => {
  const theme = useTheme();
  const classes = useStyles();

  const [selectedServerUrl, setSelectedServerUrl] = useState<string>(
    gatewayUrls?.[0]?.url || '',
  );
  const [serverCopied, setServerCopied] = useState(false);
  const [expandedOperations, setExpandedOperations] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (gatewayUrls?.length > 0 && !selectedServerUrl) {
      setSelectedServerUrl(gatewayUrls[0].url);
    }
  }, [gatewayUrls, selectedServerUrl]);

  if (!operations || operations.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary">
          No operations available for this API.
        </Typography>
      </Box>
    );
  }

  const getMethodColors = (method: string) => {
    const m = (method || '').toUpperCase();
    if (m === 'GET')
      return { main: '#61affe', light: 'rgba(97, 175, 254, 0.1)' };
    if (m === 'POST')
      return { main: '#49cc90', light: 'rgba(73, 204, 144, 0.1)' };
    if (m === 'PUT')
      return { main: '#fca130', light: 'rgba(252, 161, 48, 0.1)' };
    if (m === 'DELETE')
      return { main: '#f93e3e', light: 'rgba(249, 62, 62, 0.1)' };
    if (m === 'PATCH')
      return { main: '#50e3c2', light: 'rgba(80, 227, 194, 0.1)' };
    return { main: '#9012fe', light: 'rgba(144, 18, 254, 0.1)' };
  };

  const handleCopyServer = () => {
    navigator.clipboard.writeText(selectedServerUrl);
    setServerCopied(true);
    setTimeout(() => setServerCopied(false), 2000);
  };

  return (
    <Box p={2}>
      {operations && operations.length > 0 && (
        <>
          {gatewayUrls && gatewayUrls.length > 0 && (
            <Box
              mb={3}
              p={2}
              border={1}
              borderColor="divider"
              borderRadius={4}
              bgcolor="background.paper"
            >
              <Typography
                variant="caption"
                style={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#718096',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Server URL
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                p={1.5}
                borderRadius={4}
                style={{
                  backgroundColor: 'rgba(128, 128, 128, 0.06)',
                  border: '1px solid rgba(128, 128, 128, 0.15)',
                }}
              >
                {gatewayUrls.length > 1 ? (
                  <FormControl
                    variant="outlined"
                    size="small"
                    style={{ flexGrow: 1, marginRight: '8px' }}
                  >
                    <Select
                      value={selectedServerUrl}
                      onChange={e =>
                        setSelectedServerUrl(e.target.value as string)
                      }
                      style={{
                        fontSize: '0.85rem',
                        fontFamily: CODE_FONT_FAMILY,
                      }}
                    >
                      {gatewayUrls.map((gw: any, idx: number) => (
                        <MenuItem key={idx} value={gw.url}>
                          {gw.url} {gw.description ? `(${gw.description})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography
                    variant="body2"
                    style={{
                      flexGrow: 1,
                      wordBreak: 'break-all',
                      fontFamily: CODE_FONT_FAMILY,
                      fontSize: '0.85rem',
                    }}
                  >
                    {selectedServerUrl}
                  </Typography>
                )}
                <Box ml={1}>
                  <Tooltip title={serverCopied ? 'Copied!' : 'Copy Server URL'}>
                    <IconButton
                      size="small"
                      onClick={handleCopyServer}
                      style={{ color: serverCopied ? '#49cc90' : 'inherit' }}
                    >
                      {serverCopied ? (
                        <CheckIcon fontSize="small" />
                      ) : (
                        <FileCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          )}

          <Typography
            variant="subtitle1"
            gutterBottom
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}
          >
            Operations
          </Typography>

          <Box>
            {operations.map((op: any, idx: number) => {
              const colors = getMethodColors(op.verb || op.method);
              const isExpanded = expandedOperations[idx] ?? idx === 0;

              return (
                <Accordion
                  key={idx}
                  elevation={0}
                  expanded={isExpanded}
                  onChange={() =>
                    setExpandedOperations(prev => ({
                      ...prev,
                      [idx]: !isExpanded,
                    }))
                  }
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
                          fontSize: '0.75rem',
                        }}
                      >
                        {(op.verb || op.method || 'UNKNOWN').toUpperCase()}
                      </Box>
                      <Typography
                        variant="body2"
                        style={{
                          fontFamily: CODE_FONT_FAMILY,
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {op.target || op.path}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails style={{ padding: 0, display: 'block' }}>
                    {isExpanded && (
                      <PlatformGatewayOperationConsole
                        op={op}
                        apiKey={apiKey}
                        externalApiKey={externalApiKey}
                        apiKeyAuthPolicy={apiKeyAuthPolicy}
                        classes={classes}
                        serverUrl={selectedServerUrl}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};
