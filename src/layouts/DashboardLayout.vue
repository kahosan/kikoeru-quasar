<script>
import DarkMode from 'src/mixins/DarkMode'
import NotifyMixin from '../mixins/Notification.js'

export default {
  name: 'DashboardLayout',

  mixins: [DarkMode, NotifyMixin],

  data() {
    return {
      drawer: false,
      miniState: true,
      links: [
        {
          title: '音声库',
          icon: 'folder',
          path: '/asmr/admin',
        },
        {
          title: '扫描',
          icon: 'youtube_searched_for',
          path: '/asmr/admin/scanner',
        },
        {
          title: '用户管理',
          icon: 'person',
          path: '/asmr/admin/usermanage',
        },
        {
          title: '高级设置',
          icon: 'settings',
          path: '/asmr/admin/advanced',
        },

        {
          title: '回到主页',
          icon: 'home',
          path: '/asmr',
        },
      ],
    }
  },
  sockets: {
    success(payload) {
      this.showSuccNotif(payload.message)
      if (payload.auth) {
        this.$store.commit('User/INIT', payload.user)
        this.$store.commit('User/SET_AUTH', payload.auth)
      }
    },
    error(err) {
      this.showWarnNotif(err.message || err)
      this.$socket.close()
      // 验证失败，跳转到登录页面
      this.$router.push('/login')
    },
  },

  created() {
    // 从 LocalStorage 中读取 token
    const token = this.$q.localStorage.getItem('jwt-token') || ''
    this.$socket.io.opts.query.auth_token = token

    if (!this.$socket.connected)
      this.$socket.open()
  },
}
</script>

<template>
  <q-layout view="hhh LpR fFf">
    <q-header elevated :class="classBackgroundColor">
      <q-toolbar>
        <q-btn flat round dense icon="menu" :class="classTextColor" @click="drawer = !drawer" />
        <q-toolbar-title :class="classTextColor">
          仪表盘
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer" show-if-above :mini="miniState" mini-to-overlay
      :width="200" :breakpoint="500" bordered content-class="bg-grey-3" @mouseover="miniState = false" @mouseout="miniState = true"
    >
      <div class="column justify-between fit" :class="classBackgroundColor">
        <q-list padding class="col-auto">
          <q-item
            v-for="(link, index) in links" :key="index" v-ripple clickable exact
            :to="link.path" active-class="text-primary text-weight-bold" class="col text-subtitle1"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>

            <q-item-section>
              {{ link.title }}
            </q-item-section>
          </q-item>
          <q-item v-ripple clickable exact active-class="text-deep-purple text-weight-medium" @click="$q.dark.toggle">
            <q-item-section avatar>
              <q-icon :name="`${$q.dark.isActive ? 'wb_sunny' : 'nights_stay'}`" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                {{ $t('sidebar.darkMode') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
</style>
