import { defineStore } from 'pinia'

interface UserState {
  auth: boolean
  name: string
  group: string
  reg: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    auth: false,
    name: '',
    group: '',
    reg: false,
  }),
  getters: {
    // TODO
  },
  actions: {
    INIT(user: UserState) {
      this.name = user.name
      this.group = user.group
    },
    SET_AUTH(flag: boolean) {
      this.auth = flag
    },
    SET_REG(flag: boolean) {
      this.reg = flag
    },
  },
})
