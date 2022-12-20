<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>

    <p class="text-faded">
      Sorry, nothing here...<strong>(404)</strong>
    </p>
    <q-btn
      color="secondary"
      style="width:200px;"
      to="/"
      label="Go back"
    />
  </div>
</template>

<script>
export default {
  name: 'Error404',
  head() {
    return {
      title: '404 - ASMR Online',
      meta: [
        { name: "robot", content: "noindex" },
        { name: "prerender-status-code", content: "404" },
      ]
    }
  }
}
</script>
