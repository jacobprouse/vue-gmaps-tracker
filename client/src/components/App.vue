<template>
  <div id="app">
    <Container />
  </div>
</template>

<script>
import Container from "@/components/Container.vue";

export default {
  name: "App",
  components: {
    Container,
  },
};
</script>
<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
