<script>
import { coverURL } from 'src/utils/apiURL'
import { formatProductID } from 'src/utils/formatProductID'
import NotifyMixin from '../mixins/Notification.js'
import DarkMode from '../mixins/DarkMode'
import WriteReview from './WriteReview'

export default {
  name: 'FavListItem',

  components: {
    WriteReview,
  },

  mixins: [NotifyMixin, DarkMode],

  props: {
    workid: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: 'review',
    },
  },

  emits: ['reset'],

  data() {
    return {
      rating: 0,
      showReviewDialog: false,
      hideRating: false,
      progress: '',
    }
  },

  computed: {
    coverUrl() {
      return coverURL(this.metadata, 'thumb')
    },
    rjCode() {
      return formatProductID(this.metadata.id, 'RJ')
    },
  },

  watch: {
    // 需要watch metadata 当父component刷新metadata时更新
    metadata() {
      this.setMetadata()
    },
  },

  mounted() {
    // 可以用mounted因为初始化时metadata不为空
    this.setMetadata()
  },

  methods: {
    setMetadata() {
      if (this.metadata.userRating)
        this.rating = this.metadata.userRating
      else
        this.hideRating = true

      if (!this.rating)
        this.hideRating = true
      else
        this.hideRating = false

      this.progress = this.metadata.progress
    },

    processReview(modified) {
      if (modified) {
        this.calledFromChild = true
        this.$emit('reset')
      }
      this.showReviewDialog = false
    },

    setRating(newRating) {
      // 取消标星可能是操作失误，所以不响应。应使用删除标记来删除打星
      if (newRating) {
        const submitPayload = {
          user_name: this.$store.state.User.name, // 用户名不会被后端使用
          work_id: this.metadata.id,
          rating: newRating,
        }
        this.submitRating(submitPayload)
      }
    },

    submitRating(payload) {
      const params = {
        starOnly: true,
      }
      this.$axios.put('/api/review', payload, { params })
        .then((response) => {
          this.showSuccNotif(response.data.message)
        })
        .then(() => this.$emit('reset'))
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },

    setProgress(newProgress) {
      const submitPayload = {
        user_name: this.$store.state.User.name, // 用户名不会被后端使用
        work_id: this.metadata.id,
        progress: newProgress,
      }
      this.submitProgress(submitPayload)
    },

    submitProgress(payload) {
      const params = {
        starOnly: false,
        progressOnly: true,
      }
      this.$axios.put('/api/review', payload, { params })
        .then((response) => {
          this.showSuccNotif(response.data.message)
        })
        .then(() => this.$emit('reset'))
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },
  },

}
</script>

<template>
  <q-item clickable class="row" :class="classBackgroundColor">
    <q-item-section class="col-auto" top>
      <router-link :to="`/work/${rjCode}`">
        <q-img transition="fade" :src="coverUrl" style="height: 120px; width: 160px;" />
      </router-link>
    </q-item-section>

    <q-item-section class="q-gutter-y-xs column items-start" top @click.self="showReviewDialog = true">
      <q-item-label lines="2" class="text-body2">
        <router-link :to="`/work/${rjCode}`" class="col-auto" style="color: inherit">
          {{ metadata.title }}
        </router-link>
      </q-item-label>

      <div class="row q-gutter-x-sm col-auto">
        <router-link :to="`/works?circleId=${metadata.circle.id}`" class="col-auto text-grey">
          {{ metadata.circle.name }}
        </router-link>

        <span class="col-auto">/</span>
        <span class="col-auto text-grey"> {{ metadata.release }}</span>
        <span class="col-auto">/</span>

        <router-link
          v-for="(va, index) in metadata.vas" :key="index" :to="`/works?vaId=${va.id}`"
          class="col-auto text-primary"
        >
          {{ va.name }}
        </router-link>
      </div>

      <div class="row items-center q-gutter-x-xs">
        <q-rating
          v-if="!hideRating" v-model="rating" size="sm" color="blue" icon="star_border" icon-selected="star"
          icon-half="star_half" class="col-auto" @input="setRating"
        />
        <span class="col-auto text-grey ">{{ metadata.updated_at }}</span>
      </div>

      <q-item-label v-if="mode === 'review'" class="q-pt-sm">
        <q-card v-show="metadata.review_text" class="my-card col-auto" @click="showReviewDialog = true">
          <q-card-section class="q-pa-sm">
            {{ metadata.review_text }}
          </q-card-section>
        </q-card>
      </q-item-label>

      <q-item-label v-if="mode === 'progress'" class="q-pt-xs">
        <q-btn-toggle
          v-if="mode === 'progress'" v-model="progress" dense no-caps rounded toggle-color="primary"
          color="white" text-color="black" class="q-pa-sm" :options="[
            { label: $t('common.progressEnum.marked'), value: 'marked' },
            { label: $t('common.progressEnum.listening'), value: 'listening' },
            { label: $t('common.progressEnum.listened'), value: 'listened' },
            { label: $t('common.progressEnum.replay'), value: 'replay' },
            { label: $t('common.progressEnum.postponed'), value: 'postponed' },
          ]" @input="setProgress"
        />
      </q-item-label>
    </q-item-section>

    <WriteReview v-if="showReviewDialog" :workid="workid" :metadata="metadata" @closed="processReview" />
  </q-item>
</template>
