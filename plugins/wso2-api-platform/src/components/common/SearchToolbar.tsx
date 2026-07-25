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
import { MTableToolbar } from '@material-table/core';
import { tableIconsWithoutSearchClear } from './Table/tableRenderers';

type SearchToolbarProps = {
  searchPlaceholder: string;
  searchText: string;
  onSearchChanged: (searchText: string) => void;
  data: object[];
  tableSearchClassName: string;
  searchFieldAlignment?: 'left' | 'right';
};

export const SearchToolbar = ({
  searchPlaceholder,
  searchText,
  onSearchChanged,
  data,
  tableSearchClassName,
  searchFieldAlignment = 'right',
}: SearchToolbarProps) => (
  <Box className={tableSearchClassName}>
    <MTableToolbar
      actions={[]}
      columns={[]}
      columnsButton={false}
      components={{ Actions: () => null }}
      data={data}
      dataManager={{ changeSearchText: () => undefined }}
      exportAllData={false}
      exportMenu={[]}
      getFieldValue={() => undefined}
      icons={tableIconsWithoutSearchClear}
      localization={{
        searchPlaceholder,
        searchTooltip: 'Search',
        searchAriaLabel: searchPlaceholder,
        clearSearchAriaLabel: 'Clear Search',
      }}
      onColumnsChanged={() => undefined}
      onSearchChanged={onSearchChanged}
      renderData={data}
      search
      searchFieldAlignment={searchFieldAlignment}
      searchText={searchText}
      selectedRows={[]}
      showTextRowsSelected
      showTitle={false}
      toolbarButtonAlignment="right"
    />
  </Box>
);
