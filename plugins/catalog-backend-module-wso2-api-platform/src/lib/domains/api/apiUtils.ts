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

import { Wso2Client } from '../../client';
import { mapWithConcurrency } from '../../concurrency';
import { Wso2Api } from './types';

const API_LIST_PAGE_SIZE = 1000;
const API_DETAIL_CONCURRENCY = 10;

/**
 * Fetches the API definition (Swagger or AsyncAPI).
 */
export async function fetchApiDefinition(
  client: Wso2Client,
  apiId: string,
  apiType: string,
  apiName: string,
): Promise<string> {
  return client.getApiDefinition(apiId, apiType, apiName);
}

/**
 * Fetches the documentation associated with an API.
 */
export async function fetchApiDocuments(
  client: Wso2Client,
  apiId: string,
): Promise<any[]> {
  return client.getApiDocuments(apiId);
}

/**
 * Fetches the WSDL definition if it is a SOAP/SOAPTOREST API.
 */
export async function fetchApiWsdl(
  client: Wso2Client,
  apiId: string,
): Promise<string | undefined> {
  return client.getApiWsdl(apiId);
}

/**
 * Fetches the detailed metadata for a single API.
 */
export async function fetchApiDetail(
  client: Wso2Client,
  apiSummary: Partial<Wso2Api> & { id: string; name: string; type: string },
): Promise<Wso2Api> {
  return client.getApiDetail(apiSummary);
}

/**
 * Fetches the list of all APIs from the WSO2 Publisher.
 */
export async function fetchApiList(
  client: Wso2Client,
  options?: {
    onProgress?: (progress: {
      loaded: number;
      total?: number;
      message?: string;
    }) => void;
  },
): Promise<Wso2Api[]> {
  options?.onProgress?.({
    loaded: 0,
    total: undefined,
    message: 'Connecting to WSO2 Publisher portal.',
  });

  const apiList: any[] = [];
  let offset = 0;
  let total: number | undefined;
  let hasMore = false;

  do {
    options?.onProgress?.({
      loaded: 0,
      total,
      message:
        offset === 0
          ? 'Determining Publisher API count.'
          : `Loading Publisher API list (${apiList.length}${
              total === undefined ? '' : `/${total}`
            } discovered).`,
    });
    let data: any;
    try {
      data = await client.getApiList({ limit: API_LIST_PAGE_SIZE, offset });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      options?.onProgress?.({
        loaded: apiList.length,
        total,
        message: `Failed to load Publisher API list: ${message}`,
      });
      throw error;
    }
    const page = data.list || [];
    apiList.push(...page);

    total =
      typeof data.pagination?.total === 'number'
        ? data.pagination.total
        : undefined;
    options?.onProgress?.({
      loaded: 0,
      total,
      message:
        total === undefined
          ? `Discovered ${apiList.length} Publisher APIs so far.`
          : `Publisher API count determined: ${total}.`,
    });
    offset += page.length;
    hasMore =
      total === undefined ? page.length === API_LIST_PAGE_SIZE : offset < total;
  } while (hasMore);

  let loaded = 0;
  options?.onProgress?.({
    loaded,
    total: total ?? apiList.length,
    message: `Loading details for ${total ?? apiList.length} Publisher APIs.`,
  });

  const enrichedApis = await mapWithConcurrency(
    apiList,
    API_DETAIL_CONCURRENCY,
    async apiSummary => {
      const api = await client.getApiDetail(apiSummary);
      loaded += 1;
      options?.onProgress?.({
        loaded,
        total: total ?? apiList.length,
        message: `Loading Publisher API details (${loaded}/${
          total ?? apiList.length
        }).`,
      });
      return api as Wso2Api;
    },
  );

  return enrichedApis;
}
