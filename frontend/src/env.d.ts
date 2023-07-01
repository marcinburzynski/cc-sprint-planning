/// <reference types="vite/client.d.ts" />

interface ImportMetaEnv {
  VITE_ENV_JIRA_CLIENT_ID: string;
  VITE_ENV_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
