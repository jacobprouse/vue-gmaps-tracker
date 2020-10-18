<template>
  <div class="app">
    <Header
      :loading="loading"
      @tracking="loading = false"
    />
    <Container :loading="loading" />
  </div>
</template>

<script>
import Container from '@/components/Container'
import Header from '@/components/Header'

export default {
  name: 'App',
  components: {
    Container,
    Header
  },
  data () {
    return {
      loading: true
    }
  }
}
</script>
<style lang="scss">
@import '@/scss/mixins/breakpoints';
@import '@/scss/variables';

// Get Full Viewport height.
html { height: 100%; }

body {
  background-color: $secondary;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

// Main Component
.app {
  background-color: $secondary;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0 10px;
}
</style>
