import { defineConfig } from "orval";

// OpenAPI: https://unibac-be-staging.up.railway.app/docs-json
export default defineConfig({
  api: {
    input: {
      target: "https://unibac-be-staging.up.railway.app/docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./api/generated/endpoints.ts",
      schemas: "./api/generated/models",
      client: "axios",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./lib/api/mutator.ts",
          name: "customInstance",
        },
      },
    },
  },
});
