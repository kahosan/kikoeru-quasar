// 本 Mixin 用于提醒用户，他的前端已经升级到最新版

import {version} from '../../package.json';
import { openURL } from 'quasar'


export default {
  computed: {
    changelogUrl() {
      return 'https://blog.example.com/' + 'frontend-' + version.replace('.', '-')
    }
  },
  methods: {
    /**
     * 当检测到更新时，通过本方法通知用户
     */
    notifyUpdate (remoteVersion) {
      this.$q.notify({
        message: '新版本发布！',
        caption: 'v' + remoteVersion,
        color: 'positive',
        icon: 'done',
        timeout: 10000,
        multiLine: false,
        actions: [
          {label: '忽略', color: 'white'},
          {label: '查看', color: 'yellow', handler: () => {openURL(this.changelogUrl)}}
        ]
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
