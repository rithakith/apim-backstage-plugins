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

import { TableColumn } from '@backstage/core-components';
import {
  Wso2ApiProductSummary,
  Wso2ApiSummary,
  Wso2McpSummary,
} from '../../../api';
import {
  normalizeEntityName,
  renderRowLifecycleStatus,
} from '../../../utils/apiManagerUtils';
import {
  renderNameWithTypeChip,
  renderTruncatedContext,
  renderTruncatedNameLink,
  renderGatewayNames,
} from './tableRenderers';

export const apiColumns: TableColumn<Wso2ApiSummary>[] = [
  {
    title: 'Name',
    field: 'name',
    render: rowData => {
      const ns = rowData.namespace || 'default';
      const name = rowData.entityName || normalizeEntityName(rowData.name);
      return renderNameWithTypeChip(
        rowData.name,
        `/catalog/${ns}/api/${name}`,
        rowData.type,
      );
    },
  },
  { title: 'Version', field: 'version' },
  {
    title: 'Context',
    field: 'context',
    render: rowData => renderTruncatedContext(rowData.context),
  },
  {
    title: 'Gateways',
    field: 'gateways',
    render: rowData => renderGatewayNames(rowData.gateways),
  },
  {
    title: 'Lifecycle',
    field: 'lifeCycleStatus',
    render: rowData => renderRowLifecycleStatus(rowData),
  },
];

export const apiProductColumns: TableColumn<Wso2ApiProductSummary>[] = [
  {
    title: 'Name',
    field: 'name',
    render: rowData => {
      const ns = rowData.namespace || 'default';
      const name =
        (rowData as any).entityName || normalizeEntityName(rowData.name);
      return renderTruncatedNameLink(
        rowData.name,
        `/catalog/${ns}/api/${name}`,
      );
    },
  },
  { title: 'Version', field: 'version' },
  {
    title: 'Context',
    field: 'context',
    render: rowData => renderTruncatedContext(rowData.context),
  },
  {
    title: 'Gateways',
    field: 'gateways',
    render: rowData => renderGatewayNames(rowData.gateways),
  },
  {
    title: 'Lifecycle',
    field: 'lifeCycleStatus',
    render: rowData => renderRowLifecycleStatus(rowData),
  },
];

export const mcpColumns: TableColumn<Wso2McpSummary>[] = [
  {
    title: 'Name',
    field: 'name',
    render: rowData => {
      const ns = rowData.namespace || 'default';
      const name =
        (rowData as any).entityName || normalizeEntityName(rowData.name);
      return renderTruncatedNameLink(
        rowData.name,
        `/catalog/${ns}/api/${name}`,
      );
    },
  },
  { title: 'Version', field: 'version' },
  {
    title: 'Context',
    field: 'context',
    render: rowData => renderTruncatedContext(rowData.context),
  },
  {
    title: 'Gateways',
    field: 'gateways',
    render: rowData => renderGatewayNames(rowData.gateways),
  },
  {
    title: 'Lifecycle',
    field: 'lifeCycleStatus',
    render: rowData => renderRowLifecycleStatus(rowData),
  },
];

export const serviceColumns: TableColumn<any>[] = [
  {
    title: 'Name',
    field: 'name',
    render: rowData => {
      const ns = rowData.namespace || 'default';
      const name = rowData.entityName || normalizeEntityName(rowData.name);
      return renderTruncatedNameLink(
        rowData.name,
        `/catalog/${ns}/api/${name}`,
      );
    },
  },
  {
    title: 'Version',
    field: 'version',
    render: rowData => rowData.version || '-',
  },
  {
    title: 'Service Url',
    field: 'serviceUrl',
    render: rowData => renderTruncatedContext(rowData.serviceUrl) || '-',
  },
  {
    title: 'Usage',
    field: 'usage',
    render: rowData => (rowData.usage !== undefined && rowData.usage !== null && rowData.usage !== '' ? rowData.usage : '-'),
  },
];
