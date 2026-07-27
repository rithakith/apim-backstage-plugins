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
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
import { Wso2ApiDocument } from '../../../../api';

export const Wso2SingleDocumentView = (options: {
  document: Wso2ApiDocument;
  onDownload: (doc: Wso2ApiDocument) => void;
  renderPreview: () => React.ReactNode;
}) => {
  const { document: doc, onDownload, renderPreview } = options;
  const isPreviewable =
    doc.sourceType === 'MARKDOWN' || doc.sourceType === 'INLINE';

  if (isPreviewable) {
    return <>{renderPreview()}</>;
  }

  return (
    <Box
      p={3}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      border={1}
      borderColor="divider"
      borderRadius={4}
    >
      <Box pr={2}>
        <Box display="flex" alignItems="center" mb={1} flexWrap="wrap">
          <Typography variant="h5" style={{ marginRight: 16 }}>
            {doc.name}
          </Typography>
          <Chip
            label={doc.type}
            color="primary"
            variant="outlined"
            size="small"
            style={{ marginRight: 8 }}
          />
          <Chip label={doc.sourceType} variant="outlined" size="small" />
        </Box>
        <Typography variant="body1" color="textSecondary">
          {doc.summary}
        </Typography>
      </Box>

      {doc.sourceType !== 'INLINE' && doc.sourceType !== 'MARKDOWN' && (
        <Box flexShrink={0}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={() => onDownload(doc)}
          >
            Download
          </Button>
        </Box>
      )}
    </Box>
  );
};
