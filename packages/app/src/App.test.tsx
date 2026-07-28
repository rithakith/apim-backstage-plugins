/** @jest-environment jsdom */
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('@backstage/frontend-defaults', () => ({
  createApp: () => ({
    createRoot: () => <div data-testid="app-root">App</div>,
  }),
}));
jest.mock('@backstage/plugin-catalog/alpha', () => ({}));
jest.mock('@wso2/backstage-plugin-wso2-api-platform/alpha', () => ({}));
jest.mock('./modules/nav', () => ({ navModule: {} }));

describe('App', () => {
  it('should render', async () => {
    process.env = {
      NODE_ENV: 'test',
      APP_CONFIG: [
        {
          data: {
            app: { title: 'Test' },
            backend: { baseUrl: 'http://localhost:7007' },
            techdocs: {
              storageUrl: 'http://localhost:7007/api/techdocs/static/docs',
            },
          },
          context: 'test',
        },
      ] as any,
    };

    const rendered = render(App.createRoot());

    await waitFor(() => {
      expect(rendered.baseElement).toBeInTheDocument();
    });
  });
});
