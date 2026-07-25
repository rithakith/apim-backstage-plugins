import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import wso2ApiPlatformPlugin from '@wso2/backstage-plugin-wso2-api-platform/alpha';
import { navModule } from './modules/nav';

export default createApp({
  features: [catalogPlugin, wso2ApiPlatformPlugin, navModule],
});
