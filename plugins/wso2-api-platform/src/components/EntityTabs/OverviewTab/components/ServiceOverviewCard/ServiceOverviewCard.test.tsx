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
import { EntityWso2ServiceOverviewCard } from './ServiceOverviewCard';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ThemeProvider } from '@material-ui/core/styles';
import { lightTheme } from '@backstage/theme';

jest.mock('@backstage/core-components', () => ({
  InfoCard: ({ children }: any) => {
    const React = require('react');
    return React.createElement('div', null, children);
  },
  EmptyState: ({ title }: any) => {
    const React = require('react');
    return React.createElement('div', null, title || 'EmptyState');
  },
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('@backstage/plugin-catalog', () => ({
  DefaultEntityPresentationApi: jest.fn(),
  AboutField: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'about-field' });
  },
}));

describe('EntityWso2ServiceOverviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <EntityWso2ServiceOverviewCard />
      </ThemeProvider>,
    );
  };

  it('renders missing annotation state when wso2.com/service-id is absent', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: { annotations: {} },
      },
    });

    renderComponent();
    expect(
      screen.getByText('Missing WSO2 service annotation'),
    ).toBeInTheDocument();
  });

  it('renders correctly with annotations', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: {
          title: 'My Service',
          description: 'A great service',
          annotations: {
            'wso2.com/service-id': 'service-123',
            'wso2.com/service-version': 'v1',
            'wso2.com/service-mutual-ssl-enabled': 'true',
            'wso2.com/service-definition-type': 'OAS3',
          },
        },
      },
    });

    renderComponent();

    // Check for AboutFields
    const fields = screen.getAllByTestId('about-field');
    // Name, Description, Version, Mutual SSL, Definition Type = 5 fields
    expect(fields.length).toBe(5);
  });

  it('handles false mutual ssl annotation', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: {
          title: 'My Service',
          annotations: {
            'wso2.com/service-id': 'service-123',
            'wso2.com/service-mutual-ssl-enabled': 'false',
          },
        },
      },
    });

    renderComponent();

    // Check for AboutFields
    const fields = screen.getAllByTestId('about-field');
    expect(fields.length).toBeGreaterThan(0);
  });
});
