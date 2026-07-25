export interface Config {
  wso2ApiPlatform?: {
    /**
     * Enables WSO2 API Manager integration.
     * Defaults to false.
     * @visibility frontend
     */
    enabled?: boolean;
    baseUrl: string;
    publisherBasePath: string;
    developerBasePath: string;
    serviceCatalogBasePath?: string;
    tls?: {
      rejectUnauthorized?: boolean;
    };
    auth: {
      tokenUrl?: string;
      /** @visibility secret */
      clientId: string;
      /** @visibility secret */
      clientSecret: string;
      /** @visibility secret */
      username?: string;
      /** @visibility secret */
      password?: string;
      additionalScopes?: string[];
    };
    /**
     * The timeout in seconds for the catalog synchronization polling.
     * @visibility frontend
     */
    catalogSyncTimeoutSeconds?: number;
  };
  /**
   * Configuration for self-hosted WSO2 API Platform Gateways.
   * @visibility frontend
   */
  wso2PlatformGateway?: {
    /**
     * Enables WSO2 API Platform Gateway discovery.
     * Defaults to false.
     * @visibility frontend
     */
    enabled?: boolean;
    gateways?: Array<{
      name: string;
      urls: string[];
      /** @visibility frontend */
      discoveryUrl?: string;
      /** @visibility secret */
      discoveryUsername?: string;
      /** @visibility secret */
      discoveryPassword?: string;
      environmentType?: string;
      description?: string;
      organizationId?: string;
    }>;
  };
}
