import { createStore } from 'vuex'

import AudioPlayer from './module-AudioPlayer'
import User from './module-User'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const store = createStore({
    modules: {
      AudioPlayer,
      User,
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: !!process.env.DEV,
  })

  if (process.env.DEV && module.hot) {
    module.hot.accept(['./module-AudioPlayer'], () => {
      import('./module-AudioPlayer').then(ap => store.hotUpdate({ modules: { AudioPlayer: ap.default } }))
    })

    module.hot.accept(['./module-User'], () => {
      import('./module-User').then(user => store.hotUpdate({ modules: { User: user.default } }))
    })
  }

  return store
}
