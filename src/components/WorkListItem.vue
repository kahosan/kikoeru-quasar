<template>
  <q-item clickable :to="`/work/RJ${metadata.id}`" :class="classBackgroundColor" style="padding: 5px;">
    <q-item-section avatar style="padding: 0px 5px 0px 0px;">
      <router-link :to="`/work/RJ${metadata.id}`">
        <q-img transition="fade" :src="samCoverUrl" style="height: 60px; width: 60px;" />
      </router-link>
    </q-item-section>

    <q-item-section>
      <q-item-label lines="2" class="text">
        <router-link :to="`/work/RJ${metadata.id}`" style="color: inherit">
          {{ metadata.title }}
        </router-link>
      </q-item-label>

      <q-item-label>
        <div class="row q-gutter-x-sm q-gutter-y-xs">
          <router-link :to="`/works?circleId=${metadata.circle.id}`" class="col-auto text-grey">
            {{ metadata.circle.name }}
          </router-link>

          <span class="col-auto">/</span>

          <router-link
            v-for="(va, index) in metadata.vas"
            :to="`/works?vaId=${va.id}`"
            :key=index
            class="col-auto text-primary"
          >
            {{ va.name }}
          </router-link>
        </div>
      </q-item-label>

      <q-item-label v-if="showLabel && $q.screen.width> 700">
        <div class="row q-gutter-x-sm q-gutter-y-xs">
          <router-link
            v-for="(tag, index) in metadata.tags"
            :to="`/works?tagId=${tag.id}`"
            :key=index
            class="col-auto text-grey"
          >
            {{ tag.name }}
          </router-link>
        </div>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
// import WorkDetails from 'components/WorkDetails'
// import CoverSFW from 'components/CoverSFW'

import {coverURL} from "src/utils/apiURL";
import DarkMode from '../mixins/DarkMode';

export default {
  name: 'WorkListItem',

  mixins: [DarkMode],

  props: {
    metadata: {
      type: Object,
      required: true
    },
    showLabel: {
      type: Boolean,
      default: true
    },
  },

  computed: {
    samCoverUrl () {
      return coverURL(this.metadata, 'sam')
    },
  }
}
</script>
