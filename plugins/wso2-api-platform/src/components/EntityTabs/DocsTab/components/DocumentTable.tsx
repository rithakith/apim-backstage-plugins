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

import { Table } from '@backstage/core-components';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { Wso2ApiDocument } from '../../../../api';
import { getApiTypeChipStyle } from '../../../common/Table/tableRenderers';

export const Wso2DocumentTable = (options: {
  documents: Wso2ApiDocument[];
  onPreview: (doc: Wso2ApiDocument) => void;
  onDownload: (doc: Wso2ApiDocument) => void;
}) => {
  const { documents, onPreview, onDownload } = options;

  const columns = [
    {
      title: 'Name',
      field: 'name',
      render: (rowData: Wso2ApiDocument) => (
        <Link
          href="#"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            if (
              rowData.sourceType === 'MARKDOWN' ||
              rowData.sourceType === 'INLINE'
            ) {
              onPreview(rowData);
            } else {
              onDownload(rowData);
            }
          }}
          style={{
            color: '#0A66C2',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {rowData.name}
        </Link>
      ),
    },
    {
      title: 'Type',
      field: 'type',
      render: (rowData: Wso2ApiDocument) => (
        <Chip size="small" label={rowData.type} style={getApiTypeChipStyle()} />
      ),
    },
    {
      title: 'Source',
      field: 'sourceType',
      render: (rowData: Wso2ApiDocument) => {
        const isPreviewable =
          rowData.sourceType === 'MARKDOWN' || rowData.sourceType === 'INLINE';
        return (
          <Typography variant="body2" color="textSecondary">
            {rowData.sourceType} {isPreviewable ? '(Previewable)' : ''}
          </Typography>
        );
      },
    },
    { title: 'Summary', field: 'summary' },
  ];

  return (
    <Table
      options={{ paging: documents.length > 5, search: false }}
      columns={columns}
      data={documents}
    />
  );
};
