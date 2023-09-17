<script setup>
import { useRoute } from 'vue-router'

// @ts-expect-error -- VuePlyr has no types
import VuePlyr from 'vue-plyr'

const source = useRoute().query.source

console.info('source', source)
</script>

<template>
  <div style="height: 40rem">
    <VuePlyr>
      <video>
        <source :src="source" type="video/mp4">
      </video>
    </VuePlyr>
  </div>
</template>
