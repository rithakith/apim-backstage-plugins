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
import { EntityWso2ApiPoliciesTab } from './ApiPoliciesTab';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useWso2ApiPolicies } from './hooks/useApiPolicies';
import { ThemeProvider } from '@material-ui/core/styles';
import { lightTheme } from '@backstage/theme';

jest.mock('@backstage/core-components', () => ({
  InfoCard: ({ children }: any) => {
    const React = require('react');
    return React.createElement('div', null, children);
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

jest.mock('./hooks/useApiPolicies', () => ({
  useWso2ApiPolicies: jest.fn(),
}));

jest.mock('./components/PublisherPoliciesList', () => ({
  Wso2PublisherPoliciesList: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'policies-list' },
      'Policies List',
    );
  },
}));

describe('EntityWso2ApiPoliciesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWso2ApiPolicies as jest.Mock).mockReturnValue({
      details: { apiPolicies: null, operations: [] },
      definition: null,
      isDefinitionLoading: false,
      gatewayOperations: [],
      gatewayApiPolicies: [],
      isPlaceholder: false,
      isRevisionsLoading: false,
    });
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <EntityWso2ApiPoliciesTab />
      </ThemeProvider>,
    );
  };

  it('renders nothing if api-id is missing', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: {} },
        spec: { type: 'api' },
      },
    });

    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading state when definition is loading', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });

    (useWso2ApiPolicies as jest.Mock).mockReturnValue({
      isDefinitionLoading: true,
      details: {},
    });

    renderComponent();
    expect(screen.getByText('Loading Policies...')).toBeInTheDocument();
  });

  it('renders placeholder state', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });

    (useWso2ApiPolicies as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      isPlaceholder: true,
      details: {},
    });

    renderComponent();
    expect(
      screen.getByText('Syncing with WSO2 Gateway...'),
    ).toBeInTheDocument();
  });

  it('renders empty state if no policies exist', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });

    (useWso2ApiPolicies as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      isPlaceholder: false,
      definition: {},
      details: {},
      gatewayOperations: [],
      gatewayApiPolicies: {},
    });

    renderComponent();
    expect(screen.getByText('No Policies')).toBeInTheDocument();
    expect(
      screen.getByText('This API does not have policies available.'),
    ).toBeInTheDocument();
  });

  it('renders PublisherPoliciesList when policies exist', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: { 'wso2.com/api-id': '123' } },
        spec: { type: 'api' },
      },
    });

    (useWso2ApiPolicies as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      isPlaceholder: false,
      definition: {},
      details: { apiPolicies: { request: [{ policyName: 'test' }] } },
      gatewayOperations: [],
      gatewayApiPolicies: {},
    });

    renderComponent();
    expect(screen.getByTestId('policies-list')).toBeInTheDocument();
  });

  it('renders Discovered API badge for discovered APIs', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: {
          annotations: {
            'wso2.com/api-id': '123',
            'wso2.com/is-discovered': 'true',
          },
        },
        spec: { type: 'api' },
      },
    });

    (useWso2ApiPolicies as jest.Mock).mockReturnValue({
      isDefinitionLoading: false,
      isPlaceholder: false,
      definition: {},
      details: { apiPolicies: { request: [{ policyName: 'test' }] } },
    });

    renderComponent();
    expect(screen.getByText('Discovered API')).toBeInTheDocument();
  });
});
