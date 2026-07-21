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


import React from 'react';
import { AboutField } from '@backstage/plugin-catalog';
import {
  EmptyState,
  InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import Grid from '@material-ui/core/Grid';

const SERVICE_ID_ANNOTATION = 'wso2.com/service-id';

const getAnnotation = (annotations: Record<string, string>, key: string) =>
  annotations[`wso2.com/${key}`] || '';

const formatBoolean = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return value === 'true' ? 'Enabled' : 'Disabled';
};

export const EntityWso2ServiceOverviewCard = () => {
  const { entity } = useEntity();
  const annotations = entity.metadata.annotations || {};
  const serviceId = annotations[SERVICE_ID_ANNOTATION];
  const gridSizes = { xs: 12, sm: 6, lg: 4 };

  if (!serviceId) {
    return (
      <EmptyState
        title="Missing WSO2 service annotation"
        missing="info"
        description={`Add ${SERVICE_ID_ANNOTATION} to the entity annotations.`}
      />
    );
  }

  const fields = [
    { label: 'Name', value: entity.metadata.title || entity.metadata.name },
    { label: 'Version', value: getAnnotation(annotations, 'service-version') },
    { label: 'Service URL', value: getAnnotation(annotations, 'service-url') },
    {
      label: 'Definition Type',
      value: getAnnotation(annotations, 'service-definition-type'),
    },
    {
      label: 'Security Type',
      value: getAnnotation(annotations, 'service-security-type'),
    },
    {
      label: 'Mutual SSL',
      value: formatBoolean(
        getAnnotation(annotations, 'service-mutual-ssl-enabled'),
      ),
    },
    {
      label: 'Usage Count',
      value: getAnnotation(annotations, 'service-usage-count'),
    },
    { label: 'Service Key', value: getAnnotation(annotations, 'service-key') },

    {
      label: 'Definition URL',
      value: getAnnotation(annotations, 'service-definition-url'),
    },
    { label: 'Description', value: entity.metadata.description },
  ].filter(field => field.value !== undefined && field.value !== '');

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <InfoCard>
          <Grid container>
            {fields.map(field => (
              <AboutField
                key={field.label}
                label={field.label}
                value={field.value}
                gridSizes={gridSizes}
              />
            ))}
          </Grid>
        </InfoCard>
      </Grid>
    </Grid>
  );
};
