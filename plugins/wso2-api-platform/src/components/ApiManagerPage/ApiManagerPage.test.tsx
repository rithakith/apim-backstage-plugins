/**
 * @jest-environment jsdom
 */
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

import { Fragment } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Wso2ApiPlatformPage } from './ApiManagerPage';

const mockWso2Api = {
  getGateways: jest.fn(),
  getRuntimeConfig: jest.fn(),
  getCatalogSyncStatus: jest.fn(),

  getServices: jest.fn(),
  getAllServices: jest.fn(),
  getServiceUsage: jest.fn(),
  getServiceDefinition: jest.fn(),
};

const mockOAuthApi = {
  getAccessToken: jest.fn(),
};

const mockCatalogApi = {
  getEntities: jest.fn(),
};

const mockConfigApi = {
  getOptionalNumber: jest.fn(),
  getOptionalBoolean: jest.fn(),
};

jest.mock('../../api', () => ({
  wso2ApiPlatformApiRef: { id: 'plugin.wso2-api-platform.service' },
  wso2AuthApiRef: { id: 'plugin.wso2-api-platform.auth' },
}));

jest.mock('@backstage/core-plugin-api', () => ({
  configApiRef: { id: 'core.config' },
  useApi: (apiRef: { id: string }) => {
    if (apiRef.id === 'plugin.wso2-api-platform.service') {
      return mockWso2Api;
    }
    if (apiRef.id === 'plugin.wso2-api-platform.auth') {
      return mockOAuthApi;
    }
    if (apiRef.id === 'core.config') {
      return mockConfigApi;
    }
    if (apiRef.id === 'plugin.catalog.service') {
      return mockCatalogApi;
    }
    throw new Error(`Unexpected apiRef: ${apiRef.id}`);
  },
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  catalogApiRef: { id: 'plugin.catalog.service' },
}));

jest.mock('@material-table/core', () => ({
  MTableToolbar: ({ localization, onSearchChanged, searchText }: any) => (
    <input
      aria-label={localization.searchAriaLabel}
      placeholder={localization.searchPlaceholder}
      value={searchText}
      onChange={event => onSearchChanged(event.target.value)}
    />
  ),
}));

