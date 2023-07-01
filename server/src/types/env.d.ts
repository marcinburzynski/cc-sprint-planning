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
            JIRA_CLIENT_ID: string;
            JIRA_CLIENT_SECRET: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            APP_HOST: string;
        }
    }
}

export {}
