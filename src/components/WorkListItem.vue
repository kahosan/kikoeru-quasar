<script>
// import WorkDetails from 'components/WorkDetails'
// import CoverSFW from 'components/CoverSFW'
import TagI18N from 'src/mixins/tag-i18n'

import { coverURL } from 'src/utils/url'
import { formatProductID } from 'src/utils/format-id'
import DarkMode from '../mixins/dark-mode'

export default {
  name: 'WorkListItem',

  mixins: [DarkMode, TagI18N],

  props: {
    metadata: {
      type: Object,
      required: true,
    },
    showLabel: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    samCoverUrl() {
      return coverURL(this.metadata, 'sam')
    },
    rjCode() {
      return formatProductID(this.metadata.id, 'RJ')
    },
  },
}
</script>

<template>
  <q-item clickable :to="`/work/${rjCode}`" :class="classBackgroundColor" style="padding: 5px;">
    <q-item-section avatar style="padding: 0px 5px 0px 0px;">
      <router-link :to="`/work/${rjCode}`">
        <q-img transition="fade" :src="$q.localStorage.getItem('NO_PIC_MODE') ? '' : samCoverUrl" style="height: 60px; width: 60px;" />
      </router-link>
    </q-item-section>

    <q-item-section>
      <q-item-label lines="2" class="text">
        <router-link :to="`/work/${rjCode}`" style="color: inherit">
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
            v-for="(va, index) in metadata.vas" :key="index" :to="`/works?vaId=${va.id}`"
            class="col-auto text-primary"
          >
            {{ va.name }}
          </router-link>
        </div>
      </q-item-label>

      <q-item-label v-if="showLabel && $q.screen.width > 700">
        <div class="row q-gutter-x-sm q-gutter-y-xs">
          <router-link
            v-for="(tag, index) in metadata.tags" :key="index" :to="`/works?tagId=${tag.id}`"
            class="col-auto text-grey"
          >
            {{ getLocaleTagName(tag) }}
          </router-link>
        </div>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>
