import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

export default (vue, router) => {
  if (process.env.SENTRY_URL) {
    Sentry.init({
      vue,
      dsn: process.env.SENTRY_URL,
      integrations: [
        new Integrations.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          tracingOrigins: [/.*/],
        }),
      ],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  }
}
