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
import { Wso2ApiProduct } from './types';

const API_PRODUCT_DETAIL_CONCURRENCY = 10;

/**
 * Fetches the definition (Swagger) for an API Product.
 */
export async function fetchApiProductDefinition(
  client: Wso2Client,
  productId: string,
  productName: string,
): Promise<string> {
  return client.getApiProductDefinition(productId, productName);
}

/**
 * Fetches the detailed metadata for a single API Product.
 */
export async function fetchApiProductDetail(
  client: Wso2Client,
  productSummary: any,
): Promise<Wso2ApiProduct> {
  return client.getApiProductDetail(productSummary);
}

/**
 * Fetches the list of all API Products from the WSO2 Publisher.
 */
export async function fetchApiProductList(
  client: Wso2Client,
  options?: { onTotal?: (total: number) => void },
): Promise<Wso2ApiProduct[]> {
  const data = await client.getApiProductList();
  const productList = data.list || [];
  options?.onTotal?.(productList.length);

  const enrichedProducts = await mapWithConcurrency(
    productList,
    API_PRODUCT_DETAIL_CONCURRENCY,
    productSummary => client.getApiProductDetail(productSummary),
  );
  
  return enrichedProducts as Wso2ApiProduct[];
}
