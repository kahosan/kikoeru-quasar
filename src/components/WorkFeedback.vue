<script>
import NotifyMixin from '../mixins/Notification.js'

export default {
  name: 'WorkFeedback',

  mixins: [NotifyMixin],

  props: {
    value: {
      type: Boolean,
      required: true,
    },
    workid: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Object,
      default: null,
    },
  },

  emits: ['input'],

  data() {
    return {
      showFeedbackDialog: true,
      feedbackCategory: '',
      describeDetails: '',
    }
  },

  methods: {
    submitFeedback() {
      Sentry.captureMessage(`Feedback RJ${this.metadata.id} ${this.feedbackCategory}`, {
        tags: {
          event: 'feedback',
          feedbackCategory: this.feedbackCategory,
          workID: this.workid,
        },
        contexts: {
          metadata: this.metadata,
        },
        extra: {
          describeDetails: this.describeDetails,
        },
      })
      this.showSuccNotif(this.$t('feedback.thankYourFeedBack'))
      this.$emit('input', false)
    },
    resetFeedback() {
      this.feedbackCategory = ''
      this.describeDetails = ''
    },
  },

}
</script>

<template>
  <q-dialog :value="value" @input="(val) => $emit('input', val)">
    <q-card>
      <q-card-section class="q-pb-sm">
        <div class="text-body1">
          {{ $t('feedback.title') }}
        </div>
      </q-card-section>

      <q-form @submit="submitFeedback" @reset="resetFeedback">
        <q-card-section class="">
          <q-select
            v-model="feedbackCategory" filled
            lazy-rules
            :label="$t('feedback.whatKindOfIssue')"
            :options="['noFiles', 'missingFiles', 'fileBroken', 'cantPlay', 'notOriginal', 'subtitleNotMatch', 'other']"
            :option-label="(item) => item && $t(`feedback.category.${item}`)"
            :rules="[val => val && val.length > 0 || $t('feedback.whatKindOfIssue')]"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div style="min-width: 300px">
            <q-input
              v-model="describeDetails"
              filled
              lazy-rules
              type="textarea"
              :label="$t('feedback.tellUsDetail') + (feedbackCategory === 'other' ? '' : ` (${$t('common.optional')})`)"
              :rules="[val => feedbackCategory !== 'other' || val.length > 0 || $t('feedback.tellUsDetail')]"
            />
          </div>
        </q-card-section>

        <div class="row float-right">
          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat :label="$t('common.cancel')" color="grey-6" type="reset" />
            <q-btn flat :label="$t('common.submit')" color="secondary" type="submit" />
          </q-card-actions>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.my-custom-toggle
  border: 1px solid #027be3
</style>
