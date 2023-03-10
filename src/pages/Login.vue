<script>
import { setAxiosHeaders } from 'boot/axios'
import NotifyMixin from '../mixins/notification'

export default {
  mixins: [NotifyMixin],

  data() {
    return {
      name: '',
      password: '',
      passwordConfirm: '',
      // false: login form
      showRegisterForm: false,
    }
  },
  mounted() {
    this.checkRegEnable()
  },
  methods: {
    navigateToRegister() {
      this.showRegisterForm = true
    },
    navigateBack() {
      this.showRegisterForm = false
    },
    onSubmit() {
      if (this.showRegisterForm)
        this.reg()
      else
        this.login()
    },
    checkRegEnable() {
      this.$axios.get('/api/auth/reg')
        .then((res) => {
          this.$store.commit('User/SET_REG', res.data.reg)
        })
    },
    login() {
      const response = this.$axios.post('/api/auth/me', {
        name: this.name,
        password: this.password,
      })
      this.handleResponse(response, 'login')
    },
    guestLogin() {
      const response = this.$axios.post('/api/auth/me', {
        name: 'guest',
        password: 'guest',
      })
      this.handleResponse(response, 'login')
    },
    reg() {
      const response = this.$axios.post('/api/auth/reg', {
        name: this.name,
        password: this.password,
      })
      this.handleResponse(response, 'reg')
    },
    handleResponse(response, type) {
      response.then((res) => {
        try {
          this.$q.localStorage.set('jwt-token', res.data.token)
          setAxiosHeaders(res.data.token)
          this.showSuccNotif(type === 'reg' ? this.$t('login.registerSuccess') : this.$t('login.loginSuccess'))

          this.$router.replace(this.$route.from || '/')
        }
        catch (error) {
          // 由于Web Storage API错误，
          // 数据未成功保存
          this.showErrNotif(error.message)
        }
      })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status === 401)
              this.showWarnNotif(error.response.data.error)
            else
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },
  },
}
</script>

<template>
  <q-form style="width: 260px;" class="absolute-center q-gutter-md" @submit="onSubmit">
    <q-input
      v-model="name" filled :label="$t('login.username')" class="fit"
      lazy-rules
      :rules="[val => val && val.length >= 5 || $t('login.usernameLengthNotEnough', [5])]"
    />

    <q-input
      v-model="password" filled type="password" :label="$t('login.password')" class="fit"
      lazy-rules
      :rules="[val => val && val.length >= 5 || $t('login.passwordLengthNotEnough', [5])]"
      clearable
    />

    <!-- 仅在注册界面出现 -->
    <q-input
      v-if="showRegisterForm" v-model="passwordConfirm" filled type="password" :label="$t('login.repeatPassword')"
      class="fit"
      lazy-rules
      bottom-slots
      :rules="[val => val && val === password || $t('login.repeatPasswordNotMatch')]"
      clearable
    />

    <!-- 入口界面按钮 -->
    <q-btn v-if="!showRegisterForm" :label="$t('login.login')" type="submit" color="primary" class="fit" />
    <div class="row fit no-wrap justify-between">
      <q-btn v-if="!showRegisterForm" :label="$t('login.guestLogin')" flat dense color="accent" style="max-width: 5em" @click="guestLogin" />
      <q-btn v-if="$store.state.User.reg && !showRegisterForm" :label="$t('login.register')" flat dense color="secondary" style="max-width: 5em" @click="navigateToRegister" />
    </div>

    <!-- 注册界面按钮 -->
    <q-btn v-if="showRegisterForm" :label="$t('login.postRegister')" type="submit" color="primary" class="fit" />
    <q-btn v-if="showRegisterForm" :label="$t('login.backToLogin')" flat dense color="secondary" @click="navigateBack" />
  </q-form>
</template>
