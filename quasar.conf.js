// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = function (ctx) {
  ctx.env = require('dotenv').config().parsed

  return {
    supportTS: true,
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [
      'axios',
      'i18n',
      'vue-meta',
      'socket.io',
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.scss',
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v4',
      'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'zh-CN', // Quasar language pack

      config: {
        dark: true,
      },

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      all: 'auto',

      components: [],
      directives: [],

      // Quasar plugins
      plugins: [
        'LocalStorage',
        'SessionStorage',
        'Notify',
      ],
    },

    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ie
    supportIE: false,

    vendor: {
      remove: ['vue-plyr', 'plyr', 'vuedraggable', 'sortablejs', '@ant-design/icons', '@ant-design/icons/lib/dist/svg', '@ant-design/icons/lib/dist/font'],
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      env: require('dotenv').config().parsed, // patchDotEnvForQuasar1(require('dotenv').config().parsed),

      vueRouterMode: 'history', // available values: 'hash', 'history'

      // rtl: false, // https://quasar.dev/options/rtl-support
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // preloadChunks: false,
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack(cfg) {
        cfg.plugins.push(new CopyWebpackPlugin([{ from: 'public/', to: '' }]))
        cfg.plugins.push(new ESLintPlugin({ extensions: ['js', 'ts', 'vue'] }))

        const STATIC_CDN = process.env.STATIC_CDN
        if (cfg.mode === 'production' && STATIC_CDN)
          cfg.output.publicPath = `${STATIC_CDN}/`
        else if (cfg.mode === 'production')
          cfg.output.publicPath = './'
      },
      modern: true,
      sourceMap: false,
      devtool: 'source-map',
      transpile: true,
      // transpileDependencies: ['.*?plyr.*?', 'plyr']
      // transpileDependencies: [/[\\\/]node_modules[\\\/]test[\\\/]/]
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 6790,
      open: false, // opens browser window automatically
      proxy: {
        // https://webpack.js.org/configuration/dev-server/#devserverproxy
        // proxy all requests starting with /api to http://localhost:8888
        '/api': {
          // target: 'https://api.asmr.one',
          target: 'http://10.88.88.106:6789',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'http://10.88.88.106:6789',
          ws: true,
        },
      },
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        exclude: [
          /manifest\.json$/,
          /.*.js.map$/,
        ],
        navigateFallbackBlacklist: [
          /^\/api\/.*$/,
        ],
        importWorkboxFrom: 'local',
      }, // only for GenerateSW
      manifest: {
        name: 'Kikoeru',
        short_name: 'Kikoeru',
        description: 'A self-hosted web media player for listening to your DLsite voice works.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
      id: 'org.cordova.quasar.kikoeru',
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'kikoeru-quasar',
      },

      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,

      extendWebpack() {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },
    },
  }
}
