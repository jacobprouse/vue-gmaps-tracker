<template>
  <!-- Header -->
  <div
    class="header"
    :class="{'header-loading': loading}"
  >
    <p class="p p-large">
      Trakr
    </p>
    <img
      class="img"
      :src="`${baseURL}/Logo.svg`"
      alt="Trakr Logo."
    >
  </div>
</template>
<script>
export default {
  name: 'Header',
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      baseURL: process.env.VUE_APP_BASE_URL
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/variables';
@import '@/scss/elements';
@import '@/scss/containers';
</style>
