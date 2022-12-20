<script>
import { formatProductID } from 'src/utils/formatProductID'

export default {
  name: 'CoverSFW',

  props: {
    coverUrl: {
      type: String,
      required: true,
    },

    workid: {
      type: Number,
      required: true,
    },

    nsfw: {
      type: Boolean,
      default: true,
    },

    release: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      blurFlag: true,
    }
  },

  computed: {
    // coverUrl () {
    //   return coverURL(this.workid);
    // },

    rjCode() {
      return formatProductID(this.workid, 'RJ')
    },

    imgClass() {
      if (this.$q.platform.is.mobile) {
        // 在移动设备上图片直接显示
        return ''
      }
      else {
        if (!this.nsfw) {
          // 在PC上SFW的图片直接显示
          return ''
        }
        else {
          // 在PC上NSFW的图片鼠标悬停显示
          return this.blurFlag ? 'blur-image' : ''
        }
      }
    },
  },

  methods: {
    toggleBlurFlag() {
      this.blurFlag = !this.blurFlag
    },
  },
}
</script>

<template>
  <router-link :to="`/work/${rjCode}`">
    <q-img
      :src="coverUrl" :ratio="4 / 3" :img-class="imgClass" style="max-width: 560px;" transition="fade"
      native-context-menu @mouseover="toggleBlurFlag()" @mouseout="toggleBlurFlag()"
    >
      <div class="absolute-top-left transparent" style="padding: 0;">
        <q-chip dense square color="brown" text-color="white" class="q-ma-sm">
          {{ rjCode }}
        </q-chip>
      </div>

      <div v-if="release" class="absolute-bottom-right" style="padding: 5px;">
        {{ release }}
      </div>
    </q-img>
  </router-link>
</template>

<style lang="scss">
.blur-image {
  filter: blur(10px);
}
</style>
