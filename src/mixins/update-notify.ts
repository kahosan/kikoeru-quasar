// 本 Mixin 用于提醒用户，他的前端已经升级到最新版

import { openURL } from 'quasar'
import { defineComponent } from 'vue'
import pa from '../../package.json'

export default defineComponent({
  mounted() {
    this.checkIOSNeedUpdate()

    const localVersion = this.$q.localStorage.getItem('localVersion')?.toString()
    if (localVersion && this.hasUpdate(localVersion, pa.version)) {
      this.notifyUpdate(pa.version)
      this.doUpdate(pa.version)
    }
    else if (!localVersion) {
      this.doUpdate(pa.version)
    }
  },
  methods: {
    /**
     * 当检测到更新时，通过本方法通知用户
     */
    notifyUpdate(remoteVersion: string) {
      const actions = [{ label: '忽略', color: 'white', handler: () => {} }]
      if (process.env.BLOG_URL) {
        const changeLogUrl = `${process.env.BLOG_URL}/frontend-${pa.version.replace('.', '-')}`
        actions.push({
          label: '查看',
          color: 'yellow',
          handler: () => {
            openURL(changeLogUrl)
          },
        })
      }
      this.$q.notify({
        message: '新版本发布！',
        caption: `v${remoteVersion}`,
        color: 'positive',
        icon: 'done',
        timeout: 10000,
        multiLine: false,
        actions,
      })
    },

    /**
     * 检查版本号是否有更新
     */
    hasUpdate(localVersion: string, remoteVersion: string) {
      const v1 = localVersion.split('.').slice(0, -1).join('.')
      const v2 = remoteVersion.split('.').slice(0, -1).join('.')
      return v1 !== v2
    },

    /**
     * 刷新本地保存的版本号
     */
    doUpdate(remoteVersion: string) {
      this.$q.localStorage.set('localVersion', remoteVersion)
    },

    /**
     * 检查 iOS 版本，提醒用户升级到最新版，最新版支持后台播放
     */
    checkIOSNeedUpdate() {
      const iPhoneOS = navigator.userAgent.match(/OS ((\d+_?){2,3})\s/)
      const iPadOS = navigator.userAgent.match(/Version\/((\d+.?){2,3})/)
      let a, b

      if (iPhoneOS)
        [a, b] = iPhoneOS[1].split('_').map(v => Number.parseInt(v))
      else if (iPadOS)
        [a, b] = iPadOS[1].split('.').map(v => Number.parseInt(v))
      else
        return

      console.info('ios version', a, b)

      // 15 > iOS > 15.6
      if (a === 15 && b < 6 && !this.$q.localStorage.getItem('never_shown_need_upgrade_iOS_15_6_1')) {
        this.$q.notify({
          message: this.$t('common.need_upgrade_iOS_15_6_1'),
          caption: this.$t('common.new_feature_on_iOS_15_6_1'),
          color: 'warning',
          textColor: 'black',
          timeout: 10000,
          multiLine: true,
          actions: [
            {
              label: this.$t('common.neverShown'),
              color: 'secondary',
              handler: () => {
                this.$q.localStorage.set('never_shown_need_upgrade_iOS_15_6_1', true)
              },
            },
            {
              label: this.$t('common.dismiss'),
              color: 'primary',
            },
          ],
        })
      }
    },
  },
})
