import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    showSuccNotif(message: string) {
      this.$q.notify({
        message,
        color: 'positive',
        icon: 'done',
        timeout: 500,
      })
    },

    showWarnNotif(message: string) {
      this.$q.notify({
        message,
        color: 'warning',
        icon: 'warning',
      })
    },

    showErrNotif(message: string) {
      this.$q.notify({
        message,
        color: 'negative',
        icon: 'bug_report',
      })
    },
  },
})
