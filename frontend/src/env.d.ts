/// <reference types="vite/client.d.ts" />

interface ImportMetaEnv {
  VITE_ENV_JIRA_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
