import { useState } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ContentCopyIcon from '@material-ui/icons/FileCopy';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { CODE_FONT_FAMILY } from '../../../../../styles/fonts';

const SECONDS_PER_DAY = 24 * 60 * 60;
const VALIDITY_OPTIONS = [
  { label: '30 Days', value: String(30 * SECONDS_PER_DAY) },
  { label: '90 Days', value: String(90 * SECONDS_PER_DAY) },
  { label: '6 Months', value: String(180 * SECONDS_PER_DAY) },
  { label: '1 Year', value: String(365 * SECONDS_PER_DAY) },
  { label: '1 Day', value: String(1 * SECONDS_PER_DAY) },
  { label: 'Never Expires', value: '-1' },
  { label: 'Custom', value: 'custom' },
];

type SecurityRestriction = 'none' | 'ip' | 'referer';

interface TryOutApiKeyInputProps {
  manualKeyInput: string;
  setManualKeyInput: (val: string) => void;
  applyManualKey: (val: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  customKeyName: string;
  setCustomKeyName: (val: string) => void;
  generatedKey: string | null;
  setGeneratedKey: (val: string | null) => void;
  apiClient: any;
  apiId: string;
  isKeyLoading: boolean;
}

export const TryOutApiKeyInput = ({
  manualKeyInput,
  setManualKeyInput,
  applyManualKey,
  isModalOpen,
  setIsModalOpen,
  customKeyName,
  setCustomKeyName,
  generatedKey,
  setGeneratedKey,
  apiClient,
  apiId,
  isKeyLoading,
}: TryOutApiKeyInputProps) => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showApiKey, setShowApiKey] = useState(true);
  const [validitySelection, setValiditySelection] = useState(String(1 * SECONDS_PER_DAY));
  const [customValidityDays, setCustomValidityDays] = useState('');
  const [keyType, setKeyType] = useState('PRODUCTION');
  const [securityRestriction, setSecurityRestriction] =
    useState<SecurityRestriction>('none');
  const [permittedIP, setPermittedIP] = useState('');
  const [permittedReferer, setPermittedReferer] = useState('');

  const validityPeriod =
    validitySelection === 'custom'
      ? Number(customValidityDays) * SECONDS_PER_DAY
      : Number(validitySelection);
  const hasValidCustomValidity =
    validitySelection !== 'custom' ||
    (Number.isFinite(validityPeriod) && validityPeriod > 0);
  const isRestrictionValid =
    securityRestriction === 'none' ||
    (securityRestriction === 'ip' && permittedIP.trim() !== '') ||
    (securityRestriction === 'referer' && permittedReferer.trim() !== '');
  const canGenerate =
    customKeyName.trim() !== '' && hasValidCustomValidity && isRestrictionValid;

  return (
    <Box display="flex" justifyContent="center" width="100%" my={2}>
      <Box
        p={2}
        border={1}
        borderColor="divider"
        borderRadius={4}
        bgcolor="background.paper"
      >
        {generatedKey && (
          <Alert severity="warning" style={{ marginBottom: '16px', maxWidth: '600px' }}>
            <AlertTitle style={{ fontWeight: 'bold' }}>Please Copy the API Key</AlertTitle>
            Please copy this generated API Key value as it will be displayed only for the current browser session. (The API Key will not be visible in the UI after the page is refreshed.)
          </Alert>
        )}
        <Box display="flex" alignItems="center">
        <TextField
          label="API Key"
          placeholder="Paste your API key here..."
          type={showApiKey ? 'text' : 'password'}
          value={manualKeyInput || ''}
          onChange={(e) => {
            const val = e.target.value;
            setManualKeyInput(val);
            applyManualKey(val); // Apply even if blank
          }}
          variant="outlined"
          size="small"
          style={{ width: '400px', marginRight: '32px' }}
          InputProps={{
            style: { fontFamily: CODE_FONT_FAMILY, fontSize: '0.8125rem' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle api key visibility"
                  onClick={() => setShowApiKey(!showApiKey)}
                  edge="end"
                  size="small"
                  style={{ marginRight: 4 }}
                >
                  {showApiKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
                <Tooltip title="Copy API Key">
                  <IconButton
                    aria-label="copy api key"
                    onClick={() => {
                      if (manualKeyInput) {
                        navigator.clipboard.writeText(manualKeyInput);
                      }
                    }}
                    edge="end"
                    size="small"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setGeneratedKey(null);
            setIsModalOpen(true);
          }}
          style={{ textTransform: 'none', height: '40px', minWidth: '160px' }}
        >
          Create New Key
        </Button>
      </Box>

      {/* Generation Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          {!generatedKey && (
            <Box py={2}>
              <Typography variant="body2" gutterBottom>
                Create a new API key for your API
              </Typography>
              <TextField
                label="Name"
                placeholder="Name"
                value={customKeyName}
                onChange={(e) => setCustomKeyName(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <Box display="flex" flexWrap="wrap" gridGap={16} mt={1}>
                <FormControl variant="outlined" size="small" style={{ minWidth: 160, flex: 1 }}>
                  <InputLabel id="api-key-type-label">Key Type</InputLabel>
                  <Select
                    labelId="api-key-type-label"
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value as string)}
                    label="Key Type"
                  >
                    <MenuItem value="PRODUCTION">Production</MenuItem>
                    <MenuItem value="SANDBOX">Sandbox</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" style={{ minWidth: 160, flex: 1 }}>
                  <InputLabel id="api-key-validity-label">Validity Period</InputLabel>
                  <Select
                    labelId="api-key-validity-label"
                    value={validitySelection}
                    onChange={(e) => setValiditySelection(e.target.value as string)}
                    label="Validity Period"
                  >
                    {VALIDITY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {validitySelection === 'custom' && (
                  <TextField
                    label="Days"
                    placeholder="Days"
                    value={customValidityDays}
                    onChange={(e) => setCustomValidityDays(e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!hasValidCustomValidity}
                    style={{ minWidth: 160, flex: 1 }}
                  />
                )}
                <FormControl variant="outlined" size="small" style={{ minWidth: 160, flex: 1 }}>
                  <InputLabel id="api-key-security-label">Security Restriction</InputLabel>
                  <Select
                    labelId="api-key-security-label"
                    value={securityRestriction}
                    onChange={(e) => setSecurityRestriction(e.target.value as SecurityRestriction)}
                    label="Security Restriction"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="ip">Preferred IP</MenuItem>
                    <MenuItem value="referer">Preferred Referrer</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {securityRestriction === 'ip' && (
                <TextField
                  label="IP Address"
                  placeholder="IP Address"
                  value={permittedIP}
                  onChange={(e) => setPermittedIP(e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!isRestrictionValid}
                  helperText="Restrict by IP address"
                />
              )}
              {securityRestriction === 'referer' && (
                <TextField
                  label="Referrer URL"
                  placeholder="Referrer URL"
                  value={permittedReferer}
                  onChange={(e) => setPermittedReferer(e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!isRestrictionValid}
                  helperText="Restrict by HTTP referrer"
                />
              )}
              {validitySelection === 'custom' && !hasValidCustomValidity && (
                <FormHelperText error>Enter a valid number of days.</FormHelperText>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={() => setIsModalOpen(false)} color="default">
            {generatedKey ? 'Close' : 'Cancel'}
          </Button>
          {!generatedKey && (
            <Button
              onClick={async () => {
                const result = await apiClient.generateApiKey(apiId, {
                  keyName: customKeyName.trim(),
                  keyType,
                  validityPeriod,
                  additionalProperties: {
                    permittedIP: securityRestriction === 'ip' ? permittedIP.trim() : '',
                    permittedReferer:
                      securityRestriction === 'referer' ? permittedReferer.trim() : '',
                  },
                });
                if (result && result.apikey) {
                  const newKey = result.apikey;
                  setGeneratedKey(newKey);
                  setManualKeyInput(newKey);
                  applyManualKey(newKey);
                  setShowSuccessToast(true);
                  setIsModalOpen(false)
                }
              }}
              color="primary"
              variant="contained"
              disabled={isKeyLoading || !canGenerate}
            >
              {isKeyLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate API Key'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccessToast}
        autoHideDuration={3000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccessToast(false)} severity="success" variant="outlined" style={{ backgroundColor: 'white' }}>
          API key generated successfully
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};
