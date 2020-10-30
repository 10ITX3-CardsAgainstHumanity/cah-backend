import * as Sentry from "@sentry/node";

if (process.env.ENABLE_SENTRY) {
    if (!process.env.SENTRY_DSN)
        throw new Error('If you want to use sentry, please set SENTRY_DSN!');
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.ENV
    });
}

import { CahServer } from "./lib/CahServer";

let cahServer = new CahServer();
export { cahServer };
