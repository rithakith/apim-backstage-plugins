# WSO2 Plugins API Documentation

This directory contains the documentation for the WSO2 APIs that are internally called by our Backstage plugins. We use [Redocly](https://redocly.com/) to generate beautiful, interactive API references from our OpenAPI specifications.

## Viewing the Documentation

You can view the generated documentation by opening the respective `index.html` files directly in your web browser. The documentation provides a comprehensive look at the endpoints, request/response models, and authentication methods used by the plugins.

For example, to view the documentation:
- `wso2-api-platform-backend/index.html`
- `catalog-backend-module-wso2-apim/index.html`

## How to Regenerate Documentation

If you make modifications to the OpenAPI specifications (`openapi.yaml` files) inside this directory, you will need to regenerate the HTML documentation to reflect those changes. 

### Prerequisites

Ensure you have Node.js and `npx` installed on your machine.

### Generating Docs

We use the `@redocly/cli` tool to build the static HTML documentation based on the configuration in `redocly.yaml`. To regenerate the documentation, run the following commands from inside the `api-docs` directory:

1. **For the Backend Plugin (`wso2-api-platform-backend`):**
   ```bash
   npx @redocly/cli build-docs wso2-api-platform-backend@v1 -o ./wso2-api-platform-backend/index.html
   ```

2. **For the Catalog Backend Module (`catalog-backend-module-wso2-apim`):**
   ```bash
   npx @redocly/cli build-docs catalog-backend-module-wso2-apim@v1 -o ./catalog-backend-module-wso2-apim/index.html
   ```

### Validating Specifications

You can also use the Redocly CLI to validate your OpenAPI specifications against the linting rules defined in our `redocly.yaml`:

```bash
npx @redocly/cli lint
```

This ensures that your specifications are syntactically correct, follow best practices, and adhere to our recommended API design guidelines.
