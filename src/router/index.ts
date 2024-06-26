import { createRouter, createWebHistory } from 'vue-router'

import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  // Leave these as they are and change in quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath

  const base = process.env.ROUTER_BASE || '/'

  const Router = createRouter({
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition)
        return savedPosition
      else if (to.hash)
        return { el: to.hash, behavior: 'smooth' }
      else
        return { top: 0, left: 0 }
    },
    routes,
    history: createWebHistory(base),
  })

  return Router
}
