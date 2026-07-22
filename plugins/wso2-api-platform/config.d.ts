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
  wso2PlatformGateway?: {
    /**
     * @visibility frontend
     */
    enabled?: boolean;
  };
}
