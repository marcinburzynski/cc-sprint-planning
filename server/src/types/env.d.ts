declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TZ?: string;
            SECRET: string;
            DB_URL: string;
            DB_HOST: string;
            REDIS_PORT: string;
            REDIS_HOST: string;
            POSTGRES_DB: string;
            POSTGRES_USER: string;
            POSTGRES_PASSWORD: string;
            TEST_ENV_API_HOST: string;
            TEST_ENV_SOCKET_HOST: string;
        }
    }
}

export {}
