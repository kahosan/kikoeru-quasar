<script>
import { useUserStore } from 'src/stores/user'
import NotifyMixin from '../mixins/notification'

export default {
  name: 'WriteReview',

  mixins: [NotifyMixin],

  props: {
    workid: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Object,
      default: null,
    },
  },

  emits: ['closed'],

  setup() {
    return {
      userStore: useUserStore(),
    }
  },

  data() {
    return {
      showReviewDialog: true,
      deleteConfirm: false,
      rating: 0,
      reviewText: '',
      modified: false,
      progress: '',
    }
  },

  mounted() {
    if (this.metadata.userRating)
      this.rating = this.metadata.userRating

    this.progress = this.metadata.progress
    this.reviewText = this.metadata.review_text
  },

  methods: {
    closeDialog() {
      // Do not emit anything if the second dialog is shown
      // If the user clicks anywhere outside of the main dialog, emit 'closed'
      if (!this.deleteConfirm) {
        if (this.modified)
          this.$emit('closed', true)
        else
          this.$emit('closed', false)
      }
    },

    reviewPayload() {
      const submitPayload = {
        user_name: this.userStore.name, // 用户名不会被后端使用
        work_id: this.workid,
        rating: this.rating,
        review_text: this.reviewText,
        progress: this.progress,
      }
      return submitPayload
    },

    submitReview() {
      const params = {
        starOnly: false,
      }
      const payload = this.reviewPayload()
      this.$axios.put('/api/review', payload, { params })
        .then((response) => {
          this.modified = true
          // TODO 修复callback graph
          this.showSuccNotif(response.data.message)
        })
        .then(() => this.closeDialog())
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

    deleteReview() {
      const params = {
        work_id: this.workid,
      }
      this.$axios.delete('/api/review', { params })
        .then((response) => {
          this.modified = true
          this.showSuccNotif(response.data.message)
        })
        .then(() => this.closeDialog())
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
  <div>
    <q-dialog v-model="showReviewDialog" @hide="closeDialog">
      <q-card>
        <q-card-section class="q-pb-sm">
          <div class="text-body1">
            {{ $t('writeReview.myReview') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-rating
            v-model="rating"
            size="sm"
            color="blue"
            icon="star_border"
            icon-selected="star"
            icon-half="star_half"
            class="col-auto"
          />
          <q-btn-toggle
            v-model="progress"
            no-caps
            :class="$q.screen.lt.sm ? 'my-custom-toggle q-mx-none q-mt-sm' : 'my-custom-toggle q-mx-md'"
            rounded
            unelevated
            :padding="$q.screen.width < 400 ? 'sm' : ''"
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              { label: $t('common.progressEnum.marked'), value: 'marked' },
              { label: $t('common.progressEnum.listening'), value: 'listening' },
              { label: $t('common.progressEnum.listened'), value: 'listened' },
              { label: $t('common.progressEnum.replay'), value: 'replay' },
              { label: $t('common.progressEnum.postponed'), value: 'postponed' },
            ]"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div style="min-width: 300px">
            <q-input
              v-model="reviewText"
              filled
              type="textarea"
            />
          </div>
        </q-card-section>

        <div class="row justify-between">
          <q-card-actions class="text-red">
            <q-btn v-close-popup flat :label="$t('writeReview.deleteMarker')" @click="deleteConfirm = true" />
          </q-card-actions>

          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat :label="$t('writeReview.submitReview')" @click="submitReview()" />
            <q-btn v-close-popup flat :label="$t('writeReview.closeReview')" @click="closeDialog()" />
          </q-card-actions>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteConfirm" persistent transition-show="scale" transition-hide="scale">
      <q-card class="bg-teal text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">
            {{ $t('writeReview.secondConfirmDeleteMarker') }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn v-close-popup flat :label="$t('writeReview.secondConfirmYes')" @click="deleteReview()" />
          <q-btn v-close-popup flat :label="$t('writeReview.secondConfirmNo')" @click="closeDialog()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="sass" scoped>
.my-custom-toggle
  border: 1px solid #027be3
</style>
