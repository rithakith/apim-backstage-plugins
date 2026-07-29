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
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useViewerStyles } from './styles';

export const humanize = (str: string): string => {
  if (!str) return '';
  let result = str.replace(/[-_]/g, ' ');
  result = result.replace(/([A-Z])/g, ' $1');
  return result
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const SimpleField = ({ label, value, classes }: any) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box className={classes.fieldBox}>
      <Typography className={classes.label}>{humanize(label)}</Typography>
      <TextField
        value={String(value ?? '—')}
        variant="outlined"
        fullWidth
        size="small"
        className={classes.readOnlyField}
        InputProps={{ readOnly: true }}
      />
    </Box>
  </Grid>
);

const SubSectionTile = ({ label, value, classes }: any) => (
  <Accordion className={classes.subAccordion} elevation={0}>
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      className={classes.subAccordionSummary}
    >
      <Typography className={classes.subAccordionTitle}>
        {humanize(label)} CONFIGURATION
      </Typography>
    </AccordionSummary>
    <AccordionDetails style={{ display: 'block', padding: 0 }}>
      <Box component="pre" className={classes.codeBlock}>
        {JSON.stringify(value, null, 2)}
      </Box>
    </AccordionDetails>
  </Accordion>
);

export const Wso2PolicyDetailsViewer = ({
  parameters,
}: {
  parameters: any;
}) => {
  const classes = useViewerStyles();

  if (!parameters || Object.keys(parameters).length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          No configuration parameters found for this policy.
        </Typography>
      </Box>
    );
  }

  const entries = Object.entries(parameters);
  const simpleFields = entries.filter(
    ([_, v]) => typeof v !== 'object' || v === null,
  );
  const complexFields = entries.filter(
    ([_, v]) => typeof v === 'object' && v !== null,
  );

  return (
    <Box className={classes.root}>
      {/* Simple Fields Grid */}
      {simpleFields.length > 0 && (
        <Box className={classes.simpleFieldsContainer}>
          <Typography
            variant="caption"
            style={{
              fontWeight: 800,
              color: '#666',
              display: 'block',
              marginBottom: '16px',
            }}
          >
            BASIC PARAMETERS
          </Typography>
          <Grid container spacing={2}>
            {simpleFields.map(([key, value]) => (
              <SimpleField
                key={key}
                label={key}
                value={value}
                classes={classes}
              />
            ))}
          </Grid>
        </Box>
      )}

      {/* Complex Fields (Tiles) */}
      {complexFields.map(([key, value]) => (
        <SubSectionTile key={key} label={key} value={value} classes={classes} />
      ))}
    </Box>
  );
};

export { humanize as getPolicyFriendlyName };
