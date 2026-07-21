export interface Config {
  catalog?: {
    providers?: {
      wso2Apim?: {
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
  wso2ApiManager?: {
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
