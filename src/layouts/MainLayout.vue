<template>
  <q-layout view="hHh Lpr lFf" :class="`${!this.$q.dark.isActive && 'bg-grey-3'}`">
    <q-header class="shadow-4">
      <q-toolbar class="row justify-between" :class="$q.dark.isActive && 'bg-dark'">
        <q-btn flat dense round @click="drawerOpen = !drawerOpen" icon="menu" aria-label="Menu" />

        <q-btn flat size="md" icon="arrow_back_ios" @click="back()" v-if="isNotAtHomePage"/>

        <q-toolbar-title class="gt-xs">
          <router-link :to="'/'" class="text-white">
            Kikoeru
          </router-link>
        </q-toolbar-title>

        <q-input dark dense rounded standout v-model="keyword" debounce="500" input-class="text-right" class="q-mr-sm">
          <template v-slot:append>
            <q-icon v-if="keyword === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="keyword = ''" />
          </template>
        </q-input>

      </q-toolbar>

      <AudioPlayer v-if="shouldLoadPlayer" />
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay

      :width="230"
      :breakpoint="500"
      bordered
      :content-class="`${!this.$q.dark.isActive && 'bg-grey-1'}`"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item
            clickable
            v-ripple
            exact
            :to="link.path"
            active-class="text-deep-purple text-weight-medium"
            v-for="(link, index) in links"
            :key="index"
            @click="miniState = true"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{link.title}}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            exact
            active-class="text-deep-purple text-weight-medium"
            @click="randomPlay"
          >
            <q-item-section avatar>
              <q-icon name="shuffle" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{$t('sidebar.randomPlay')}}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            exact
            active-class="text-deep-purple text-weight-medium"
            @click="showTimer = true"
          >
            <q-item-section avatar>
              <q-icon name="bedtime" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{$t('sidebar.sleepMode')}}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>


        <q-list>
          <q-item
            clickable
            v-ripple
            exact
            @click="$q.dark.toggle()"
            active-class="text-deep-purple text-weight-medium"
          >
            <q-item-section avatar>
              <q-icon :name="`${this.$q.dark.isActive ? 'wb_sunny' : 'nights_stay'}`" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{$t('sidebar.darkMode')}}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            exact
            to="/about"
            @click="miniState = true"
            active-class="text-deep-purple text-weight-medium"
          >
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{$t('sidebar.about')}}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            exact
            to="/settings"
            active-class="text-deep-purple text-weight-medium"
            @click="miniState = true"
          >
            <q-item-section avatar>
              <q-icon name="tune" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{$t('sidebar.settings')}}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            exact
            active-class="text-deep-purple text-weight-medium"
            @click="confirm = true"
            v-if="authEnabled"
          >
            <q-item-section avatar>
              <q-icon name="exit_to_app" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{$t('sidebar.logout')}}
              </q-item-label>
              <q-item-label caption lines="2">{{ userName }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="power_settings_new" color="primary" text-color="white" />
          <span class="q-ml-sm">{{$t('sidebar.doubleCheckLogout')}}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('sidebar.doubleCheckLogoutCancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('sidebar.doubleCheckLogoutConfirm')" color="primary" @click="logout()" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <SleepMode v-model="showTimer" />

    <q-page-container>
<!--       <q-page padding>-->
        <keep-alive include="Works">
          <router-view />
        </keep-alive>
<!--       </q-page>-->
        <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]" id="gotop">
          <q-btn fab icon="keyboard_arrow_up" color="accent" />
        </q-page-scroller>
    </q-page-container>

    <q-footer class="q-pa-none">
      <LyricsBar v-if="shouldLoadPlayer"/>
      <PlayerBar v-if="shouldLoadPlayer"/>
    </q-footer>
  </q-layout>
</template>

<script>
// import PlayerBar from 'components/PlayerBar'
// import AudioPlayer from 'components/AudioPlayer'
// import LyricsBar from 'components/LyricsBar'
import SleepMode from 'components/SleepMode'
import NotifyMixin from '../mixins/Notification.js'
import {mapMutations, mapState} from 'vuex'
import UpdateNotify from "src/mixins/UpdateNotify";

export default {
  name: 'MainLayout',

  mixins: [NotifyMixin, UpdateNotify],

  components: {
    PlayerBar: () => import('components/PlayerBar'),
    AudioPlayer: () => import('components/AudioPlayer'),
    LyricsBar: () => import('components/LyricsBar'),
    SleepMode
  },

  data () {
    return {
      keyword: '',
      drawerOpen: false,
      miniState: true,
      confirm: false,
      randId: null,
      showTimer: false,
    }
  },

  watch: {
    '$q.dark.isActive' (isActive) {
      this.$q.localStorage.set('dark', isActive)
    },
    keyword () {
      this.$router.push(this.keyword ? `/works?keyword=${this.keyword}` : `/works`)
    },

    randId () {
      this.$router.push(`/work/RJ${this.randId}`)
    },
  },

  mounted () {
    this.initUser();
    this.checkUpdate();
    this.loadSharedConfig();

    if (this.$q.localStorage.has('dark') && this.$q.localStorage.getItem('dark')) { this.$q.dark.set(true) }
  },

  computed: {
    links() {
      return [
        {
          title: this.$t('sidebar.library'),
          icon: 'widgets',
          path: '/'
        },
        {
          title: this.$t('sidebar.myFavourites'),
          icon: 'favorite',
          path: '/favourites'
        },
        {
          title: this.$t('sidebar.circles'),
          icon: 'group',
          path: '/circles'
        },
        {
          title: this.$t('sidebar.tags'),
          icon: 'label',
          path: '/tags'
        },
        {
          title: this.$t('sidebar.vas'),
          icon: 'mic',
          path: '/vas'
        },
      ]
    },
    isNotAtHomePage () {
      const path = this.$route.path
      return path && path !=='/' && path !=='/works' && path !== '/favourites';
    },

    ...mapState('User', {
      userName: 'name',
      authEnabled: 'auth'
    }),

    ...mapState('AudioPlayer', [
      'shouldLoadPlayer'
    ]),
  },

  methods: {
    ...mapMutations('AudioPlayer', [
      'SET_REWIND_SEEK_TIME',
      'SET_FORWARD_SEEK_TIME',
      'SET_QUALITY_BEHAVIOR'
    ]),
    initUser () {
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
              if (!path.startsWith('/login')) {
                this.$q.sessionStorage.set("redirect", path)
                this.$router.push('/login');
              }
            } else {
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
            }
          } else {
            this.showErrNotif(error.message || error)
          }
        })
    },

    checkUpdate () {
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
                { label: '查看', color: 'white', handler: () => {
                    Object.assign(document.createElement('a'), {
                      target: '_blank',
                      href: 'https://github.com/umonaca/kikoeru-express/releases',
                    }).click();
                  }
                }
              ],
            })
          }

          if (res.data.lockFileExists) {
            this.$q.notify ({
              message: res.data.lockReason,
              type: 'warning',
              timeout: 60000,
              actions: [
                { label: '以后提醒我', color: 'black' },
                { label: '前往扫描页', color: 'black', handler: () => this.$router.push('/admin/scanner')}
              ],
            })
          }
        })
        .catch((error) => {
          console.error(error);
        })
    },

    loadSharedConfig(){
      const sharedConfig = this.$q.localStorage.getItem('sharedConfig') || {
        'rewindSeekTime': 5,
        'forwardSeekTime': 30,
        'qualityBehavior': 'fluentFirst'
      };

      if (sharedConfig.rewindSeekTime) {this.SET_REWIND_SEEK_TIME(sharedConfig.rewindSeekTime)}
      if (sharedConfig.forwardSeekTime) {this.SET_FORWARD_SEEK_TIME(sharedConfig.forwardSeekTime)}
      if (sharedConfig.qualityBehavior) {this.SET_QUALITY_BEHAVIOR(sharedConfig.qualityBehavior)}
    },

    randomPlay() {
      this.requestRandomWork();
    },

    requestRandomWork () {
      const params = {
        order: 'betterRandom'
      }
      this.$axios.get('/api/works', { params })
        .then((response) => {
          const works = response.data.works
          this.randId = works.length ? works[0].id : null;
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status !== 401) {
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
            }
          } else {
            this.showErrNotif(error.message || error)
          }
        })
    },

    logout () {
      this.$q.localStorage.set('jwt-token', '')
      this.$router.push('/login')
    },

    back () {
      if (this.needBackToHome) {
        this.$router.push('/')
        this.needBackToHome = false
      } else {
        this.$router.back()
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 用户通过作品详情链接进入本站
      // 此时后退按钮会把用户指向网站外
      // 因此刚刚进入本站时，后退按钮应当指向网站首页，而不是 "上一页"
      if (vm.isNotAtHomePage) {
        vm.needBackToHome = true;
      }
    });
  },
}
</script>


<style lang="scss">
// 侧边栏底部按钮
  aside.q-drawer div.q-scrollarea > div.scroll > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
</style>
