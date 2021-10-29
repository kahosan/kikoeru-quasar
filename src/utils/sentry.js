import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

export default (vue, router) => {
  Sentry.init({
    vue,
    dsn: "https://4df82242e941492fa09a722c2bb33533@sentry.example.com/3",
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
