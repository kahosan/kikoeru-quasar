<script>
import { mapState } from 'pinia'
import { coverURL } from 'src/utils/url'
import { useAudioPlayerStore } from 'src/stores/audio-player'
import DarkMode from '../mixins/dark-mode'

export default {
  name: 'PlayerBar',

  mixins: [DarkMode],

  setup() {
    return {
      audioPlayerStore: useAudioPlayerStore(),
    }
  },

  computed: {
    samCoverUrl() {
      return coverURL(this.currentPlayingFile, 'sam')
    },

    playingIcon() {
      return this.playing ? 'pause' : 'play_arrow'
    },

    ...mapState(useAudioPlayerStore, [
      'hide',
      'playing',
      'currentPlayingFile',
    ]),
  },

  methods: {
    showPlayer() {
      this.audioPlayerStore.PLAYER_SHOW()
    },

    togglePlaying() {
      this.audioPlayerStore.TOGGLE_WANT_PLAYING()
    },

    nextTrack() {
      this.audioPlayerStore.NEXT_TRACK()
    },

    previousTrack() {
      this.audioPlayerStore.PREVIOUS_TRACK()
    },
  },
}
</script>

<template>
  <q-slide-transition class="bordered elevated">
    <div v-show="currentPlayingFile.hash && hide" class="row text-black" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
      <q-item v-ripple clickable style="padding: 0px 5px;" class="col non-selectable" @click="showPlayer()">
        <q-item-section avatar>
          <q-img transition="fade" :src="samCoverUrl" style="height: 50px; width: 50px" class="rounded-borders" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="2">
            {{ currentPlayingFile.title }}
          </q-item-label>
          <q-item-label caption lines="1">
            {{ currentPlayingFile.workTitle }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-btn flat size="lg" icon="skip_previous" :text-color="textColor" style="height: 60px; width: 60px" class="col-auto gt-sm" @click="previousTrack()" />
      <q-btn flat size="lg" :icon="playingIcon" :text-color="textColor" style="height: 60px; width: 60px" class="col-auto" @click="togglePlaying()" />
      <q-btn flat size="lg" icon="skip_next" :text-color="textColor" style="height: 60px; width: 60px" class="col-auto gt-sm" @click="nextTrack()" />
    </div>
  </q-slide-transition>
</template>
