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

import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import RefreshIcon from '@material-ui/icons/Refresh';
import { Table, TableColumn, WarningPanel } from '@backstage/core-components';
import { Wso2ApiSummary } from '../../../api';
import { tableIconsWithoutSearchClear } from '../../common/Table/tableRenderers';

type ApiTabProps = {
  gatewayDiscoveryWarningPanel: React.ReactNode;
  isGatewayDiscoveryFailureEmptyState: boolean;
  gatewayDiscoveryFailureContent: React.ReactNode;
  apiListState: any;
  apiCount: number;
  offlineGatewayCount: number;
  apiTableToolbar: React.ReactNode;
  visibleApis: Wso2ApiSummary[];
  columns: TableColumn<Wso2ApiSummary>[];
  apiSearchHasNoResults: boolean;
  apiFiltersHaveNoResults: boolean;
  apiEmptyContent: string;
  apiEmptyStateClassName: string;
};

export const ApiTab = ({
  gatewayDiscoveryWarningPanel,
  isGatewayDiscoveryFailureEmptyState,
  gatewayDiscoveryFailureContent,
  apiListState,
  apiCount,
  offlineGatewayCount,
  apiTableToolbar,
  visibleApis,
  columns,
  apiSearchHasNoResults,
  apiFiltersHaveNoResults,
  apiEmptyContent,
  apiEmptyStateClassName,
}: ApiTabProps) => (
  <>
    {!isGatewayDiscoveryFailureEmptyState && gatewayDiscoveryWarningPanel}
    {apiListState.loading &&
      !isGatewayDiscoveryFailureEmptyState &&
      (!apiListState.value?.apis || apiListState.value.apis.length === 0) && (
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
              Fetching APIs...
            </Typography>
          </Box>
        </Box>
      )}
    {apiListState.error && (
      <WarningPanel
        title="Failed to load APIs"
        message={apiListState.error.message}
      />
    )}
    {isGatewayDiscoveryFailureEmptyState && gatewayDiscoveryFailureContent}
    {!apiListState.loading &&
      !isGatewayDiscoveryFailureEmptyState &&
      offlineGatewayCount > 0 &&
      apiCount === 0 && (
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
              No APIs Available
            </Typography>
            <Typography variant="body1" color="textSecondary">
              We could not find any APIs in your catalog, and gateway discovery
              failed. Please check your backend logs or gateway configuration.
            </Typography>
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => apiListState.retry()}
                startIcon={<RefreshIcon />}
                disabled={apiListState.loading}
              >
                Refresh Now
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    {apiCount > 0 && (
        <>
          {apiTableToolbar}
          {visibleApis.length > 0 ? (
            <Table
              options={{
                paging: true,
                search: false,
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                toolbar: false,
              }}
              icons={tableIconsWithoutSearchClear}
              columns={columns}
              data={visibleApis}
            />
          ) : (
            (apiSearchHasNoResults || apiFiltersHaveNoResults) && (
              <Box className={apiEmptyStateClassName}>
                <Typography variant="body1" color="textSecondary">
                  {apiEmptyContent}
                </Typography>
              </Box>
            )
          )}
        </>
      )}
  </>
);
