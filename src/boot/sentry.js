import Vue from 'vue'
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

export default async ({ router }) => {
  if (process.env.SENTRY_URL) {
    Sentry.init({
      Vue,
      dsn: process.env.SENTRY_URL,
      integrations: [
        new Integrations.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          tracingOrigins: [/.*/],
        }),
      ],
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications.',

        'AbortError: The operation was aborted.',
        'AbortError: The play() request was interrupted by a new load request.',
        'AbortError: The play() request was interrupted by a new load request. https://goo.gl/LdLk22',
        'AbortError: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22',

        'The fetching process for the media resource was aborted by the user agent at the user\'s request.',
        'NavigationDuplicated',
        'Cannot read properties of null (reading \'disconnect\')',
      ]
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      // tracesSampleRate: 0.25,
    });
  }
}
