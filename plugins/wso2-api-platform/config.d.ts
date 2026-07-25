export interface Config {
  catalog?: {
    providers?: {
      wso2ApiPlatform?: {
        schedule?: {
          frequency?: {
            /**
             * @visibility frontend
             */
            minutes?: number;
          };
        };
      };
    };
  };
  wso2ApiPlatform?: {
    /**
     * @visibility frontend
     */
    enabled?: boolean;
    /**
     * @visibility frontend
     */
    catalogSyncTimeoutSeconds?: number;
  };
  wso2ApiPlatformGateway?: {
    /**
     * Enables WSO2 API Platform Gateway discovery.
     * @visibility frontend
     */
    enabled?: boolean;
  };
}
