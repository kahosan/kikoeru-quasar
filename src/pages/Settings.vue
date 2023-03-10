<script>
import { mapState } from 'vuex'
import DarkMode from 'src/mixins/dark-mode'

export default {
  name: 'Settings',
  mixins: [DarkMode],
  data() {
    return {
      // forwardSeekTime: null,
      // rewindSeekTime: null,
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
  computed: {
    ...mapState('AudioPlayer', [
      'forwardSeekTime',
      'rewindSeekTime',
      'qualityBehavior',
    ]),
  },
  watch: {

  },
  mounted() {
    // this.forwardSeekTime = this.$store.state.AudioPlayer.forwardSeekTime
    // this.rewindSeekTime = this.$store.state.AudioPlayer.rewindSeekTime
  },
  methods: {
    setForwardSeekTime(val) {
      this.$store.commit('AudioPlayer/SET_FORWARD_SEEK_TIME', val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        forwardSeekTime: val,
      })
    },
    setRewindSeekTime(val) {
      this.$store.commit('AudioPlayer/SET_REWIND_SEEK_TIME', val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        rewindSeekTime: val,
      })
    },
    setQualityBehavior(val) {
      this.$store.commit('AudioPlayer/SET_QUALITY_BEHAVIOR', val)
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
            borderless dense
            :value="forwardSeekTime"
            :options="quickSeekOptions"
            :option-label="opt => opt.toString() + $t('settings.seconds')"
            @input="setForwardSeekTime"
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
            borderless dense
            :value="rewindSeekTime"
            :options="quickSeekOptions"
            :option-label="opt => opt.toString() + $t('settings.seconds')"
            @input="setRewindSeekTime"
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
            borderless dense
            :value="qualityBehavior"
            :options="['qualityFirst', 'fluentFirst']"
            :option-label="opt => $t(`settings.${opt}`)"
            @input="setQualityBehavior"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>

</style>
