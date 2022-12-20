<script>
import PlayerBar from 'components/PlayerBar'
import AudioPlayer from 'components/AudioPlayer'
import LyricsBar from 'components/LyricsBar'
import PiPSubtitle from 'components/PiPSubtitle'
import SleepMode from 'components/SleepMode'
import { mapMutations, mapState } from 'vuex'
import UpdateNotify from 'src/mixins/UpdateNotify'
import NotifyMixin from '../mixins/Notification.js'

export default {
  name: 'MainLayout',

  components: {
    PlayerBar,
    AudioPlayer,
    LyricsBar,
    PiPSubtitle,
    SleepMode,
  },

  mixins: [NotifyMixin, UpdateNotify],

  data() {
    return {
      keyword: '',
      drawerOpen: false,
      miniState: true,
      confirm: false,
      randId: null,
      showTimer: false,
    }
  },

  computed: {
    supportPiPSubtitle() {
      // return  ('mediaSession' in navigator) && ('setPositionState' in navigator.mediaSession)
      // 浏览器不支持 pip，则不初始化 pip 模块
      // 但播放器的 pip 按钮正常显示，用于提示用户升级浏览器
      if (!('pictureInPictureEnabled' in document))
        return false

      // 用户已禁止 pip
      else if (!document.pictureInPictureEnabled)
        return false

      return true
    },
    links() {
      return [
        {
          title: this.$t('sidebar.library'),
          icon: 'widgets',
          path: '/',
        },
        {
          title: this.$t('sidebar.myFavourites'),
          icon: 'favorite',
          path: '/favourites',
        },
        {
          title: this.$t('sidebar.circles'),
          icon: 'group',
          path: '/circles',
        },
        {
          title: this.$t('sidebar.tags'),
          icon: 'label',
          path: '/tags',
        },
        {
          title: this.$t('sidebar.vas'),
          icon: 'mic',
          path: '/vas',
        },
        {
          title: this.$t('sidebar.configration'),
          icon: 'tune',
          path: '/admin',
        },
      ]
    },
    isNotAtHomePage() {
      const path = this.$route.path
      return path && path !== '/' && path !== '/works' && path !== '/favourites'
    },

    ...mapState('User', {
      userName: 'name',
      authEnabled: 'auth',
    }),

    ...mapState('AudioPlayer', [
      'shouldLoadPlayer',
    ]),
  },

  watch: {
    '$q.dark.isActive': function (isActive) {
      this.$q.localStorage.set('dark', isActive)
    },
    keyword() {
      this.$router.push(this.keyword ? `/works?keyword=${this.keyword}` : '/works')
    },

    randId() {
      this.$router.push(`/work/RJ${this.randId}`)
    },
  },

  mounted() {
    this.initUser()
    this.checkUpdate()
    this.loadSharedConfig()

    if (this.$q.localStorage.has('dark') && this.$q.localStorage.getItem('dark'))
      this.$q.dark.set(true)
  },

  methods: {
    ...mapMutations('AudioPlayer', [
      'SET_REWIND_SEEK_TIME',
      'SET_FORWARD_SEEK_TIME',
      'SET_QUALITY_BEHAVIOR',
    ]),
    initUser() {
      this.$axios.get('/api/auth/me')
        .then((res) => {
          this.$store.commit('User/INIT', res.data.user)
          this.$store.commit('User/SET_AUTH', res.data.auth)
          this.$store.commit('User/SET_REG', res.data.reg)
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status === 401) {
              // this.showWarnNotif(error.response.data.error)
              // 验证失败，跳转到登录页面
              const path = this.$router.currentRoute.fullPath
              if (!path.startsWith('/login'))
                this.$router.replace('/login')
            }
            else {
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
            }
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },

    checkUpdate() {
      this.$axios.get('/api/version')
        .then((res) => {
          if (res.data.update_available && res.data.notifyUser) {
            this.$q.notify({
              message: 'GitHub上有新版本',
              color: 'primary',
              textColor: 'white',
              icon: 'cloud_download',
              timeout: 5000,
              actions: [
                { label: '好', color: 'white' },
                {
                  label: '查看',
                  color: 'white',
                  handler: () => {
                    Object.assign(document.createElement('a'), {
                      target: '_blank',
                      href: 'https://github.com/umonaca/kikoeru-express/releases',
                    }).click()
                  },
                },
              ],
            })
          }

          if (res.data.lockFileExists) {
            this.$q.notify({
              message: res.data.lockReason,
              type: 'warning',
              timeout: 60000,
              actions: [
                { label: '以后提醒我', color: 'black' },
                { label: '前往扫描页', color: 'black', handler: () => this.$router.push('/admin/scanner') },
              ],
            })
          }
        })
        .catch((error) => {
          console.error(error)
        })
    },

    loadSharedConfig() {
      const sharedConfig = this.$q.localStorage.getItem('sharedConfig') || {
        rewindSeekTime: 5,
        forwardSeekTime: 30,
        qualityBehavior: 'fluentFirst',
      }

      if (sharedConfig.rewindSeekTime)
        this.SET_REWIND_SEEK_TIME(sharedConfig.rewindSeekTime)
      if (sharedConfig.forwardSeekTime)
        this.SET_FORWARD_SEEK_TIME(sharedConfig.forwardSeekTime)
      if (sharedConfig.qualityBehavior)
        this.SET_QUALITY_BEHAVIOR(sharedConfig.qualityBehavior)
    },

    randomPlay() {
      this.requestRandomWork()
    },

    requestRandomWork() {
      const params = {
        order: 'betterRandom',
      }
      this.$axios.get('/api/works', { params })
        .then((response) => {
          const works = response.data.works
          this.randId = works.length ? works[0].id : null
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status !== 401)
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },

    logout() {
      this.$q.localStorage.set('jwt-token', '')
      this.$router.push('/login')
    },

    back() {
      if (
        this.$store.state.route.from === undefined
        || this.$store.state.route.from.path === '/'
        || this.$store.state.route.from.path === '/login'
      ) {
        this.$router.push('/')
      }
      else if ('specifyBackTarget' in window && this.$store.state.route.from.name === 'work') {
        this.$router.push(window.specifyBackTarget)
        delete window.specifyBackTarget
      }
      else {
        this.$router.back()
      }
    },
  },
}
</script>

<template>
  <q-layout view="hHh Lpr lFf" :class="`${!$q.dark.isActive && 'bg-grey-3'}`">
    <q-header :class="!$q.dark.isActive ? 'shadow-4' : ''">
      <q-toolbar class="row justify-between" :class="$q.dark.isActive && 'bg-dark'">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="drawerOpen = !drawerOpen" />

        <q-btn v-if="isNotAtHomePage" flat size="md" icon="arrow_back_ios" @click="back()" />

        <q-toolbar-title class="gt-xs">
          <router-link to="/" class="text-white">
            Kikoeru
          </router-link>
        </q-toolbar-title>

        <q-input v-model="keyword" dark dense rounded standout debounce="500" input-class="text-right" class="q-mr-sm">
          <template #append>
            <q-icon v-if="keyword === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="keyword = ''" />
          </template>
        </q-input>
      </q-toolbar>

      <PiPSubtitle v-if="shouldLoadPlayer && supportPiPSubtitle" />
      <AudioPlayer v-if="shouldLoadPlayer" />
    </q-header>

    <q-drawer
      v-model="drawerOpen" show-if-above :mini="miniState" mini-to-overlay
      :width="230" :breakpoint="500" bordered :content-class="`${!$q.dark.isActive && 'bg-grey-1'}`" @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item
            v-for="link in links" :key="link.title" v-ripple clickable exact
            :to="link.path" active-class="text-deep-purple text-weight-medium" @click="miniState = true"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ link.title }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-ripple clickable exact active-class="text-deep-purple text-weight-medium" @click="randomPlay">
            <q-item-section avatar>
              <q-icon name="shuffle" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.randomPlay') }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-ripple clickable exact active-class="text-deep-purple text-weight-medium" @click="showTimer = true">
            <q-item-section avatar>
              <q-icon name="bedtime" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.sleepMode') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list>
          <q-item v-ripple clickable exact active-class="text-deep-purple text-weight-medium" @click="$q.dark.toggle()">
            <q-item-section avatar>
              <q-icon :name="`${$q.dark.isActive ? 'wb_sunny' : 'nights_stay'}`" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.darkMode') }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-ripple clickable exact to="/about" active-class="text-deep-purple text-weight-medium"
            @click="miniState = true"
          >
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.about') }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-ripple clickable exact to="/settings" active-class="text-deep-purple text-weight-medium"
            @click="miniState = true"
          >
            <q-item-section avatar>
              <q-icon name="tune" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.settings') }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="authEnabled" v-ripple clickable exact active-class="text-deep-purple text-weight-medium"
            @click="confirm = true"
          >
            <q-item-section avatar>
              <q-icon name="exit_to_app" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.logout') }}
              </q-item-label>
              <q-item-label caption lines="2">
                {{ userName }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="power_settings_new" color="primary" text-color="white" />
          <span class="q-ml-sm">{{ $t('sidebar.doubleCheckLogout') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="$t('sidebar.doubleCheckLogoutCancel')" color="primary" />
          <q-btn v-close-popup flat :label="$t('sidebar.doubleCheckLogoutConfirm')" color="primary" @click="logout()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <SleepMode v-model="showTimer" />

    <q-page-container>
      <router-view v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </router-view>
      <q-page-scroller id="gotop" position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
        <q-btn fab icon="keyboard_arrow_up" color="accent" />
      </q-page-scroller>
    </q-page-container>

    <q-footer class="q-pa-none">
      <LyricsBar v-if="shouldLoadPlayer" v-show="$store.state.AudioPlayer.subtitleDisplayMode === 'in-app'" />
      <PlayerBar v-if="shouldLoadPlayer" />
    </q-footer>
  </q-layout>
</template>

<style lang="scss">
// 侧边栏底部按钮
aside.q-drawer div.q-scrollarea>div.scroll>div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
</style>
