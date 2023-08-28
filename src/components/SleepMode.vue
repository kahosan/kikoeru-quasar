<script>
import { mapActions, mapState } from 'pinia'
import { useAudioPlayerStore } from 'src/stores/audio-player'

export default {
  name: 'SleepMode',

  // v-model: showTimer from MainLayout
  props: ['value'],
  emits: ['input'],

  data() {
    return {
      // for q-time component only
      time: '00:00',
    }
  },

  computed: {
    ...mapState(useAudioPlayerStore, [
      'sleepTime',
      'sleepMode',
    ]),
  },

  watch: {
    // v-model: showTimer from MainLayout
    value(visible) {
      if (visible) {
        if (!this.sleepMode) {
          const currentTime = new Date()
          this.time = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`
        }
        else {
          this.time = this.sleepTime
        }
      }
    },
  },

  mounted() {
    try {
      if (this.$q.sessionStorage.getItem('sleepMode'))
        this.SET_SLEEP_TIMER(this.$q.sessionStorage.getItem('sleepTime'))
    }
    catch {
      console.info('Web Storage API error')
    }
  },

  methods: {
    ...mapActions(useAudioPlayerStore, [
      'SET_SLEEP_TIMER',
      'CLEAR_SLEEP_MODE',
    ]),

    setSleepTimer() {
      this.SET_SLEEP_TIMER(this.time)
      // Persist sleep timer
      try {
        this.$q.sessionStorage.set('sleepTime', this.time)
        this.$q.sessionStorage.set('sleepMode', true)
      }
      catch {
        console.info('Web Storage API error')
      }
      this.showSuccNotif(`将于${this.time}停止播放`)
    },

    clearSleepTimer() {
      this.CLEAR_SLEEP_MODE()
      try {
        this.$q.sessionStorage.set('sleepTime', null)
        this.$q.sessionStorage.set('sleepMode', false)
      }
      catch {
        console.info('Web Storage API error')
      }
      this.showSuccNotif('已关闭睡眠模式')
    },

    showSuccNotif(message) {
      this.$q.notify({
        message,
        color: 'primary',
        icon: 'bedtime',
        timeout: 5000,
      })
    },
  },
}
</script>

<template>
  <q-dialog :value="value" @input="$emit('input')">
    <q-card>
      <div class="q-pa-sm">
        <q-time
          v-model="time"
          now-btn
        />
      </div>

      <div class="row justify-between">
        <q-card-actions>
          <q-btn v-close-popup flat label="取消定时" color="primary" :disable="!sleepMode" @click="clearSleepTimer" />
        </q-card-actions>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="取消" color="primary" />
          <q-btn v-close-popup flat label="确定" color="primary" @click="setSleepTimer" />
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>
