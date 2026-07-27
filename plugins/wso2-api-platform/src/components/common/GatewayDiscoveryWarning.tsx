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
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import RefreshIcon from '@material-ui/icons/Refresh';

type GatewayDiscoveryFailureContentProps = {
  loading: boolean;
  onRetry: () => void;
};

export const GatewayDiscoveryFailureContent = ({
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
    <Box mt={2} display="flex" flexDirection="column" alignItems="center">
      <Button
        variant="outlined"
        color="primary"
        onClick={onRetry}
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <RefreshIcon />
          )
        }
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Now'}
      </Button>
      <Typography
        variant="caption"
        color="textSecondary"
        style={{ marginTop: 8 }}
      >
        Auto-checking connection every 10 seconds
      </Typography>
    </Box>
  </Box>
);