jest.mock('@backstage/core-components', () => ({
  Content: ({ children }: any) => <main>{children}</main>,
  ContentHeader: ({ children }: any) => <div>{children}</div>,
  Header: ({ title, subtitle }: any) => (
    <header>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  Page: ({ children }: any) => <div>{children}</div>,
  Table: ({
    columns,
    data,
    detailPanel,
    title,
    emptyContent,
    actions,
    components,
  }: any) => (
    <div>
      {title}
      {components?.Toolbar && <components.Toolbar />}
      {actions?.map((action: any, index: number) =>
        action.position === 'toolbar' && components?.Action ? (
          <components.Action key={index} action={action} />
        ) : null,
      )}
      <table>
        <thead>
          <tr>
            {columns.map((column: any) => (
              <th key={column.title}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && emptyContent && (
            <tr>
              <td colSpan={columns.length}>{emptyContent}</td>
            </tr>
          )}
          {data.map((row: any, rowIndex: number) => (
            <Fragment key={row.id || row.name || rowIndex}>
              <tr>
                {columns.map((column: any) => (
                  <td key={column.title}>
                    {column.render
                      ? column.render(row)
                      : String(row[column.field] ?? '')}
                  </td>
                ))}
              </tr>
              {detailPanel && (
                <tr>
                  <td colSpan={columns.length} data-testid="detail-panel">
                    {detailPanel(row)}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  ),
  WarningPanel: ({ title, message, children }: any) => (
    <section role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {children}
    </section>
  ),
}));

const catalogEntities = [
  {
    kind: 'API',
    metadata: {
      name: 'customer-api',
      namespace: 'wso2',
      annotations: {
        'wso2.com/api-id': 'api-1',
        'wso2.com/api-name': 'Customer API',
        'wso2.com/api-version': '1.0.0',
        'wso2.com/api-context': '/customers',
        'wso2.com/api-lifecycle-status': 'PUBLISHED',
        'wso2.com/api-type': 'HTTP',
        'wso2.com/api-gateway': 'wso2',
      },
    },
  },
  {
    kind: 'API',
    metadata: {
      name: 'sales-product',
      namespace: 'wso2',
      title: 'Sales Product',
      annotations: {
        'wso2.com/api-id': 'product-1',
        'wso2.com/is-api-product': 'true',
        'wso2.com/api-name': 'Sales Product',
        'wso2.com/api-version': '2.0.0',
        'wso2.com/api-context': '/sales',
        'wso2.com/api-lifecycle-status': 'PUBLISHED',
        'wso2.com/api-gateway': 'wso2',
      },
    },
  },
  {
    kind: 'API',
    metadata: {
      name: 'agent-mcp',
      namespace: 'wso2',
      description: 'Agent tools',
      annotations: {
        'wso2.com/api-id': 'mcp-1',
        'wso2.com/is-mcp-server': 'true',
        'wso2.com/api-name': 'Agent MCP',
        'wso2.com/api-version': '1.1.0',
        'wso2.com/api-context': '/agent',
        'wso2.com/api-lifecycle-status': 'PUBLISHED',
      },
    },
  },
  {
    kind: 'API',
    metadata: {
      name: 'inventory-service',
      namespace: 'wso2',
      annotations: {
        'wso2.com/is-service': 'true',
        'wso2.com/service-id': 'svc-1',
        'wso2.com/service-name': 'Inventory Service',
        'wso2.com/service-version': '1.0.0',
        'wso2.com/service-url': 'https://services.example.com/inventory',
        'wso2.com/service-usage-count': '1 API',
      },
    },
  },
];

function setupMocks(options?: {
  entities?: any[];
  gateways?: any[];
  services?: any[];
  catalogError?: Error;
  syncStatus?: any;
  apimEnabled?: boolean;
  apiPlatformEnabled?: boolean;
  exposeFrontendConfig?: boolean;
}) {
  mockOAuthApi.getAccessToken.mockResolvedValue('wso2-user-token');
  mockConfigApi.getOptionalNumber.mockReturnValue(60);
  mockConfigApi.getOptionalBoolean.mockImplementation((key: string) => {
    if (options?.exposeFrontendConfig === false) {
      return undefined;
    }
    if (key === 'wso2ApiPlatform.enabled') {
      return options?.apimEnabled ?? true;
    }
    if (key === 'wso2PlatformGateway.enabled') {
      return options?.apiPlatformEnabled ?? true;
    }
    return undefined;
  });
  mockWso2Api.getRuntimeConfig.mockResolvedValue({
    apiManager: { enabled: options?.apimEnabled ?? true },
    platformGateway: {
      enabled: options?.apiPlatformEnabled ?? true,
      gatewayCount: options?.gateways?.length ?? 0,
    },
  });
  mockWso2Api.getServiceUsage.mockResolvedValue({
    list: [
      {
        id: 'api-1',
        name: 'Customer API',
        version: '1.0.0',
        context: '/customers',
        provider: 'admin',
      },
    ],
  });
  mockWso2Api.getServiceDefinition.mockResolvedValue('{"swagger": "2.0"}');
  mockWso2Api.getGateways.mockResolvedValue(options?.gateways ?? []);
  mockWso2Api.getCatalogSyncStatus.mockResolvedValue(
    options?.syncStatus ?? {
      phase: 'complete',
      message: 'Catalog sync complete',
      publisherApis: { loaded: 1, total: 1 },
      totals: { catalogEntities: 1 },
    },
  );

  mockWso2Api.getServices.mockResolvedValue({
    list: options?.services ?? [
      {
        id: 'svc-1',
        name: 'Inventory Service',
        version: '1.0.0',
        serviceUrl: 'https://services.example.com/inventory',
        definitionType: 'OAS',
        usage: '1 API',
      },
    ],
  });
  mockWso2Api.getAllServices.mockResolvedValue({
    list: options?.services ?? [
      {
        id: 'svc-1',
        name: 'Inventory Service',
        version: '1.0.0',
        serviceUrl: 'https://services.example.com/inventory',
        definitionType: 'OAS',
        usage: '1 API',
      },
    ],
  });

  if (options?.catalogError) {
    mockCatalogApi.getEntities.mockRejectedValue(options.catalogError);
  } else {
    mockCatalogApi.getEntities.mockResolvedValue({
      items: options?.entities ?? catalogEntities,
      totalItems: options?.entities?.length ?? catalogEntities.length,
    });
  }
}

describe('Wso2ApiPlatformPage', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    setupMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders the page header, filters, tabs, and API table rows', async () => {
    render(<Wso2ApiPlatformPage />);

    expect(screen.getByText('WSO2 API Platform')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'APIs' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'API Products' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'MCP Servers' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Services' })).toBeInTheDocument();

    expect(await screen.findByText('Customer API')).toBeInTheDocument();
  });

  it('paginates catalog API entity loading until all pages are fetched', async () => {
    mockCatalogApi.getEntities
      .mockResolvedValueOnce({
        items: [catalogEntities[0]],
        totalItems: 2,
      })
      .mockResolvedValueOnce({
        items: [catalogEntities[1]],
        totalItems: 2,
      });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();
  });

  it('shows and clears the API search empty state dynamically', async () => {
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search APIs');
    fireEvent.change(searchInput, { target: { value: 'non-existent-api' } });

    expect(await screen.findByText('Result not found')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Customer API')).toBeInTheDocument();
  });

  it('shows selected filter empty state outside of the API table', async () => {
    setupMocks({
      entities: [catalogEntities[0]],
      gateways: [
        {
          name: 'Choreo Gateway',
          status: 'Online',
          gatewayType: 'choreo',
          discoveredApis: [],
        },
      ],
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();

    const gatewaySelect = screen.getByRole('button', {
      name: /Select Gateway/i,
    });
    fireEvent.mouseDown(gatewaySelect);
    fireEvent.click(await screen.findByRole('option', { name: 'Choreo' }));

    expect(
      screen.getByText('No APIs match the selected filters'),
    ).toBeInTheDocument();
  });

  it('shows an API loading state while catalog entities are still loading', async () => {
    mockCatalogApi.getEntities.mockReturnValue(new Promise(() => {}));

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Fetching APIs...')).toBeInTheDocument();
  });

  it('shows a blocking API error when catalog loading fails', async () => {
    setupMocks({ catalogError: new Error('Catalog is unavailable') });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Failed to load APIs')).toBeInTheDocument();
    expect(screen.getByText('Catalog is unavailable')).toBeInTheDocument();
  });

  it('shows visible APIM APIs when publisher total is not available', async () => {
    setupMocks({
      entities: [catalogEntities[0]],
      syncStatus: {
        phase: 'fetching',
        message: 'Syncing',
        publisherApis: { loaded: 5 },
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();
  });

  it('triggers APIM refresh and keeps waiting when gateway APIs load while APIM sync is idle', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Online Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [],
        },
      ],
      syncStatus: {
        phase: 'idle',
        message: 'Sync has not run yet.',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('No APIs Available')).toBeInTheDocument();
  });

  it('shows catalog APIs even when a gateway is offline', async () => {
    setupMocks({
      gateways: [
        {
          name: 'Offline Gateway',
          status: 'Offline',
          gatewayType: 'wso2',
          discoveredApis: [],
        },
      ],
    });

    render(<Wso2ApiPlatformPage />);

    // No gateway warning shown — this is a discovery portal, infra issues go to admin logs
    expect(
      screen.queryByText('Gateway Discovery Warning'),
    ).not.toBeInTheDocument();
    // Catalog APIs are still visible
    expect(await screen.findByText('Customer API')).toBeInTheDocument();
  });

  it('renders API Products, MCP Servers, and Services from their tabs', async () => {
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(await screen.findByText('Sales Product')).toBeInTheDocument();
    expect(screen.getByText('/sales')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(await screen.findByText('Agent MCP')).toBeInTheDocument();
    expect(screen.getByText('/agent')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Services' }));
    expect(await screen.findByText('Inventory Service')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Inventory Service' }),
    ).toHaveAttribute('href', '/catalog/wso2/api/inventory-service');
    expect(
      screen.getByText('https://services.example.com/inventory'),
    ).toBeInTheDocument();
  });

  it('shows and clears result-not-found messages for other table searches', async () => {
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    await screen.findByText('Sales Product');
    fireEvent.change(screen.getByPlaceholderText('Search API Products'), {
      target: { value: 'missing-product' },
    });
    expect(screen.getByText('Result not found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search API Products'), {
      target: { value: 'Sales' },
    });
    expect(screen.queryByText('Result not found')).not.toBeInTheDocument();
    expect(screen.getByText('Sales Product')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    await screen.findByText('Agent MCP');
    fireEvent.change(screen.getByPlaceholderText('Search MCP Servers'), {
      target: { value: 'missing-mcp' },
    });
    expect(screen.getByText('Result not found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search MCP Servers'), {
      target: { value: 'Agent' },
    });
    expect(screen.queryByText('Result not found')).not.toBeInTheDocument();
    expect(screen.getByText('Agent MCP')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Services' }));
    await screen.findByText('Inventory Service');
    fireEvent.change(screen.getByPlaceholderText('Search Services'), {
      target: { value: 'missing-service' },
    });
    expect(screen.getByText('Result not found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search Services'), {
      target: { value: 'inventory' },
    });
    expect(screen.queryByText('Result not found')).not.toBeInTheDocument();
    expect(screen.getByText('Inventory Service')).toBeInTheDocument();
  });

  it('filters APIs by selecting a type and gateway', async () => {
    render(<Wso2ApiPlatformPage />);
    await screen.findByText('Customer API');

    const typeSelect = screen.getByRole('button', { name: /Select Type/i });
    fireEvent.mouseDown(typeSelect);
    const typeOption = await screen.findByRole('option', { name: 'HTTP' });
    fireEvent.click(typeOption);

    const gatewaySelect = screen.getByRole('button', {
      name: /Select Gateway/i,
    });
    fireEvent.mouseDown(gatewaySelect);
    const gatewayOption = await screen.findByRole('option', { name: 'WSO2' });
    fireEvent.click(gatewayOption);

    expect(screen.getByText('Customer API')).toBeInTheDocument();
  });

  it('only shows API type and gateway filters on the APIs tab', async () => {
    render(<Wso2ApiPlatformPage />);
    await screen.findByText('Customer API');

    expect(
      screen.getByRole('button', { name: /Select Type/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Select Gateway/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(
      screen.queryByRole('button', { name: /Select Type/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Select Gateway/i }),
    ).not.toBeInTheDocument();
  });

  it('renders API Products empty state', async () => {
    setupMocks({ entities: [] });
    render(<Wso2ApiPlatformPage />);
    expect(await screen.findByText('No APIs Available')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(
      await screen.findByText('No API Products Available'),
    ).toBeInTheDocument();
  });

  it('renders MCP empty state', async () => {
    setupMocks({ entities: [] });
    render(<Wso2ApiPlatformPage />);
    expect(await screen.findByText('No APIs Available')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(
      await screen.findByText('No MCP Servers Available'),
    ).toBeInTheDocument();
  });

  it('renders Services error state', async () => {
    setupMocks({ catalogError: new Error('Catalog service failed') });
    render(<Wso2ApiPlatformPage />);
    expect(await screen.findByText('Failed to load APIs')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Services' }));
    expect(
      await screen.findByText('Failed to load Services'),
    ).toBeInTheDocument();
  });

  it('extracts gateways correctly from various annotations', async () => {
    const customEntities = [
      {
        kind: 'API',
        metadata: {
          name: 'gw-api-1',
          namespace: 'wso2',
          annotations: {
            'wso2.com/api-id': 'api-gw-1',
            'wso2.com/api-name': 'GW API 1',
            'wso2.com/api-endpoints': JSON.stringify([
              {
                environmentName: 'prod-env',
                displayName: 'Production Environment',
                gatewayType: 'wso2/synapse',
              },
            ]),
          },
        },
      },
      {
        kind: 'API',
        metadata: {
          name: 'gw-api-2',
          namespace: 'wso2',
          annotations: {
            'wso2.com/api-id': 'api-gw-2',
            'wso2.com/api-name': 'GW API 2',
            'wso2.com/gateway-endpoints': JSON.stringify([
              {
                name: 'staging-gw',
                gatewayType: 'kong',
              },
            ]),
            'wso2-gateway.com/discovered-from': 'discovered-env',
          },
        },
      },
      {
        kind: 'API',
        metadata: {
          name: 'gw-api-3',
          namespace: 'wso2',
          annotations: {
            'wso2.com/api-id': 'api-gw-3',
            'wso2.com/api-name': 'GW API 3',
            'wso2.com/api-gateway-vendor': 'apigee',
          },
        },
      },
      {
        kind: 'API',
        metadata: {
          name: 'gw-api-4',
          namespace: 'wso2',
          annotations: {
            'wso2.com/api-id': 'api-gw-4',
            'wso2.com/api-name': 'GW API 4',
            'wso2.com/api-endpoints': 'invalid-json',
          },
        },
      },
      {
        kind: 'API',
        metadata: {
          name: 'gw-api-5',
          namespace: 'wso2',
          annotations: {
            'wso2.com/api-id': 'api-gw-5',
            'wso2.com/api-name': 'GW API 5',
            'wso2.com/gateway-endpoints': 'invalid-json',
          },
        },
      },
    ];

    setupMocks({ entities: customEntities });
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('GW API 1')).toBeInTheDocument();
    expect(screen.getByText('GW API 2')).toBeInTheDocument();
    expect(screen.getByText('GW API 3')).toBeInTheDocument();
    expect(screen.getByText('GW API 4')).toBeInTheDocument();
    expect(screen.getByText('GW API 5')).toBeInTheDocument();
  });

  it('merges live gateway-discovered APIs matching catalog API', async () => {
    setupMocks({
      gateways: [
        {
          name: 'Kong Runtime',
          status: 'Online',
          gatewayType: 'kong',
          discoveredApis: [
            {
              id: 'api-1',
              name: 'Customer API',
              version: '1.0.0',
              context: '/customers',
              type: 'HTTP',
            },
          ],
        },
      ],
    });
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();
  });

  it('handles gateway fetch error', async () => {
    mockWso2Api.getGateways.mockRejectedValueOnce(
      new Error('Gateway fetch failed'),
    );
    render(<Wso2ApiPlatformPage />);
    expect(await screen.findByText('Customer API')).toBeInTheDocument();
  });

  it('allows manual refresh when catalog is empty', async () => {
    setupMocks({ entities: [] });
    render(<Wso2ApiPlatformPage />);
    expect(await screen.findByText('No APIs Available')).toBeInTheDocument();

    const refreshButton = screen.getByRole('button', { name: /Refresh Now/i });
    fireEvent.click(refreshButton);

    expect(mockCatalogApi.getEntities).toHaveBeenCalledTimes(2);
  });

  it('shows Refresh Now across tabs when catalog is empty and gateway is offline', async () => {
    setupMocks({
      entities: [],
      services: [],
      gateways: [
        {
          name: 'Offline Gateway',
          status: 'Offline',
          gatewayType: 'wso2',
          discoveredApis: [],
        },
      ],
      syncStatus: {
        phase: 'failed',
        message: 'Catalog sync failed',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Refresh Now')).toBeInTheDocument();
    // No gateway warning — infra issues are for admins, not portal users
    expect(
      screen.queryByText('Gateway Discovery Warning'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(screen.getByText('Refresh Now')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(screen.getByText('Refresh Now')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Services' }));
    expect(screen.getByText('Refresh Now')).toBeInTheDocument();
  });
});
