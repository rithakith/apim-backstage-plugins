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

import { Wso2Client } from '../../client';
import { mapWithConcurrency } from '../../concurrency';
import { Wso2McpServer } from './types';

const MCP_SERVER_DETAIL_CONCURRENCY = 5;

/**
 * Fetches the documents associated with an MCP Server.
 */
export async function fetchMcpDocuments(
  client: Wso2Client,
  mcpId: string,
): Promise<any[]> {
  return client.getMcpDocuments(mcpId);
}

/**
 * Fetches the detailed metadata for a single MCP Server.
 */
export async function fetchMcpServerDetail(
  client: Wso2Client,
  mcpSummary: any,
): Promise<Wso2McpServer> {
  return client.getMcpServerDetail(mcpSummary);
}

/**
 * Fetches the list of all MCP Servers from the WSO2 Publisher.
 */
export async function fetchMcpServerList(
  client: Wso2Client,
  options?: { onTotal?: (total: number) => void },
): Promise<Wso2McpServer[]> {
  const data = await client.getMcpServerList();
  const mcpList = data.list || [];
  options?.onTotal?.(mcpList.length);

  const enrichedMcps = await mapWithConcurrency(
    mcpList,
    MCP_SERVER_DETAIL_CONCURRENCY,
    mcpSummary => client.getMcpServerDetail(mcpSummary),
  );
  return enrichedMcps as Wso2McpServer[];
}
