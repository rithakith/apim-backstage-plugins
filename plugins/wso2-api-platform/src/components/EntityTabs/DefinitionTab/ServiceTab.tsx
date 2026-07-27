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

import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { EmptyState, InfoCard, Link, Table } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import { ApiDefinitionViewer } from './ApiDefinitionViewer';

const SERVICE_ID_ANNOTATION = 'wso2.com/service-id';

const useStyles = makeStyles(theme => ({
  subTabs: {
    '& .MuiTabs-indicator': {
      height: 4,
      backgroundColor: theme.palette.primary.main,
    },
  },
  tabRoot: {
    minWidth: 120,
    textTransform: 'none',
    fontWeight: 600,
    '&.Mui-selected': {
      borderBottom: `4px solid ${theme.palette.primary.main}`,
    },
  },
}));

const normalizeEntityName = (name?: string) =>
  (name || 'unknown')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .toLocaleLowerCase('en-US');

const formatDefinition = (value?: string) => {
  if (!value) {
    return '';
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

export const EntityWso2ServiceDefinitionCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);
  const serviceId = entity.metadata.annotations?.[SERVICE_ID_ANNOTATION];
  const [activeTab, setActiveTab] = useState<'usage' | 'source'>('usage');

  const usageRows = useMemo(() => {
    try {
      const usageStr =
        entity.metadata.annotations?.['wso2.com/service-usage-list'];
      if (!usageStr) {
        return [];
      }
      return JSON.parse(usageStr);
    } catch {
      return [];
    }
  }, [entity]);

  const definitionStr = useMemo(() => {
    const def = entity.spec?.definition as string | undefined;
    if (def === 'WSO2 Service Definition placeholder') {
      return undefined;
    }
    return def;
  }, [entity]);

  const catalogApiEntitiesState = useAsync(async () => {
    const response = await catalogApi.getEntities({
      filter: { kind: 'API' },
      fields: [
        'metadata.name',
        'metadata.namespace',
        'metadata.title',
        'metadata.annotations',
      ],
    });
    return response.items;
  }, [catalogApi]);

  const formattedDefinition = useMemo(
    () => formatDefinition(definitionStr),
    [definitionStr],
  );

  const catalogApiMap = useMemo(() => {
    const items = catalogApiEntitiesState.value || [];
    return items.map(item => {
      const itemAnnotations = item.metadata.annotations || {};
      return {
        id: itemAnnotations['wso2.com/api-id'],
        name: itemAnnotations['wso2.com/api-name'] || item.metadata.title,
        entityName: item.metadata.name,
        namespace: item.metadata.namespace || 'default',
      };
    });
  }, [catalogApiEntitiesState.value]);

  if (!serviceId) {
    return (
      <EmptyState
        title="Missing WSO2 service annotation"
        missing="info"
        description={`Add ${SERVICE_ID_ANNOTATION} to the entity annotations.`}
      />
    );
  }

  return (
    <InfoCard>
      <Box mb={2}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          className={classes.subTabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Usage" value="usage" className={classes.tabRoot} />
          <Tab label="View Source" value="source" className={classes.tabRoot} />
        </Tabs>
      </Box>

      {activeTab === 'usage' && (
        <>
          {usageRows.length === 0 && (
            <EmptyState
              title="No usage found"
              missing="data"
              description="This service is not currently used by any API or API Product."
            />
          )}
          {usageRows.length > 0 && (
            <Table
              options={{ search: false, paging: false, toolbar: false }}
              columns={[
                {
                  title: 'Name',
                  field: 'name',
                  render: (rowData: any) => {
                    const match = catalogApiMap.find(
                      item =>
                        item.id === rowData.id || item.name === rowData.name,
                    );
                    const label = rowData.displayName || rowData.name;
                    if (!match) {
                      return label;
                    }

                    return (
                      <Link
                        to={`/catalog/${match.namespace}/api/${
                          match.entityName || normalizeEntityName(label)
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  },
                },
                { title: 'Version', field: 'version' },
                { title: 'Context', field: 'context' },
                { title: 'Provider', field: 'provider' },
              ]}
              data={usageRows}
            />
          )}
        </>
      )}

      {activeTab === 'source' && (
        <>
          {!formattedDefinition && (
            <EmptyState
              title="No service definition"
              missing="data"
              description="This service does not have a definition available."
            />
          )}
          {formattedDefinition && (
            <Box>
              <ApiDefinitionViewer value={formattedDefinition} />
            </Box>
          )}
        </>
      )}
    </InfoCard>
  );
};
