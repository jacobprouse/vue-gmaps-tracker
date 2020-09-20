<template>
  <div
    id="app"
    class="container"
  >
    <Container />
  </div>
</template>

<script>
import Container from '@/components/Container.vue'

export default {
  name: 'App',
  components: {
    Container
  }
}
</script>
<style scoped lang="scss">
.container {
  display: flex;
  height: 90vh;
  margin: 0 auto;
  overflow-x: hidden;
  width: 50vw;
}
</style>
