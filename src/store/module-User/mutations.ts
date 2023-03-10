const mutations = {
  INIT(state: any, user: any) {
    state.name = user.name
    state.group = user.group
  },

  SET_AUTH(state: any, flag: any) {
    state.auth = flag
  },

  SET_REG(state: any, flag: any) {
    state.reg = flag
  },
}

export default mutations
