<script>
import CoverSFW from 'components/CoverSFW'
import TagI18N from 'src/mixins/tag-i18n'
import { coverURL } from 'src/utils/url'
import WorkFeedback from 'components/WorkFeedback'
import { formatProductID } from 'src/utils/format-id'
import { useAudioPlayerStore } from 'src/stores/audio-player'
import { useUserStore } from 'src/stores/user'
import DarkMode from '../mixins/dark-mode'
import NotifyMixin from '../mixins/notification'
import WriteReview from './WriteReview'

export default {
  name: 'WorkDetails',

  components: {
    CoverSFW,
    WriteReview,
    WorkFeedback,
  },

  mixins: [NotifyMixin, DarkMode, TagI18N],

  props: {
    metadata: {
      type: Object,
      required: true,
    },
  },

  emits: ['reset'],

  setup() {
    return {
      audioPlayerStore: useAudioPlayerStore(),
      userStore: useUserStore(),
    }
  },

  data() {
    return {
      rating: 0,
      userMarked: false,
      progress: '',
      showReviewDialog: false,
      showFeedbackDialog: false,
      showTags: true,
    }
  },

  computed: {
    sortedRatings() {
      function compare(a, b) {
        return (a.review_point > b.review_point) ? -1 : 1
      }
      return this.metadata.rate_count_detail.slice().sort(compare)
    },
    coverUrl() {
      return coverURL(this.metadata, 'main')
    },
    rjCode() {
      return `RJ${(`000000${this.metadata.id}`).slice(-6)}`
    },
  },

  watch: {
    // 需要用watch因为父component pages/work.vue是先用空值初始化的
    metadata(newMetaData) {
      if (newMetaData.userRating) {
        this.userMarked = true
        this.rating = newMetaData.userRating
      }
      else {
        this.userMarked = false
        this.rating = newMetaData.rate_average_2dp || 0
      }
      this.progress = newMetaData.progress

      // 极个别作品没有标签
      if (newMetaData.tags && newMetaData.tags[0].name === null)
        this.showTags = false
    },
  },
  mounted() {
    // 进入本页时提前加载 Player，否则 ios 会因为 autoplay 限制无法播放
    this.audioPlayerStore.LOAD_PLAYER()
  },

  methods: {
    formatProductID,
    setProgress(newProgress) {
      this.progress = newProgress
      const submitPayload = {
        user_name: this.userStore.name, // 用户名不会被后端使用
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
          this.$emit('reset')
        })
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

    setRating(newRating) {
      const submitPayload = {
        user_name: this.userStore.name, // 用户名不会被后端使用
        work_id: this.metadata.id,
        rating: newRating,
      }
      this.submitRating(submitPayload)
    },

    submitRating(payload) {
      this.$axios.put('/api/review', payload)
        .then((response) => {
          this.showSuccNotif(response.data.message)
          this.$emit('reset')
        })
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

    processReview() {
      this.showReviewDialog = false
    },
  },
}
</script>

<template>
  <div>
    <router-link :to="`/work/${rjCode}`">
      <CoverSFW :cover-url="coverUrl" :workid="metadata.id" :nsfw="false" :release="metadata.release" />
    </router-link>

    <div class="q-pa-sm">
      <div class="q-px-sm q-py-none">
        <!-- 标题 -->
        <div class="text-h6 text-weight-regular" :class="classTextColor">
          <!--          <router-link :to="`/work/${rjCode}`" :class="classTextColor"> -->
          {{ metadata.title }}
          <!--          </router-link> -->
        </div>

        <!-- 社团名 -->
        <div class="text-subtitle1 text-weight-regular">
          <router-link :to="`/works?circleId=${metadata.circle.id}`" class="text-grey">
            {{ metadata.circle.name }}
          </router-link>
        </div>

        <!-- 评价&评论 -->
        <div class="row items-center q-gutter-xs">
          <!-- 评价 -->
          <div class="col-auto">
            <q-rating
              v-model="rating" name="rating" size="sm" :color="userMarked ? 'blue' : 'amber'" icon="star_border"
              icon-selected="star" icon-half="star_half" @input="setRating"
            />

            <!-- 评价分布明细 -->
            <q-tooltip v-if="metadata.rate_count_detail" content-class="text-subtitle1">
              <div>平均: {{ metadata.rate_average_2dp }}</div>
              <div v-for="(rate, index) in sortedRatings" :key="index" class="row items-center">
                <div class="col">
                  {{ rate.review_point }}星
                </div>

                <!-- 评价占比 -->
                <q-linear-progress
                  :value="rate.ratio / 100" color="amber" track-color="white"
                  style="height: 15px; width: 100px" class="col-auto"
                />

                <div class="col q-mx-sm">
                  ({{ rate.count }})
                </div>
              </div>
            </q-tooltip>
          </div>

          <div class="col-auto">
            <span class="text-weight-medium text-body1 text-red">{{ metadata.rate_average_2dp }}</span> <span
              class="text-grey"
            > ({{ metadata.rate_count }})</span>
          </div>

          <!-- 评论数量 -->
          <div class="col-auto q-px-sm">
            <q-icon name="chat" size="xs" /> <span class="text-grey"> ({{ metadata.review_count }})</span>
          </div>

          <!-- DLsite链接 -->
          <div class="col-auto">
            <q-icon name="launch" size="xs" /><a
              class="text-blue"
              :href="`https://www.dlsite.com/home/work/=/product_id/${formatProductID(metadata.id, 'RJ')}.html`"
              rel="noreferrer noopener" target="_blank"
            >DLsite</a>
          </div>
        </div>
      </div>

      <!-- 价格&售出数 -->
      <div class="q-pt-sm q-pb-none">
        <span class="q-mx-sm text-weight-medium text-h6 text-red">{{ metadata.price }} JPY</span> {{
          $t('workDetail.sales') }}: {{ metadata.dl_count }}

        <div class="inline-block">
          <q-chip
            v-if="!metadata.nsfw === undefined && !metadata.nsfw" dense outline square class="text-green"
            style="margin-top: 2px"
          >
            {{ $t('common.sfw') }}
          </q-chip>
          <q-chip
            v-if="metadata.has_subtitle && $i18n.locale === 'zh-CN'" dense outline square class="text-light-blue"
            style="margin-top: 2px;"
          >
            {{ $t('common.translated') }}
          </q-chip>
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="showTags" class="q-px-none q-py-sm">
        <router-link v-for="(tag, index) in metadata.tags" :key="index" :to="`/works?tagId=${tag.id}`">
          <q-chip size="md" :class="$q.dark.isActive ? 'bg-grey-9' : 'shadow-4'">
            {{ getLocaleTagName(tag) }}
          </q-chip>
        </router-link>
      </div>

      <!-- 声优 -->
      <div class="q-px-none q-pt-sm q-py-sm">
        <router-link v-for="(va, index) in metadata.vas" :key="index" :to="`/works?vaId=${va.id}`">
          <q-chip square size="md" :class="!$q.dark.isActive ? 'shadow-4' : ''" color="teal" text-color="white">
            {{ va.name }}
          </q-chip>
        </router-link>
      </div>

      <q-btn-dropdown dense class="'q-mt-sm' q-mx-xs q-pl-sm" :class="!$q.dark.isActive ? 'shadow-4' : ''" color="cyan" :label="$t('workDetail.progress')">
        <q-list>
          <q-item clickable class="q-pa-xs" @click="setProgress('marked')">
            <q-item-section avatar>
              <q-avatar v-show="progress === 'marked'" icon="headset" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('common.progressEnum.marked') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable class="q-pa-xs" @click="setProgress('listening')">
            <q-item-section avatar>
              <q-avatar v-show="progress === 'listening'" icon="headset" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('common.progressEnum.listening') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable class="q-pa-xs" @click="setProgress('listened')">
            <q-item-section avatar>
              <q-avatar v-show="progress === 'listened'" icon="headset" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('common.progressEnum.listened') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable class="q-pa-xs" @click="setProgress('replay')">
            <q-item-section avatar>
              <q-avatar v-show="progress === 'replay'" icon="headset" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('common.progressEnum.replay') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable class="q-pa-xs" @click="setProgress('postponed')">
            <q-item-section avatar>
              <q-avatar v-show="progress === 'postponed'" icon="headset" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('common.progressEnum.postponed') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn
        dense color="cyan" class="q-mt-sm q-mx-xs q-px-sm" :class="!$q.dark.isActive ? 'shadow-4' : ''" :label="$t('workDetail.writeReview')"
        @click="showReviewDialog = true"
      />
      <WriteReview v-if="showReviewDialog" :workid="metadata.id" :metadata="metadata" @closed="processReview" />

      <q-btn
        dense color="grey-8" class="q-mt-sm q-mx-xs q-px-sm" :class="!$q.dark.isActive ? 'shadow-4' : ''" :label="$t('feedback.title')"
        icon="report_gmailerrorred" @click="showFeedbackDialog = true"
      />
      <WorkFeedback v-model="showFeedbackDialog" :workid="metadata.id" :metadata="metadata" value="" />
    </div>
  </div>
</template>
