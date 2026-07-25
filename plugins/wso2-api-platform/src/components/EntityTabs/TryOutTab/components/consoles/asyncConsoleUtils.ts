import { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { Wso2ApiDetail } from '../../../../../api';

export type GatewayUrl = {
  environmentName: string;
  url: string;
  environmentType?: string;
  description?: string;
};

type AuthHeader = {
  name: string;
  value: string;
};

export const getAsyncVerbColors = (verb: string) => {
  const v = (verb || '').toUpperCase();
  if (v.includes('SUB') || v === 'SUBSCRIBE') {
    return { main: '#49cc90', light: 'rgba(73, 204, 144, 0.05)' };
  }
  return { main: '#61affe', light: 'rgba(97, 175, 254, 0.05)' };
};

export const getHeaderFlags = (headers: AuthHeader[]) =>
  headers.map(hdr => `-H '${hdr.name}: ${hdr.value}'`).join(' ');

export const isApiKeyAuthEnabled = (
  details: Wso2ApiDetail | undefined,
  apiKeyAuthPolicy: any,
) => {
  if (!details) return false;

  const securityScheme = details.securityScheme;
  if (Array.isArray(securityScheme) && securityScheme.length > 0) {
    return securityScheme.some(scheme => {
      const s = scheme.toLowerCase();
      return s.includes('api_key') || s.includes('apikey');
    });
  }

  if (apiKeyAuthPolicy) return true;

  const headers =
    details.corsConfiguration?.accessControlAllowHeaders ||
    details.accessControlAllowHeaders;
  if (!Array.isArray(headers)) return false;

  return headers.some(h => {
    const lower = h.toLowerCase();
    return lower === 'apikey' || lower === 'api_key';
  });
};

export const normalizeAsyncOperations = (
  operations: any,
  fallbackVerb: string,
  fallbackPath?: string,
) => {
  let ops: any[] = [];
  if (Array.isArray(operations)) {
    ops = operations;
  } else if (operations && typeof operations === 'object') {
    ops = Object.entries(operations).map(([path, channelObj]: [string, any]) => {
      const hasPub = channelObj && Boolean(channelObj.publish || channelObj.pub);
      const hasSub =
        channelObj && Boolean(channelObj.subscribe || channelObj.sub);
      let verb = fallbackVerb;
      if (hasPub && !hasSub) verb = 'PUB';
      else if (hasSub && !hasPub) verb = 'SUB';
      else if (hasPub && hasSub) verb = 'PUB/SUB';
      return { verb, path, target: path };
    });
  }

  if (ops.length === 0 && fallbackPath) {
    ops = [{ verb: fallbackVerb, path: fallbackPath, target: fallbackPath }];
  }

  return ops;
};

export const useGatewaySelection = (gatewayUrls: GatewayUrl[]) => {
  const [selectedUrl, setSelectedUrl] = useState('');

  useEffect(() => {
    if (gatewayUrls && gatewayUrls.length > 0) {
      setSelectedUrl(gatewayUrls[0].url);
    }
  }, [gatewayUrls]);

  const activeUrl = selectedUrl;

  return {
    selectedUrl,
    setSelectedUrl,
    activeUrl,
  };
};

export const useCopiedIndex = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const markCopied = (index: number) => {
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return { copiedIndex, markCopied };
};

export const usePaginatedOperations = (
  operations: any[],
  itemsPerPage: number,
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(operations.length / itemsPerPage);
  const paginatedOperations = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return operations.slice(startIdx, startIdx + itemsPerPage);
  }, [operations, currentPage, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedOperations,
  };
};

export const useExpandedOperations = () => {
  const [expandedOperations, setExpandedOperations] = useState<
    Record<number, boolean>
  >({});

  const isExpanded = (index: number) => expandedOperations[index] ?? index === 0;
  const toggleExpanded = (index: number) => {
    setExpandedOperations(prev => ({
      ...prev,
      [index]: !(prev[index] ?? index === 0),
    }));
  };

  return { isExpanded, toggleExpanded };
};

export const useAsyncAuthHeaders = ({
  apiKeyRef,
  externalApiKey,
  apiKeyAuthPolicy,
  details,
  refreshToken,
  preferApiKeyHeader = false,
  defaultApiKeyHeader = 'apikey',
}: {
  apiKeyRef: MutableRefObject<string | null>;
  externalApiKey: string;
  apiKeyAuthPolicy: any;
  details?: Wso2ApiDetail;
  refreshToken: number;
  preferApiKeyHeader?: boolean;
  defaultApiKeyHeader?: string;
}) =>
  useMemo(() => {
    void refreshToken;

    const headers: AuthHeader[] = [];
    const currentKey = apiKeyRef.current;

    if (preferApiKeyHeader || apiKeyAuthPolicy || currentKey !== null) {
      const headerName = details?.apiKeyHeader || defaultApiKeyHeader;
      headers.push({ name: headerName, value: currentKey || 'undefined' });
    } else {
      headers.push({
        name: 'Authorization',
        value: `Bearer ${currentKey || 'undefined'}`,
      });
    }

    if (externalApiKey && apiKeyAuthPolicy) {
      const { in: location, key } = apiKeyAuthPolicy.params || {};
      if (location === 'header') {
        headers.push({ name: key || 'x-api-key', value: externalApiKey });
      }
    }

    return headers;
  }, [
    apiKeyRef,
    externalApiKey,
    apiKeyAuthPolicy,
    details?.apiKeyHeader,
    refreshToken,
    preferApiKeyHeader,
    defaultApiKeyHeader,
  ]);
