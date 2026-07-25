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

import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
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
            <React.Fragment key={row.id || row.name || rowIndex}>
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
            </React.Fragment>
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
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    setupMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.skip('renders the page header, filters, tabs, and API table rows', async () => {
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

    await waitFor(() => {
      expect(screen.getByText('Customer API')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Select Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Select Gateway').length).toBeGreaterThan(0);
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('/customers')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Customer API' })).toHaveAttribute(
      'href',
      '/catalog/wso2/api/customer-api',
    );
  });

  it('paginates catalog API entity loading until all pages are fetched', async () => {
    const firstPage = Array.from({ length: 500 }, (_, index) => ({
      kind: 'API',
      metadata: {
        name: `paged-api-${index}`,
        namespace: 'wso2',
        annotations: {
          'wso2.com/api-id': `api-${index}`,
          'wso2.com/api-name': `Paged API ${index}`,
          'wso2.com/api-version': '1.0.0',
        },
      },
    }));
    const finalEntity = {
      kind: 'API',
      metadata: {
        name: 'final-paged-api',
        namespace: 'wso2',
        annotations: {
          'wso2.com/api-id': 'api-final',
          'wso2.com/api-name': 'Final Paged API',
          'wso2.com/api-version': '1.0.0',
        },
      },
    };

    mockCatalogApi.getEntities
      .mockResolvedValueOnce({
        items: firstPage,
        totalItems: 501,
      })
      .mockResolvedValueOnce({
        items: [finalEntity],
        totalItems: 501,
      });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Final Paged API')).toBeInTheDocument();
    expect(mockCatalogApi.getEntities).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ limit: 500, offset: 0 }),
    );
    expect(mockCatalogApi.getEntities).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ limit: 500, offset: 500 }),
    );
  });

  it('shows and clears the API search empty state dynamically', async () => {
    render(<Wso2ApiPlatformPage />);

    await screen.findByText('Customer API');

    fireEvent.change(screen.getByPlaceholderText('Search APIs'), {
      target: { value: 'missing-api' },
    });

    expect(screen.getByText('Result not found')).toBeInTheDocument();
    expect(screen.queryByText('Customer API')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search APIs'), {
      target: { value: 'customer' },
    });

    expect(screen.queryByText('Result not found')).not.toBeInTheDocument();
    expect(screen.getByText('Customer API')).toBeInTheDocument();
  });

  it.skip('shows selected filter empty state outside of the API table', async () => {
    setupMocks({
      entities: [
        catalogEntities[0],
        {
          kind: 'API',
          metadata: {
            name: 'orders-api',
            namespace: 'wso2',
            annotations: {
              'wso2.com/api-id': 'api-2',
              'wso2.com/api-name': 'Orders API',
              'wso2.com/api-version': '1.0.0',
              'wso2.com/api-context': '/orders',
              'wso2.com/api-lifecycle-status': 'PUBLISHED',
              'wso2.com/api-type': 'GRAPHQL',
              'wso2.com/api-gateway': 'choreo',
              'wso2.com/gateway-endpoints': JSON.stringify([{ environmentName: 'Choreo Gateway', displayName: 'Choreo Gateway', gatewayType: 'choreo' }]),
            },
          },
        },
      ],
    });

    render(<Wso2ApiPlatformPage />);

    await screen.findByText('Customer API');
    expect(screen.getByText('Orders API')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: /Select Type/i }));
    fireEvent.click(await screen.findByRole('option', { name: 'HTTP' }));

    fireEvent.mouseDown(
      screen.getByRole('button', { name: /Select Gateway/i }),
    );
    fireEvent.click(await screen.findByRole('option', { name: 'Choreo Gateway' }));

    expect(
      screen.getByText('No APIs match the selected filters'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an API loading state while catalog entities are still loading', async () => {
    mockCatalogApi.getEntities.mockReturnValue(new Promise(() => {}));

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Fetching APIs...')).toBeInTheDocument();
  });

  it.skip('keeps polling during startup when gateways fail before catalog sync starts', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Startup Gateway',
          status: 'Offline',
          gatewayType: 'wso2',
          discoveredApis: [],
        },
      ],
      syncStatus: {
        phase: 'idle',
        message: 'Catalog sync has not started yet.',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No APIs Available')).not.toBeInTheDocument();
  });

  it.skip('shows a catalog synchronization empty state when no APIs are available yet', async () => {
    setupMocks({
      entities: [],
      syncStatus: {
        phase: 'applying',
        message: 'Applying WSO2 entities to the Backstage catalog.',
        publisherApis: { loaded: 1, total: 1 },
        totals: { apiProducts: 1, mcpServers: 1, services: 1 },
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Applying WSO2 entities to the Backstage catalog.')
        .length,
    ).toBeGreaterThan(1);
    expect(screen.getByText('Adding API Manager APIs')).toBeInTheDocument();
    expect(
      screen.getByText('Adding self-hosted gateway APIs'),
    ).toBeInTheDocument();
    expect(screen.getByText('Overall catalog sync')).toBeInTheDocument();
    expect(screen.getAllByText('API Products').length).toBeGreaterThan(1);
    expect(screen.getAllByText('MCP Servers').length).toBeGreaterThan(1);
    expect(screen.getAllByText('0 / 1 loaded').length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it.skip('does not reopen the sync loading dialog after it has been dismissed', async () => {
    jest.useFakeTimers();
    setupMocks({
      entities: [],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching APIs from WSO2',
        publisherApis: { loaded: 0, total: 10 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Fetching APIs...'),
      ).not.toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockWso2Api.getCatalogSyncStatus).toHaveBeenCalledTimes(2);
    });
    expect(
      screen.queryByText('Fetching APIs...'),
    ).not.toBeInTheDocument();
  });

  it.skip('shows only the self-hosted gateway section when APIM mode is disabled', async () => {
    setupMocks({
      entities: [],
      apimEnabled: false,
      apiPlatformEnabled: true,
    });
    mockWso2Api.getGateways.mockReturnValue(new Promise(() => {}));

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Adding self-hosted gateway APIs'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Adding API Manager APIs'),
    ).not.toBeInTheDocument();
  });

  it.skip('shows a configuration message when APIM and API Platform are disabled', async () => {
    setupMocks({
      entities: [],
      apimEnabled: false,
      apiPlatformEnabled: false,
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('No WSO2 API source enabled'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'You have to enable either APIM or API Platform configuration to load APIs.',
      ),
    ).toBeInTheDocument();
  });

  it.skip('uses backend runtime config when frontend config flags are not exposed', async () => {
    setupMocks({
      entities: [],
      apimEnabled: true,
      apiPlatformEnabled: true,
      exposeFrontendConfig: false,
      syncStatus: {
        phase: 'applying',
        message: 'Applying WSO2 entities to the Backstage catalog.',
        publisherApis: { loaded: 1, total: 1 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Adding API Manager APIs'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Adding self-hosted gateway APIs'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No WSO2 API source enabled'),
    ).not.toBeInTheDocument();
  });

  it('shows a blocking API error when catalog loading fails', async () => {
    setupMocks({ catalogError: new Error('Catalog is unavailable') });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Failed to load APIs')).toBeInTheDocument();
    expect(screen.getByText('Catalog is unavailable')).toBeInTheDocument();
  });

  it('keeps showing catalog sync progress for startup 404s while sync is running', async () => {
    setupMocks({
      catalogError: new Error('Request failed with 404 Not Found'),
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching APIs from WSO2',
        publisherApis: { loaded: 0, total: 10 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Failed to load APIs')).not.toBeInTheDocument();
  });

  it.skip('does not render live gateway APIs before APIM APIs have loaded when both sources are enabled', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [
            {
              id: 'live-api-1',
              name: 'Live Gateway API',
              version: '1.0.0',
              context: '/live',
              type: 'HTTP',
            },
          ],
        },
      ],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 30, total: 130 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.getByText('30 / 130 loaded')).toBeInTheDocument();
    expect(screen.queryByText('Live Gateway API')).not.toBeInTheDocument();
  });

  it.skip('does not count self-hosted gateway APIs as APIM API progress', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [
            { id: 'live-api-1', name: 'Live API 1' },
            { id: 'live-api-2', name: 'Live API 2' },
            { id: 'live-api-3', name: 'Live API 3' },
          ],
        },
      ],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.getByText('APIM APIs')).toBeInTheDocument();
    expect(screen.getByText('Self-hosted gateway APIs')).toBeInTheDocument();
    expect(screen.queryByText('3 / 3 loaded')).not.toBeInTheDocument();
    expect(screen.getByText('3 loaded')).toBeInTheDocument();
  });

  it.skip('keeps self-hosted gateway counts visible during background refresh', async () => {
    jest.useFakeTimers();
    const gateways = [
      {
        name: 'Self Hosted Gateway',
        status: 'Online',
        gatewayType: 'wso2',
        discoveredApis: [
          { id: 'live-api-1', name: 'Live API 1' },
          { id: 'live-api-2', name: 'Live API 2' },
          { id: 'live-api-3', name: 'Live API 3' },
        ],
      },
    ];

    setupMocks({
      entities: [],
      gateways,
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });
    mockWso2Api.getGateways
      .mockResolvedValueOnce(gateways)
      .mockReturnValue(new Promise(() => {}));

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('3 loaded')).toBeInTheDocument();
    expect(screen.getByText('1 / 1 gateways online')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockWso2Api.getGateways).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText('3 loaded')).toBeInTheDocument();
    expect(screen.getByText('1 / 1 gateways online')).toBeInTheDocument();
  });

  it.skip('shows APIM publisher loaded count when total is not available', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [{ id: 'live-api-1', name: 'Live API 1' }],
        },
      ],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 42 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.getByText('APIM APIs')).toBeInTheDocument();
    expect(screen.getByText('42 loaded')).toBeInTheDocument();
  });

  it('shows visible APIM APIs when publisher total is not available', async () => {
    setupMocks({
      entities: [catalogEntities[0]],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [
            {
              id: 'live-api-1',
              name: 'Live Gateway API',
              version: '1.0.0',
              context: '/live',
              type: 'HTTP',
            },
          ],
        },
      ],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();
    expect(
      screen.queryByText('Fetching APIs...'),
    ).not.toBeInTheDocument();
  });

  it.skip('parses APIM publisher progress from sync status message when structured fields are stale', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [{ id: 'live-api-1', name: 'Live API 1' }],
        },
      ],
      syncStatus: {
        phase: 'fetching',
        message: 'Loading Publisher API details (82/130).',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.getByText('82 / 130 loaded')).toBeInTheDocument();
  });

  it.skip('shows gateway APIs when sync status is complete without APIM APIs', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [
            {
              id: 'live-api-1',
              name: 'Live Gateway API',
              version: '1.0.0',
              context: '/live',
              type: 'HTTP',
            },
          ],
        },
      ],
      syncStatus: {
        phase: 'complete',
        message: 'Catalog sync complete',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Live Gateway API')).toBeInTheDocument();
    expect(
      screen.queryByText('Fetching APIs...'),
    ).not.toBeInTheDocument();
  });

  it('triggers APIM refresh and keeps waiting when gateway APIs load while APIM sync is idle', async () => {
    setupMocks({
      entities: [],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [
            {
              id: 'live-api-1',
              name: 'Live Gateway API',
              version: '1.0.0',
              context: '/live',
              type: 'HTTP',
            },
          ],
        },
      ],
      syncStatus: {
        phase: 'idle',
        message: 'Catalog sync has not started yet.',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();

    expect(screen.queryByText('Live Gateway API')).not.toBeInTheDocument();
  });

  it.skip('keeps waiting when only some APIM APIs are visible and publisher total is larger', async () => {
    setupMocks({
      entities: [catalogEntities[0]],
      gateways: [
        {
          name: 'Self Hosted Gateway',
          status: 'Online',
          gatewayType: 'wso2',
          discoveredApis: [
            {
              id: 'live-api-1',
              name: 'Live Gateway API',
              version: '1.0.0',
              context: '/live',
              type: 'HTTP',
            },
          ],
        },
      ],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 30, total: 130 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();
    expect(screen.getByText('30 / 130 loaded')).toBeInTheDocument();
    expect(screen.queryByText('Customer API')).not.toBeInTheDocument();
    expect(screen.queryByText('Live Gateway API')).not.toBeInTheDocument();
  });

  it('shows offline gateway warnings while keeping catalog APIs visible', async () => {
    setupMocks({
      gateways: [
        {
          name: 'Hybrid Gateway',
          status: 'Offline',
          gatewayType: 'hybrid',
          discoveredApis: [],
        },
      ],
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Gateway Discovery Warning'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hybrid Gateway/)).toBeInTheDocument();
    expect(screen.getByText('Customer API')).toBeInTheDocument();
  });

  it.skip('renders API Products, MCP Servers, and Services from their tabs', async () => {
    render(<Wso2ApiPlatformPage />);

    await waitFor(() => {
      expect(screen.getByText('Customer API')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(await screen.findByText('Sales Product')).toBeInTheDocument();
    expect(screen.getByText('/sales')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(await screen.findByText('Agent MCP')).toBeInTheDocument();
    expect(screen.getByText('/agent')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Services' }));
    expect(await screen.findByText('Inventory Service')).toBeInTheDocument();
    expect(mockWso2Api.getAllServices).toHaveBeenCalledWith({ pageSize: 500 });
    expect(
      screen.getByRole('link', { name: 'Inventory Service' }),
    ).toHaveAttribute('href', '/catalog/wso2/api/inventory-service');
    expect(
      screen.getByText('https://services.example.com/inventory'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    expect(screen.queryByText('Service Usage')).not.toBeInTheDocument();
    expect(screen.queryByText('Definition')).not.toBeInTheDocument();
  });

  it('shows and clears result-not-found messages for other table searches', async () => {
    render(<Wso2ApiPlatformPage />);

    await screen.findByText('Customer API');

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    await screen.findByText('Sales Product');
    fireEvent.change(screen.getByPlaceholderText('Search API Products'), {
      target: { value: 'missing-product' },
    });
    expect(screen.getByText('Result not found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search API Products'), {
      target: { value: 'sales' },
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
      target: { value: 'agent' },
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

  it.skip('merges live gateway-discovered APIs into the API table', async () => {
    setupMocks({
      gateways: [
        {
          name: 'Kong Runtime',
          status: 'Online',
          gatewayType: 'kong',
          discoveredApis: [
            {
              id: 'live-api-1',
              name: 'Live Gateway API',
              version: '1.0.0',
              context: '/live',
              type: 'HTTP',
            },
          ],
        },
      ],
    });
    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Customer API')).toBeInTheDocument();
    expect(screen.getByText('Live Gateway API')).toBeInTheDocument();
    expect(screen.getByText('/live')).toBeInTheDocument();
  });

  it('filters APIs by selecting a type and gateway', async () => {
    render(<Wso2ApiPlatformPage />);
    await screen.findByText('Customer API');

    // Material-UI Select trigger is a button/div with role button
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

  it.skip('renders API Products empty state', async () => {
    setupMocks({ entities: [] });
    render(<Wso2ApiPlatformPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(
      await screen.findByText('Discovering API Products...'),
    ).toBeInTheDocument();
  });

  it.skip('renders MCP empty state', async () => {
    setupMocks({ entities: [] });
    render(<Wso2ApiPlatformPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(
      await screen.findByText('Scanning for MCP Servers...'),
    ).toBeInTheDocument();
  });

  it.skip('renders Services error state', async () => {
    mockWso2Api.getAllServices.mockRejectedValue(
      new Error('Failed service fetch'),
    );
    render(<Wso2ApiPlatformPage />);
    await screen.findByText('Customer API'); // Wait for initial catalog load to complete

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

  it.skip('updates gateway dropdown when gateway data arrives after catalog sync', async () => {
    jest.useFakeTimers();
    const disconnectedGateway = {
      name: 'self-hosted-gw',
      displayName: 'Self Hosted Gateway',
      status: 'Offline',
      gatewayType: 'self-hosted-gw',
      discoveredApis: [],
    };
    const reconnectedGateway = {
      name: 'self-hosted-gw',
      displayName: 'Self Hosted Gateway',
      status: 'Online',
      gatewayType: 'self-hosted-gw',
      discoveredApis: [
        {
          id: 'self-hosted-api-1',
          name: 'Reconnected Self Hosted API',
          version: '1.0.0',
          context: '/reconnected',
          type: 'HTTP',
        },
      ],
    };

    setupMocks({
      gateways: [disconnectedGateway],
      syncStatus: {
        phase: 'complete',
        message: 'Catalog sync complete',
        completedAt: '2026-07-03T00:00:00.000Z',
        publisherApis: { loaded: 0 },
        totals: { catalogEntities: 1 },
      },
      entities: [
        {
          kind: 'API',
          metadata: {
            name: 'reconnected-self-hosted-api',
            namespace: 'wso2-gateways',
            annotations: {
              'wso2-gateway.com/api-id': 'self-hosted-api-1',
              'wso2-gateway.com/api-name': 'Reconnected Self Hosted API',
              'wso2.com/api-discovery-type': 'self-hosted-gateway',
              'wso2-gateway.com/discovered-from': 'self-hosted-gw',
            },
          },
        },
      ],
    });
    mockWso2Api.getGateways
      .mockResolvedValueOnce([disconnectedGateway])
      .mockResolvedValue([reconnectedGateway]);

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Reconnected Self Hosted API'),
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockWso2Api.getGateways).toHaveBeenCalledTimes(2);
    });

    fireEvent.mouseDown(
      screen.getByRole('button', { name: /Select Gateway/i }),
    );
    fireEvent.click(
      await screen.findByRole('option', { name: 'Self-hosted-gw' }),
    );

    expect(screen.getByText('Reconnected Self Hosted API')).toBeInTheDocument();
  });

  it.skip('filters configured gateway APIs when catalog and live gateway casing differs', async () => {
    setupMocks({
      gateways: [
        {
          name: 'self-hosted-gateway-1',
          displayName: 'self-hosted-gateway-1',
          status: 'Online',
          gatewayType: 'self-hosted-gateway-1',
          discoveredApis: [],
        },
      ],
      syncStatus: {
        phase: 'complete',
        message: 'Catalog sync complete',
        completedAt: '2026-07-03T00:00:00.000Z',
        publisherApis: { loaded: 0 },
        totals: { catalogEntities: 1 },
      },
      entities: [
        {
          kind: 'API',
          metadata: {
            name: 'platform-casing-api',
            namespace: 'default',
            annotations: {
              'wso2.com/api-id': 'platform-casing-api-1',
              'wso2.com/api-name': 'Platform Casing API',
              'wso2.com/api-version': 'v1.0',
              'wso2.com/api-context': '/platform-casing/v1.0',
              'wso2.com/api-endpoints': JSON.stringify([
                {
                  environmentName: 'self-hosted-gateway-1',
                  displayName: 'self-hosted-gateway-1',
                  gatewayType: 'PRODUCTION',
                },
              ]),
              'wso2.com/platform-gateway-endpoints': JSON.stringify([
                {
                  environmentName: 'self-hosted-gateway-1',
                  displayName: 'self-hosted-gateway-1',
                  gatewayType: 'self-hosted-gateway-1',
                  urls: ['https://gateway.example.com/platform-casing/v1.0'],
                },
              ]),
            },
          },
        },
      ],
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('Platform Casing API')).toBeInTheDocument();

    fireEvent.mouseDown(
      screen.getByRole('button', { name: /Select Gateway/i }),
    );
    fireEvent.click(
      await screen.findByRole('option', { name: 'Self-hosted-gateway-1' }),
    );

    expect(screen.getByText('Platform Casing API')).toBeInTheDocument();
  });

  it.skip('filters by the visible gateway value instead of hidden platform gateway annotations', async () => {
    setupMocks({
      gateways: [
        {
          name: 'self-hosted-1',
          displayName: 'self-hosted-1',
          status: 'Online',
          gatewayType: 'self-hosted-1',
          discoveredApis: [],
        },
      ],
      syncStatus: {
        phase: 'complete',
        message: 'Catalog sync complete',
        completedAt: '2026-07-03T00:00:00.000Z',
        publisherApis: { loaded: 0 },
        totals: { catalogEntities: 2 },
      },
      entities: [
        {
          kind: 'API',
          metadata: {
            name: 'wso2-visible-api',
            namespace: 'default',
            annotations: {
              'wso2.com/api-id': 'wso2-visible-api-1',
              'wso2.com/api-name': 'WSO2 Visible API',
              'wso2.com/api-version': 'v1',
              'wso2.com/api-context': '/wso2-visible',
              'wso2.com/api-gateway': 'wso2',
              'wso2.com/platform-gateway-endpoints': JSON.stringify([
                {
                  environmentName: 'self-hosted-1',
                  displayName: 'self-hosted-1',
                  gatewayType: 'self-hosted-1',
                  urls: ['https://gateway.example.com/wso2-visible'],
                },
              ]),
            },
          },
        },
        {
          kind: 'API',
          metadata: {
            name: 'self-hosted-visible-api',
            namespace: 'default',
            annotations: {
              'wso2.com/api-id': 'self-hosted-visible-api-1',
              'wso2.com/api-name': 'Self Hosted Visible API',
              'wso2.com/api-version': 'v1',
              'wso2.com/api-context': '/self-hosted-visible',
              'wso2-gateway.com/api-endpoints': JSON.stringify([
                {
                  environmentName: 'self-hosted-1',
                  displayName: 'self-hosted-1',
                  gatewayType: 'self-hosted-1',
                  urls: ['https://gateway.example.com/self-hosted-visible'],
                },
              ]),
            },
          },
        },
      ],
    });

    render(<Wso2ApiPlatformPage />);

    expect(await screen.findByText('WSO2 Visible API')).toBeInTheDocument();
    expect(screen.getByText('Self Hosted Visible API')).toBeInTheDocument();

    fireEvent.mouseDown(
      screen.getByRole('button', { name: /Select Gateway/i }),
    );
    fireEvent.click(
      await screen.findByRole('option', { name: 'Self-hosted-1' }),
    );

    expect(screen.queryByText('WSO2 Visible API')).not.toBeInTheDocument();
    expect(screen.getByText('Self Hosted Visible API')).toBeInTheDocument();
  });

  it.skip('renders Services as entity links without inline detail panels', async () => {
    setupMocks({
      services: [
        {
          id: 'svc-1',
          name: 'Service 1',
          version: '1.0.0',
          serviceUrl: 'https://example.com/1',
          definitionType: 'OAS',
          usage: '1 API',
        },
        {
          name: 'Service No ID',
          version: '1.0.0',
          serviceUrl: 'https://example.com/no-id',
          definitionType: 'OAS',
          usage: '1 API',
        },
      ],
    });
    render(<Wso2ApiPlatformPage />);
    await screen.findByText('Customer API');

    fireEvent.click(screen.getByRole('tab', { name: 'Services' }));
    expect(await screen.findByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service No ID')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Service 1' })).toHaveAttribute(
      'href',
      '/catalog/wso2/api/inventory-service',
    );
    expect(screen.getByRole('link', { name: 'Service No ID' })).toHaveAttribute(
      'href',
      '/catalog/default/api/service-no-id',
    );
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    expect(mockWso2Api.getServiceUsage).not.toHaveBeenCalled();
    expect(mockWso2Api.getServiceDefinition).not.toHaveBeenCalled();
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

  it('allows manual refresh during synchronization', async () => {
    setupMocks({
      entities: [],
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

    const refreshBtn = await screen.findByRole('button', {
      name: 'Refresh Now',
    });
    fireEvent.click(refreshBtn);
    expect(mockCatalogApi.getEntities).toHaveBeenCalledTimes(2);
  });

  it.skip('handles sync timeout and retry across tabs', async () => {
    jest.useFakeTimers();
    setupMocks({ entities: [] });
    // First call resolves to empty array, subsequent calls never resolve
    mockCatalogApi.getEntities
      .mockResolvedValueOnce({ items: [] })
      .mockReturnValue(new Promise(() => {}));

    render(<Wso2ApiPlatformPage />);

    // Flush microtasks to settle the first catalogState promise resolution
    await act(async () => {
      await Promise.resolve();
    });

    // Advance time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(65000);
    });

    expect(screen.getByText('Sync Timed Out')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Trigger timeout states on other tabs
    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(screen.getByText('Sync Timed Out')).toBeInTheDocument();

    // Go back and retry
    fireEvent.click(screen.getByRole('tab', { name: 'APIs' }));
    const retryBtn = screen.getByRole('button', { name: 'Retry Now' });
    fireEvent.click(retryBtn);

    jest.useRealTimers();
  });

  it.skip('keeps showing sync progress when publisher APIs are still loading', async () => {
    jest.useFakeTimers();
    setupMocks({
      entities: [],
      syncStatus: {
        phase: 'fetching',
        message: 'Fetching Publisher APIs',
        publisherApis: { loaded: 30, total: 130 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    expect(
      await screen.findByText('Fetching APIs...'),
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(65000);
    });

    expect(screen.queryByText('Sync Timed Out')).not.toBeInTheDocument();
    expect(screen.getByText('30 / 130 loaded')).toBeInTheDocument();
    expect(screen.getAllByText('API Products').length).toBeGreaterThan(1);
    expect(screen.getAllByText('MCP Servers').length).toBeGreaterThan(0);
  });

  it.skip('does not refetch Services on catalog polling when service metadata is unchanged', async () => {
    jest.useFakeTimers();
    setupMocks({
      entities: [],
      syncStatus: {
        phase: 'fetching',
        message: 'Loading Publisher API details (82/130).',
        publisherApis: { loaded: 82, total: 130 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    await screen.findByText('Fetching APIs...');
    await waitFor(() => {
      expect(mockWso2Api.getAllServices).toHaveBeenCalledTimes(1);
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockCatalogApi.getEntities).toHaveBeenCalledTimes(2);
    });
    expect(mockWso2Api.getAllServices).toHaveBeenCalledTimes(1);
  });

  it.skip('keeps polling sync status while elapsed timer re-renders the dialog', async () => {
    jest.useFakeTimers();
    setupMocks({
      entities: [],
      syncStatus: {
        phase: 'fetching',
        message: 'Preparing WSO2 Publisher catalog synchronization.',
        publisherApis: { loaded: 0 },
        totals: {},
      },
    });

    render(<Wso2ApiPlatformPage />);

    await screen.findByText('Fetching APIs...');
    expect(mockWso2Api.getCatalogSyncStatus).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 3; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });
    }

    await waitFor(() => {
      expect(mockWso2Api.getCatalogSyncStatus).toHaveBeenCalledTimes(2);
    });
  });

  it.skip('handles MCP Servers sync timeout when catalog never resolves', async () => {
    jest.useFakeTimers();
    setupMocks({ entities: [] });
    // Catalog never resolves
    mockCatalogApi.getEntities.mockReturnValue(new Promise(() => {}));

    render(<Wso2ApiPlatformPage />);

    // Advance time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(65000);
    });

    // Go to MCP Servers tab
    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(screen.getByText('Sync Timed Out')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('shows gateway discovery failure across tabs when catalog is empty', async () => {
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

    expect(
      await screen.findByText('Refresh Now'),
    ).toBeInTheDocument();
    expect(screen.getByText('Gateway Discovery Warning')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'API Products' }));
    expect(screen.getByText('No API Products Available')).toBeInTheDocument();
    expect(screen.queryByText('Gateway Discovery Warning')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Discovering API Products...'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'MCP Servers' }));
    expect(screen.getByText('No MCP Servers Available')).toBeInTheDocument();
    expect(screen.queryByText('Gateway Discovery Warning')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Scanning for MCP Servers...'),
    ).not.toBeInTheDocument();
  });
});
