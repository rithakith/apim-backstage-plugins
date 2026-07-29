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
import { Wso2Service } from './types';

const SERVICE_LIST_PAGE_SIZE = 1000;
const SERVICE_DETAIL_CONCURRENCY = 5;

/**
 * Fetches the service usage (list of APIs).
 */
export async function fetchServiceUsage(
  client: Wso2Client,
  serviceId: string,
): Promise<any[]> {
  return client.getServiceUsage(serviceId);
}

/**
 * Fetches the service definition.
 */
export async function fetchServiceDefinition(
  client: Wso2Client,
  serviceId: string,
): Promise<string> {
  return client.getServiceDefinition(serviceId);
}

export async function fetchServiceList(
  client: Wso2Client,
  options?: { onTotal?: (total: number) => void },
): Promise<Wso2Service[]> {
  const serviceList: Wso2Service[] = [];
  let offset = 0;
  let total: number | undefined;
  let hasMore = false;

  do {
    const data = await client.getServiceList({
      limit: SERVICE_LIST_PAGE_SIZE,
      offset,
    });
    const page = data.list || [];
    serviceList.push(...page);
    total =
      typeof data.pagination?.total === 'number'
        ? data.pagination.total
        : undefined;
    offset += page.length;
    hasMore =
      total === undefined
        ? page.length === SERVICE_LIST_PAGE_SIZE
        : offset < total;
  } while (hasMore);

  options?.onTotal?.(serviceList.length);

  const enrichedServiceList = await mapWithConcurrency(
    serviceList,
    SERVICE_DETAIL_CONCURRENCY,
    async service => {
      const [usageList, rawDefinition] = await Promise.all([
        client.getServiceUsage(service.id),
        client.getServiceDefinition(service.id),
      ]);
      return {
        ...service,
        usageList,
        rawDefinition,
      };
    },
  );

  return enrichedServiceList as Wso2Service[];
}
