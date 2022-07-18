<template>
  <div class="q-pa-md q-gutter-md flex-center" style="max-width: 700px; margin: auto;">
    <span class="text-weight-medium text-center q-mt-lg">{{$t('settings.playerSettings')}}</span>
    <q-list bordered class="rounded-borders" :class="classBackgroundColor" >

      <q-item class="q-py-sm" clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="fast_forward" size="28px"></q-icon>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <span class="text-weight-medium">{{$t('settings.forwardSeekTime')}}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-select
            borderless dense
            @input="setForwardSeekTime"
            :value="forwardSeekTime"
            :options="quickSeekOptions"
            :option-label="opt => opt.toString() + $t('settings.seconds')"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item class="q-py-sm" clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="fast_rewind" size="28px"></q-icon>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <span class="text-weight-medium">{{$t('settings.rewindSeekTime')}}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-select
            borderless dense
            @input="setRewindSeekTime"
            :value="rewindSeekTime"
            :options="quickSeekOptions"
            :option-label="opt => opt.toString() + $t('settings.seconds')"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item class="q-py-sm" clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="cast" size="28px"></q-icon>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <span class="text-weight-medium">{{$t('settings.quality')}}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-select
            borderless dense
            @input="setQualityBehavior"
            :value="qualityBehavior"
            :options="['qualityFirst', 'fluentFirst']"
            :option-label="opt => $t(`settings.${opt}`)"
          />
        </q-item-section>
      </q-item>

    </q-list>

  </div>
</template>

<script>

import {mapState} from "vuex";
import DarkMode from "src/mixins/DarkMode";

export default {
  name: "Settings",
  mixins: [DarkMode],
  metaInfo: {
    title: "Settings - ASMR Online",
    meta: [
      {name: "robots", content: "noindex"},
    ]
  },
  data () {
    return {
      // forwardSeekTime: null,
      // rewindSeekTime: null,
      quickSeekOptions: [5, 10, 15, 30],
    }
  },
  computed: {
    ...mapState('AudioPlayer', [
      'forwardSeekTime',
      'rewindSeekTime',
      'qualityBehavior',
    ])
  },
  methods: {
    setForwardSeekTime: function (val) {
      this.$store.commit('AudioPlayer/SET_FORWARD_SEEK_TIME', val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        forwardSeekTime: val,
      })
    },
    setRewindSeekTime: function (val) {
      this.$store.commit('AudioPlayer/SET_REWIND_SEEK_TIME', val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        rewindSeekTime: val,
      })
    },
    setQualityBehavior: function (val) {
      this.$store.commit('AudioPlayer/SET_QUALITY_BEHAVIOR', val)
      this.$q.localStorage.set('sharedConfig', {
        ...this.$q.localStorage.getItem('sharedConfig') || {},
        qualityBehavior: val,
      })
    },
  },
  watch: {

  },
  mounted() {
    // this.forwardSeekTime = this.$store.state.AudioPlayer.forwardSeekTime
    // this.rewindSeekTime = this.$store.state.AudioPlayer.rewindSeekTime
  },
}
</script>

<style scoped>

</style>
