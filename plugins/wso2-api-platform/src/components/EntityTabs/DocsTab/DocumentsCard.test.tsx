/**
 * @jest-environment jsdom
 */


/*
 * Copyright 2026 WSO2 LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, screen } from '@testing-library/react';
import { EntityWso2DocumentsCard } from './DocumentsCard';

let mockEntity: any;

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: mockEntity,
  }),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  configApiRef: { id: 'core.config' },
  fetchApiRef: { id: 'core.fetch' },
  useApi: (apiRef: { id: string }) => {
    if (apiRef.id === 'core.config') {
      return {
        getString: () => 'http://localhost:7007',
      };
    }
    if (apiRef.id === 'core.fetch') {
      return {
        fetch: jest.fn(),
      };
    }
    throw new Error(`Unexpected apiRef: ${apiRef.id}`);
  },
}));

jest.mock('@backstage/core-components', () => ({
  EmptyState: ({ title, description }: any) => (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  ),
  InfoCard: ({ children }: any) => <div>{children}</div>,
  Progress: () => <div>Loading</div>,
  WarningPanel: ({ title, children }: any) => (
    <section role="alert">
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

jest.mock('./components/DocumentPreview', () => ({
  Wso2DocumentPreview: () => <div>Document preview</div>,
}));

jest.mock('./components/DocumentTable', () => ({
  Wso2DocumentTable: () => <div>Document table</div>,
}));

jest.mock('./components/SingleDocumentView', () => ({
  Wso2SingleDocumentView: () => <div>Single document</div>,
}));

describe('EntityWso2DocumentsCard', () => {
  beforeEach(() => {
    mockEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'API',
      metadata: {
        name: 'test-api',
        annotations: {
          'wso2.com/api-id': 'api-1',
        },
      },
    };
  });

  it('explains that documents are unavailable for self-hosted gateway API Platform APIs', () => {
    mockEntity.metadata.annotations['wso2.com/api-discovery-type'] =
      'self-hosted-gateway';
    mockEntity.metadata.annotations['wso2.com/api-documents'] = JSON.stringify([
      {
        id: 'doc-1',
        name: 'Gateway Guide',
        sourceType: 'MARKDOWN',
      },
    ]);

    render(<EntityWso2DocumentsCard />);

    expect(screen.getByText('Documents unavailable')).toBeDefined();
    expect(
      screen.getByText(
        'Documents are not supported for API Platform APIs discovered from self-hosted gateways. Please check the WSO2 API Platform directly for documentation.',
      ),
    ).toBeDefined();
    expect(screen.queryByText('Document table')).toBeNull();
  });

  it('uses the regular empty state for Publisher APIs with no attached documents', () => {
    render(<EntityWso2DocumentsCard />);

    expect(screen.getByText('No documents')).toBeDefined();
    expect(
      screen.getByText(
        'This API has no documents attached in WSO2 API Manager.',
      ),
    ).toBeDefined();
  });
});
