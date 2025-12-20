import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "../pet-management-api/src/main/resources/openapi.yml",
    },
    output: {
      target: "./src/api/generated",         
      schemas: "./src/types/api",  
      client: "react-query",        
      httpClient: "axios",          
      mode: "tags-split",        
      clean: true,
      override: {
        mutator: {
          path: "./src/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});