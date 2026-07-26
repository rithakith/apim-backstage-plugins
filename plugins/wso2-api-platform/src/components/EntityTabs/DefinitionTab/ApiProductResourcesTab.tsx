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

import { useMemo } from 'react';
import { Table } from '@backstage/core-components';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Wso2ApiProductResource } from '../../../api';

const PRODUCT_RESOURCES_ANNOTATION = 'wso2.com/product-resources';

const getVerbColor = (verb: string) => {
  switch (verb.toUpperCase()) {
    case 'GET':
      return '#61affe';
    case 'POST':
      return '#49cc90';
    case 'PUT':
      return '#fca130';
    case 'DELETE':
      return '#f93e3e';
    case 'PATCH':
      return '#50e3c2';
    default:
      return '#999';
  }
};

export const EntityWso2ApiProductResourcesTab = () => {
  const { entity } = useEntity();
  const productResourcesRaw =
    entity.metadata.annotations?.[PRODUCT_RESOURCES_ANNOTATION];

  const data = useMemo(() => {
    if (!productResourcesRaw) return [];
    try {
      const resources = JSON.parse(
        productResourcesRaw,
      ) as Wso2ApiProductResource[];
      return resources.flatMap(res =>
        res.operations.map(op => ({
          name: res.name,
          version: res.version,
          target: op.target,
          verb: op.verb,
        })),
      );
    } catch (e) {
      return [];
    }
  }, [productResourcesRaw]);

  if (data.length === 0) {
    return null;
  }

  const groupedData = data.reduce((acc, row) => {
    if (!acc[row.name]) acc[row.name] = [];
    acc[row.name].push(row);
    return acc;
  }, {} as Record<string, typeof data>);

  const columns = [
    { title: 'Path', field: 'target' },
    {
      title: 'Method',
      field: 'verb',
      render: (rowData: any) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: getVerbColor(rowData.verb),
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.8rem',
          }}
        >
          {rowData.verb}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Object.entries(groupedData).map(([apiName, rows]) => (
        <Accordion key={apiName} defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{`${apiName} : ${
              rows[0]?.version || ''
            }`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={{ display: 'block', padding: 0 }}>
            <Table
              options={{ search: true, paging: true, pageSize: 5 }}
              columns={columns}
              data={rows}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
