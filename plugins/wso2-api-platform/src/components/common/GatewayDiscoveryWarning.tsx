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

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

type GatewayDiscoveryWarningPanelProps = {
  offlineGateways: any[];
  gatewayError?: Error;
};

export const GatewayDiscoveryWarningPanel = ({
  offlineGateways,
  gatewayError,
}: GatewayDiscoveryWarningPanelProps) => {
  if (offlineGateways.length === 0 && !gatewayError) {
    return null;
  }

  const gatewayDiscoveryWarningMessage = gatewayError
    ? 'Failed to connect to the WSO2 Gateway. Please check your gateway configuration, client credentials, or ensure the service is running.'
    : `Error during discovery for the following gateways: ${offlineGateways
        .map((g: any) => g.name)
        .join(
          ', ',
        )}. They may be unreachable or offline. Displaying available APIM APIs instead.`;

  return (
    <Box display="flex" justifyContent="center" mb={2}>
      <Box
        mx={2}
        my={1}
        p={2}
        border={1}
        borderColor="divider"
        borderRadius={4}
        bgcolor="background.default"
        maxWidth="800px"
        width="100%"
      >
        <Alert severity="warning">
          <AlertTitle style={{ fontWeight: 'bold' }}>
            Gateway Discovery Warning
          </AlertTitle>
          {gatewayDiscoveryWarningMessage}
        </Alert>
      </Box>
    </Box>
  );
};

type GatewayDiscoveryFailureContentProps = {
  gatewayDiscoveryWarningPanel: React.ReactNode;
  loading: boolean;
  onRetry: () => void;
};

export const GatewayDiscoveryFailureContent = ({
  gatewayDiscoveryWarningPanel,
  loading,
  onRetry,
}: GatewayDiscoveryFailureContentProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    mt={4}
    mb={10}
  >
    {gatewayDiscoveryWarningPanel}
    <Box mt={2}>
      <Button
        variant="outlined"
        color="primary"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        disabled={loading}
      >
        Refresh Now
      </Button>
    </Box>
  </Box>
);
