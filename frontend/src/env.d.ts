/// <reference types="vite/client.d.ts" />

interface ImportMetaEnv {
  readonly TEST_ENV_API_HOST: string
  readonly TEST_ENV_SOCKET_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
