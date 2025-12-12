import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "../pet-management-api/src/main/resources/openapi.yml",
    },
    output: {
      target: "./src/api",         
      schemas: "./src/types/api",  
      client: "react-query",        
      httpClient: "axios",          
      mode: "tags-split",        
      clean: true,                  
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});