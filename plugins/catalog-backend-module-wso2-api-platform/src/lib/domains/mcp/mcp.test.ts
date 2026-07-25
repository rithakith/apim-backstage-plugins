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

import { mapWso2McpToEntity } from './mapperUtils';
import {
  fetchMcpDocuments,
  fetchMcpServerDetail,
  fetchMcpServerList,
} from './mcpUtils';
import { Wso2McpServer } from './types';

describe('mcp domain', () => {
  const formatTestCaseDoc = (details: string) => {
    return `\n================================================================================\nTEST CASE: ${expect.getState().currentTestName}\n================================================================================\n${details.trim()}\n================================================================================\n`;
  };

  const mockClient = {
    getPublisherBasePath: jest.fn().mockReturnValue('/api/am/publisher/v3'),
    getMcpDocuments: jest.fn(),
    getMcpServerDetail: jest.fn(),
    getMcpServerList: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapWso2McpToEntity', () => {
    it('should map a raw MCP Server into a Backstage API Entity with full fields', () => {
      const mcp: Wso2McpServer = {
        id: 'mcp-123',
        name: 'Gitea Tools MCP',
        description: 'MCP server for Gitea integration',
        provider: 'devops-team',
        lifeCycleStatus: 'PUBLISHED',
        tags: ['git', 'mcp'],
        tools: [
          {
            name: 'list-repos',
            description: 'Lists repos',
            authType: 'None',
            throttlingPolicy: 'Unlimited',
          },
        ],
        documents: [{ id: 'doc-1', name: 'MCP Guide' }],
      };

      const entity = mapWso2McpToEntity(mcp, 'my-namespace', 'my-provider');

      expect(entity).toEqual({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'gitea-tools-mcp',
          namespace: 'my-namespace',
          title: 'Gitea Tools MCP',
          description: 'MCP server for Gitea integration',
          annotations: {
            'backstage.io/managed-by-location': 'wso2-apim:my-provider',
            'backstage.io/managed-by-origin-location': 'wso2-apim:my-provider',
            'wso2.com/api-id': 'mcp-123',
            'wso2.com/api-name': 'Gitea Tools MCP',
            'wso2.com/api-version': '',
            'wso2.com/api-context': '',
            'wso2.com/api-provider': 'devops-team',
            'wso2.com/api-lifecycle-status': 'PUBLISHED',
            'wso2.com/api-type': 'MCP',
            'wso2.com/is-mcp-server': 'true',
            'wso2.com/mcp-tools': JSON.stringify(mcp.tools),
            'wso2.com/api-documents': JSON.stringify(mcp.documents),
          },
          tags: ['git', 'mcp'],
        },
        spec: {
          type: 'mcp',
          lifecycle: 'production',
          owner: 'devops-team',
          definition: 'WSO2 MCP Server: Gitea Tools MCP',
        },
      });

      console.log(formatTestCaseDoc(`
=== [MCP Mapper: MCP Server Mapping (Published)] ===
MCP name: "${entity.metadata.name}"
Spec lifecycle: "${entity.spec.lifecycle}"
Spec owner: "${entity.spec.owner}" (from provider)
`));
    });

    it('should fallback to unknown for owner, and production lifecycle', () => {
      // 1. Fallback to unknown & experimental
      const mcp1: Wso2McpServer = { id: '1', name: 'm1' };
      const ent1 = mapWso2McpToEntity(mcp1, 'default', 'prov');
      expect(ent1.spec.owner).toBe('unknown');
      expect(ent1.spec.lifecycle).toBe('production');

      console.log(formatTestCaseDoc(`
=== [MCP Mapper: MCP Server Spec Fallbacks] ===
Fallback 1: owner="${ent1.spec.owner}" (unknown)
Fallback 2: lifecycle="${ent1.spec.lifecycle}" (undefined)
`));
    });
  });

  describe('fetchMcpDocuments', () => {
    it('should delegate to client.getMcpDocuments', async () => {
      const mockDocs = [{ id: 'doc-1' }];
      mockClient.getMcpDocuments.mockResolvedValueOnce(mockDocs);

      const result = await fetchMcpDocuments(mockClient, 'mcp-1');
      expect(result).toEqual(mockDocs);
      expect(mockClient.getMcpDocuments).toHaveBeenCalledWith('mcp-1');
    });
  });

  describe('fetchMcpServerDetail', () => {
    it('should delegate to client.getMcpServerDetail', async () => {
      const summary = { id: 'mcp-1', name: 'MyMCP' };
      const detail = { ...summary, tools: [] };
      mockClient.getMcpServerDetail.mockResolvedValueOnce(detail);

      const result = await fetchMcpServerDetail(mockClient, summary);
      expect(result).toEqual(detail);
      expect(mockClient.getMcpServerDetail).toHaveBeenCalledWith(summary);
    });
  });

  describe('fetchMcpServerList', () => {
    it('should fetch list and enrich each MCP server', async () => {
      const mockList = {
        list: [
          { id: 'mcp-1', name: 'MCP-1' },
          { id: 'mcp-2', name: 'MCP-2' },
        ],
      };

      mockClient.getMcpServerList.mockResolvedValueOnce(mockList);
      mockClient.getMcpServerDetail.mockImplementation(async (summary: any) => ({
        ...summary,
        tools: [],
      }));

      const result = await fetchMcpServerList(mockClient);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ id: 'mcp-1', tools: [] }));
      expect(result[1]).toEqual(expect.objectContaining({ id: 'mcp-2', tools: [] }));
      expect(mockClient.getMcpServerList).toHaveBeenCalled();
      expect(mockClient.getMcpServerDetail).toHaveBeenCalledTimes(2);
    });

    it('should log error and throw on outer list fetch error', async () => {
      mockClient.getMcpServerList.mockRejectedValueOnce(new Error('List failure'));

      await expect(fetchMcpServerList(mockClient)).rejects.toThrow('List failure');
    });
  });
});
