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

export const useStyles = makeStyles(_theme => ({
  root: {
    '& .BackstageHeader-title, & .BackstageHeader-subtitle': {
      color: '#ffffff',
    },
    '& .BackstageHeader-subtitle': {
      maxWidth: 'none',
      whiteSpace: 'nowrap',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#ff5000',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#e04600',
      },
    },
  },

  cardLabel: {
    color:
      _theme.palette.type === 'dark'
        ? _theme.palette.text.secondary
        : '#4a5568', // Dark gray
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: '4px',
  },

  tabBarContainer: {
    marginTop: _theme.spacing(2),
    marginBottom: 0,
    padding: 0,
    backgroundColor: 'transparent',
    border: 0,
    borderBottom: `1px solid ${
      _theme.palette.type === 'dark' ? _theme.palette.divider : '#e0e0e0'
    }`,
    boxShadow: 'none',
  },
  tabs: {
    minHeight: 48,
    '& .MuiTabs-flexContainer': {
      gap: _theme.spacing(0.5),
      flexWrap: 'wrap',
    },
    '& .MuiTabs-indicator': {
      display: 'none !important',
    },
  },
  tab: {
    minHeight: 48,
    minWidth: 132,
    padding: _theme.spacing(1.25, 3),
    border: '1px solid transparent',
    borderRadius: '6px 6px 0 0',
    backgroundColor: 'transparent',
    color:
      _theme.palette.type === 'dark'
        ? _theme.palette.text.secondary
        : '#304271',
    fontWeight: 700,
    textTransform: 'none',
    transition:
      'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, color 160ms ease',
    '&:hover': {
      backgroundColor:
        _theme.palette.type === 'dark'
          ? _theme.palette.action.hover
          : '#eef3fb',
      color:
        _theme.palette.type === 'dark'
          ? _theme.palette.text.primary
          : undefined,
    },
    '&.Mui-selected': {
      backgroundColor: '#304271',
      borderColor: '#304271',
      color: '#ffffff',
      boxShadow: 'none',
    },
  },

  debugInfo: {
    fontSize: '0.75rem',
    color:
      _theme.palette.type === 'dark'
        ? _theme.palette.text.secondary
        : '#718096',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  apiTableToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: _theme.spacing(2),
    width: '100%',
    paddingTop: _theme.spacing(2),
    paddingBottom: _theme.spacing(1.5),
    paddingRight: _theme.spacing(3),
    flexWrap: 'wrap',
  },
  apiTableSearch: {
    '& .MuiToolbar-root': {
      minHeight: 48,
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiFormControl-root': {
      paddingLeft: 0,
    },
  },
  apiEmptyState: {
    minHeight: 260,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  apiFilterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: _theme.spacing(2),
    flexWrap: 'wrap',
  },
  apiFilterSelect: {
    minWidth: 200,
    '& .MuiInputLabel-outlined': {
      backgroundColor: _theme.palette.background.paper,
      padding: '0 4px',
    },
  },
}));
