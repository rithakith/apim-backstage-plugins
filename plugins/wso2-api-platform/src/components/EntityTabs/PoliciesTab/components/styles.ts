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

import { makeStyles } from '@material-ui/core/styles';
import { CODE_FONT_FAMILY } from '../../../../styles/fonts';

export const useViewerStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: 'transparent',
  },
  simpleFieldsContainer: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === 'dark' ? 'rgba(255,255,255,0.02)' : 'white',
  },
  fieldBox: {
    marginBottom: theme.spacing(1),
  },
  label: {
    fontWeight: 600,
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: theme.spacing(0.5),
  },
  readOnlyField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor:
        theme.palette.type === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
      fontSize: '0.875rem',
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
    },
  },
  subAccordion: {
    marginBottom: theme.spacing(1.5),
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px !important',
    overflow: 'hidden',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      border: `1px solid ${theme.palette.divider}`,
    },
  },
  subAccordionSummary: {
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.03)',
    minHeight: '48px !important',
    '& .MuiAccordionSummary-content': {
      margin: '12px 0 !important',
    },
  },
  subAccordionTitle: {
    fontWeight: 700,
    fontSize: '0.8125rem',
    color: theme.palette.text.primary,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: theme.spacing(2),
    borderRadius: '4px',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: '0.8125rem',
    overflowX: 'auto',
    margin: 0,
    lineHeight: 1.6,
  },
}));

export const useListStyles = makeStyles(theme => ({
  policyAccordion: {
    marginBottom: theme.spacing(1),
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px !important',
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.02)'
        : 'rgba(0,0,0,0.01)',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      backgroundColor:
        theme.palette.type === 'dark' ? 'rgba(255,255,255,0.04)' : 'white',
    },
  },
  policyTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    color: theme.palette.type === 'dark' ? '#e0e0e0' : '#333333',
    letterSpacing: '0.2px',
  },
}));
