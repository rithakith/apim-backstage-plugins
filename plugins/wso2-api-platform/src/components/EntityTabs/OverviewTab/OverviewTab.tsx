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

import React from 'react';
import {
    AboutField,
} from '@backstage/plugin-catalog';
import {
    InfoCard,
    HeaderIconLinkRow,
    IconLinkVerticalProps,
} from '@backstage/core-components';
import {
    useEntity,
    entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import Grid from '@material-ui/core/Grid';
import DescriptionIcon from '@material-ui/icons/Description';
import { formatLifecycleStatus, isServiceEntity } from '../../../utils';
import { EntityWso2ServiceOverviewCard } from './components/ServiceOverviewCard';

/**
 * A custom About card for WSO2 APIs that shows WSO2 specific metadata.
 */
const EntityWso2OverviewTabContent = () => {
    const { entity } = useEntity();

    const entityRoute = useRouteRef(entityRouteRef);
    const wso2TabUrl = `${entityRoute({
        namespace: entity.metadata.namespace || 'default',
        kind: entity.kind.toLowerCase(),
        name: entity.metadata.name,
    })}/wso2`;

    const links: IconLinkVerticalProps[] = [];

    links.push({
        label: 'View TechDocs',
        icon: <DescriptionIcon />,
        href: wso2TabUrl,
    });

    const annotations = entity.metadata.annotations || {};
    const gridSizes = { xs: 12, sm: 6, lg: 4 };

    // Helper to get annotation value with fallback prefix
    const getAnnotation = (key: string) => annotations[`wso2.com/${key}`] || annotations[`wso2-gateway.com/${key}`];
    const parseJsonAnnotation = (value?: string) => {
        if (!value) return undefined;
        try {
            return JSON.parse(value);
        } catch {
            return undefined;
        }
    };

    const lifecycle = formatLifecycleStatus(
        getAnnotation('api-lifecycle-status'),
    );
    const context = getAnnotation('api-context');
    const version = getAnnotation('api-version');
    const provider = getAnnotation('api-provider');
    const endpointsRaw = getAnnotation('api-endpoints');
    const gateway = getAnnotation('api-gateway')?.toUpperCase();
    const throttlingPolicy = getAnnotation('api-throttling-policy');
    const securityScheme = parseJsonAnnotation(getAnnotation('api-security-scheme'));
    const gatewayValue = (() => {
        if (endpointsRaw) {
            try {
                const endpoints = JSON.parse(endpointsRaw);
                if (Array.isArray(endpoints) && endpoints.length > 0) {
                    const ep = endpoints[0];
                    const url = Array.isArray(ep.urls) ? ep.urls[0] : ep.urls;
                    return `${ep.environmentName}${url ? ` (${url})` : ''}`;
                }
            } catch (e) {
                return 'Unknown';
            }
        }
        return gateway || undefined;
    })();

    const description = entity.metadata.description;

    return (
        <InfoCard
            variant="gridItem"
            subheader={<HeaderIconLinkRow links={links} />}
        >
            <Grid container>
                <AboutField label="Name" value={entity.metadata.name} gridSizes={gridSizes} />
                <AboutField label="Display Name" value={entity.metadata.title || entity.metadata.name} gridSizes={gridSizes} />
                {lifecycle && (
                    <AboutField label="Lifecycle" value={lifecycle} gridSizes={gridSizes} />
                )}
                {context && (
                    <AboutField label="Context" value={context} gridSizes={gridSizes} />
                )}
                {version && (
                    <AboutField label="Version" value={version} gridSizes={gridSizes} />
                )}
                {provider && (
                    <AboutField label="Provider" value={provider} gridSizes={gridSizes} />
                )}
                {gatewayValue && (
                    <AboutField
                        label="Gateway"
                        value={gatewayValue}
                        gridSizes={gridSizes}
                    />
                )}
                {throttlingPolicy && (
                    <AboutField label="Throttling Policy" value={throttlingPolicy} gridSizes={gridSizes} />
                )}
                {securityScheme && (
                    <AboutField label="Security Scheme" value={Array.isArray(securityScheme) ? securityScheme.join(', ') : securityScheme} gridSizes={gridSizes} />
                )}
                {description && (
                    <AboutField label="Description" value={description} gridSizes={gridSizes} />
                )}
            </Grid>
        </InfoCard>
    );
};

export const EntityWso2OverviewTab = () => {
    const { entity } = useEntity();

    if (isServiceEntity(entity)) {
        return <EntityWso2ServiceOverviewCard />;
    }

    return <EntityWso2OverviewTabContent />;
};
