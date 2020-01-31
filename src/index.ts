import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENV
});

import { CahServer } from "./lib/CahServer";

let cahServer = new CahServer();
export { cahServer };
