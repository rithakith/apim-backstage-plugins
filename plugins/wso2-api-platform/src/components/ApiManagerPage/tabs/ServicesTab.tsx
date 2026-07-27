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
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { Table, TableColumn, WarningPanel } from '@backstage/core-components';
import { tableIconsWithoutSearchClear } from '../../common/Table/tableRenderers';

type ServicesTabProps = {
  gatewayDiscoveryWarningPanel?: React.ReactNode;
  isGatewayDiscoveryFailureEmptyState?: boolean;
  gatewayDiscoveryFailureContent?: React.ReactNode;
  servicesListState: any;
  searchToolbar: React.ReactNode;
  visibleServices: any[];
  columns: TableColumn<any>[];
  serviceSearchHasNoResults: boolean;
  resultNotFoundContent: React.ReactNode;
};

export const ServicesTab = ({
  gatewayDiscoveryWarningPanel,
  isGatewayDiscoveryFailureEmptyState,
  gatewayDiscoveryFailureContent,
  servicesListState,
  searchToolbar,
  visibleServices,
  columns,
  serviceSearchHasNoResults,
  resultNotFoundContent,
}: ServicesTabProps) => (
  <>
    {!isGatewayDiscoveryFailureEmptyState && gatewayDiscoveryWarningPanel}
    {servicesListState.loading &&
      !isGatewayDiscoveryFailureEmptyState &&
      !servicesListState.value && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          my={10}
        >
          <CircularProgress color="primary" size={50} thickness={4} />
          <Box mt={2}>
            <Typography variant="h6" color="textSecondary">
              Fetching Services...
            </Typography>
          </Box>
        </Box>
      )}
    {servicesListState.error && (
      <WarningPanel
        title="Failed to load Services"
        message={servicesListState.error.message}
      />
    )}
    {isGatewayDiscoveryFailureEmptyState && gatewayDiscoveryFailureContent}
    {!servicesListState.loading &&
      !isGatewayDiscoveryFailureEmptyState &&
      (!servicesListState.value?.list ||
        servicesListState.value.list.length === 0) && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          my={10}
          textAlign="center"
        >
          <Box mt={3} maxWidth={600}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 500 }}>
              No Services Available
            </Typography>
            <Typography variant="body1" color="textSecondary">
              We could not find any Services in your WSO2 environments.
            </Typography>
          </Box>
        </Box>
      )}
    {servicesListState.value?.list &&
      servicesListState.value.list.length > 0 && (
        <>
          {searchToolbar}
          {visibleServices.length > 0 ? (
            <Table
              options={{ paging: true, search: false, toolbar: false }}
              icons={tableIconsWithoutSearchClear}
              columns={columns}
              data={visibleServices}
            />
          ) : (
            serviceSearchHasNoResults && resultNotFoundContent
          )}
        </>
      )}
  </>
);
