import { defineConfig } from "orval";

// OpenAPI: https://unibac-be-staging.up.railway.app/docs-json
export default defineConfig({
  api: {
    input: {
      target: "https://unibac-be-staging.up.railway.app/docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/models",
      client: "axios",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/api/mutator.ts",
          name: "customInstance",
        },
      },
    },
  },
});
