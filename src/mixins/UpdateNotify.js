// 本 Mixin 用于提醒用户，他的前端已经升级到最新版

import {version} from '../../package.json';
import { openURL } from 'quasar'


export default {
  methods: {
    /**
     * 当检测到更新时，通过本方法通知用户
     */
    notifyUpdate: function (remoteVersion) {
      let actions = [{label: '忽略', color: 'white'}]
      if (process.env.BLOG_URL) {
        let changeLogUrl = process.env.BLOG_URL + '/frontend-' + version.replace('.', '-');
        actions.push({
          label: '查看',
          color: 'yellow',
          handler: () => {
            openURL(changeLogUrl)
          }
        })
      }
      this.$q.notify({
        message: '新版本发布！',
        caption: 'v' + remoteVersion,
        color: 'positive',
        icon: 'done',
        timeout: 10000,
        multiLine: false,
        actions
      })
    },

    /**
     * 检查版本号是否有更新
     */
    hasUpdate(localVersion, remoteVersion) {
      let v1 = localVersion.split('.').slice(0, -1).join('.')
      let v2 = remoteVersion.split('.').slice(0, -1).join('.')
      return v1 !== v2
    },

    /**
     * 刷新本地保存的版本号
     */
    doUpdate(remoteVersion) {
      this.$q.localStorage.set('localVersion', remoteVersion)
    },
  },
  mounted() {
    let localVersion = this.$q.localStorage.getItem('localVersion')
    if (!localVersion || this.hasUpdate(localVersion, version)) {
      this.notifyUpdate(version)
      this.doUpdate(version)
    }
  }
}
