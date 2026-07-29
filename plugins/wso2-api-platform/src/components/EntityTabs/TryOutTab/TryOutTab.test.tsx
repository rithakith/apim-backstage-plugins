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

/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EntityWso2TryOutTab } from './TryOutTab';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useTryOutData } from './hooks/useTryOutData';
import { useApiKeyGenerator } from './hooks/useApiKeyGenerator';
import { ThemeProvider } from '@material-ui/core/styles';
import { lightTheme } from '@backstage/theme';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-components', () => ({
  InfoCard: ({ children }: any) => {
    const React = require('react');
    return React.createElement('div', null, children);
  },
  WarningPanel: ({ title }: any) => {
    const React = require('react');
    return React.createElement('div', null, title || 'WarningPanel');
  },
  EmptyState: ({ title, description }: any) => {
    const React = require('react');
    return React.createElement(
      'div',
      null,
      React.createElement('div', null, title || ''),
      React.createElement('div', null, description || ''),
    );
  },
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn().mockReturnValue({}),
  alertApiRef: { id: 'alertApiRef' },
}));

jest.mock('./hooks/useTryOutData', () => ({
  useTryOutData: jest.fn(),
}));

jest.mock('./hooks/useApiKeyGenerator', () => ({
  useApiKeyGenerator: jest.fn(),
}));

// Mock consoles
jest.mock('./components/consoles/SwaggerConsole', () => ({
  SwaggerConsole: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'swagger-console' });
  },
}));
jest.mock('./components/consoles/GraphQLConsole', () => ({
  GraphQLConsole: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'graphql-console' });
  },
}));
jest.mock('./components/consoles/WebSocketConsole', () => ({
  WebSocketConsole: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'ws-console' });
  },
}));
jest.mock('./components/consoles/WebSubConsole', () => ({
  WebSubConsole: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'websub-console' });
  },
}));
jest.mock('./components/consoles/SseConsole', () => ({
  SseConsole: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'sse-console' });
  },
}));
jest.mock('./components/consoles/PlatformGatewayConsole', () => ({
  PlatformGatewayConsole: () => {
    const React = require('react');
    return React.createElement('div', {
      'data-testid': 'platform-gateway-console',
    });
  },
}));

describe('EntityWso2TryOutTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiKeyGenerator as jest.Mock).mockReturnValue({
      apiKeyRef: { current: 'test-key' },
    });
    (useApi as jest.Mock).mockReturnValue({});
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <EntityWso2TryOutTab />
      </ThemeProvider>,
    );
  };

  it('renders loading state', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });
    (useTryOutData as jest.Mock).mockReturnValue({ isDefinitionLoading: true });

    renderComponent();
    expect(screen.getByText('Loading API Definition...')).toBeInTheDocument();
  });

  it('renders empty state if no definition', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });
    (useTryOutData as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      definition: null,
    });

    renderComponent();
    expect(screen.getByText('No Definition')).toBeInTheDocument();
  });

  it('renders GraphQL console for GRAPHQL type', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });
    (useTryOutData as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      definition: {},
      details: { type: 'GRAPHQL' },
      isDeployed: true,
    });

    renderComponent();
    expect(screen.getByTestId('graphql-console')).toBeInTheDocument();
  });

  it('renders WebSocket console for WS type', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });
    (useTryOutData as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      definition: {},
      details: { type: 'WS' },
      isDeployed: true,
    });

    renderComponent();
    expect(screen.getByTestId('ws-console')).toBeInTheDocument();
  });

  it('renders Swagger Console for HTTP type', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });
    (useTryOutData as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      definition: {},
      details: { type: 'HTTP' },
      isDeployed: true,
      hasOperationsOnly: false,
    });

    renderComponent();
    expect(screen.getByTestId('swagger-console')).toBeInTheDocument();
  });

  it('renders Platform Gateway Console for Platform APIs', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: {
          annotations: {
            'wso2.com/platform-gateway-endpoints': '[]',
            'wso2.com/api-id': '123',
          },
        },
        spec: { type: 'api' },
      },
    });
    (useTryOutData as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      definition: {},
      details: { type: 'HTTP' },
      isDeployed: true,
    });

    renderComponent();
    expect(screen.getByTestId('platform-gateway-console')).toBeInTheDocument();
  });

  it('shows gateway access failed warning', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });
    (useApiKeyGenerator as jest.Mock).mockReturnValue({
      generateKeyError: true,
      apiKeyRef: { current: null },
    });
    (useTryOutData as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      definition: {},
      details: { type: 'HTTP' },
      isDeployed: true,
    });

    renderComponent();
    expect(screen.getByText('Gateway Access Failed')).toBeInTheDocument();
  });
});
