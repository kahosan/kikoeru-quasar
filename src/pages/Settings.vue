<script>
import DarkMode from 'src/mixins/dark-mode'
import { useAudioPlayerStore } from 'src/stores/audio-player'
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'Settings',
  mixins: [DarkMode],

  setup() {
    const store = useAudioPlayerStore()
    const $q = useQuasar()

    const forwardSeekTime = ref(30)
    const rewindSeekTime = ref(5)
    const qualityBehavior = ref('qualityFirst')

    onMounted(() => {
      const storedConfig = $q.localStorage.getItem('sharedConfig')
      if (storedConfig) {
        forwardSeekTime.value = storedConfig.forwardSeekTime
        rewindSeekTime.value = storedConfig.rewindSeekTime
        qualityBehavior.value = storedConfig.qualityBehavior

        store.SET_FORWARD_SEEK_TIME(storedConfig.forwardSeekTime)
        store.SET_REWIND_SEEK_TIME(storedConfig.rewindSeekTime)
        store.SET_QUALITY_BEHAVIOR(storedConfig.qualityBehavior)
      }
    })

    return {
      audioPlayerStore: useAudioPlayerStore(),
      forwardSeekTime,
      rewindSeekTime,
      qualityBehavior,
      quickSeekOptions: [5, 10, 15, 30],
    }
  },
  head() {
    return {
      title: 'Settings - ASMR Online',
      meta: [
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  watch: {
    forwardSeekTime(val) {
      this.setForwardSeekTime(val)
    },
    rewindSeekTime(val) {
      this.setRewindSeekTime(val)
    },
    qualityBehavior(val) {
      this.setQualityBehavior(val)
    },
  },
  methods: {
    setForwardSeekTime(val) {
      this.audioPlayerStore.SET_FORWARD_SEEK_TIME(val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        forwardSeekTime: val,
      })
    },
    setRewindSeekTime(val) {
      this.audioPlayerStore.SET_REWIND_SEEK_TIME(val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        rewindSeekTime: val,
      })
    },
    setQualityBehavior(val) {
      this.audioPlayerStore.SET_QUALITY_BEHAVIOR(val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        qualityBehavior: val,
      })
    },
  },
}
</script>

<template>
  <div class="q-pa-md q-gutter-md flex-center" style="max-width: 700px; margin: auto;">
    <span class="text-weight-medium text-center q-mt-lg">{{ $t('settings.playerSettings') }}</span>
    <q-list bordered class="rounded-borders" :class="classBackgroundColor">
      <q-item v-ripple class="q-py-sm" clickable>
        <q-item-section avatar>
          <q-icon name="fast_forward" size="28px" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <span class="text-weight-medium">{{ $t('settings.forwardSeekTime') }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-select
            v-model="forwardSeekTime"
            borderless
            dense
            :options="quickSeekOptions"
            :option-label="opt => opt.toString() + $t('settings.seconds')"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item v-ripple class="q-py-sm" clickable>
        <q-item-section avatar>
          <q-icon name="fast_rewind" size="28px" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <span class="text-weight-medium">{{ $t('settings.rewindSeekTime') }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-select
            v-model="rewindSeekTime"
            borderless
            dense
            :options="quickSeekOptions"
            :option-label="opt => opt.toString() + $t('settings.seconds')"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item v-ripple class="q-py-sm" clickable>
        <q-item-section avatar>
          <q-icon name="cast" size="28px" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <span class="text-weight-medium">{{ $t('settings.quality') }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-select
            v-model="qualityBehavior"
            borderless dense
            :options="['qualityFirst', 'fluentFirst']"
            :option-label="opt => $t(`settings.${opt}`)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
