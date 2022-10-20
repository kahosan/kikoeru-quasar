<template>
    <q-dialog :value="value" @input="(val) => $emit('input', val)">
      <q-card>
        <q-card-section class="q-pb-sm">
          <div class="text-body1">{{ $t('feedback.title') }}</div>
        </q-card-section>

        <q-form @submit="submitFeedback" @reset="resetFeedback">
          <q-card-section class="">
            <q-select
              filled lazy-rules
              v-model="feedbackCategory"
              :label="$t('feedback.whatKindOfIssue')"
              :options="['noFiles', 'missingFiles', 'cantPlay', 'notOriginal', 'subtitleNotMatch', 'other']"
              :option-label="(item) => item && $t(`feedback.category.${item}`)"
              :rules="[ val => val && val.length > 0 || $t('feedback.whatKindOfIssue')]"
            />
          </q-card-section>

          <q-card-section class="q-pt-none" >
            <div style="min-width: 300px">
              <q-input
                filled
                lazy-rules
                v-model="describeDetails"
                type="textarea"
                :label="$t('feedback.tellUsDetail')"
                :rules="[ val => val.length > 0 || $t('feedback.tellUsDetail')]"
              />
            </div>
          </q-card-section>

          <div class="row float-right">
            <q-card-actions align="right" class="text-primary">
              <q-btn flat :label="$t('common.cancel')" color="grey-6" type="reset" v-close-popup />
              <q-btn flat :label="$t('common.submit')" color="secondary" type="submit"/>
            </q-card-actions>
          </div>
        </q-form>
      </q-card>
    </q-dialog>
</template>

<script>
import NotifyMixin from '../mixins/Notification.js'
import * as Sentry from "@sentry/vue";

export default {
  name: 'WorkFeedback',

  mixins: [NotifyMixin],

  props: {
    value: {
      type: Boolean,
      required: true
    },
    workid: {
      type: Number,
      required: true
    },
    metadata: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      showFeedbackDialog: true,
      feedbackCategory: '',
      describeDetails: ''
    }
  },

  methods: {
    submitFeedback () {
      Sentry.captureMessage(`Feedback RJ${this.metadata.id} ${this.feedbackCategory}`, {
        tags: {
          event: 'feedback',
          feedbackCategory: this.feedbackCategory,
          workID: this.workid
        },
        contexts: {
          metadata: this.metadata,
        },
        extra: {
          describeDetails: this.describeDetails
        }
      })
      this.showSuccNotif(this.$t('feedback.thankYourFeedBack'))
      this.$emit('input', false)
    },
    resetFeedback() {
      this.feedbackCategory = ''
      this.describeDetails = ''
    }
  }

}
</script>

<style lang="sass" scoped>
.my-custom-toggle
  border: 1px solid #027be3
</style>
