<template>
  <div id="map" class="main-map" />
</template>

<script>
import gmapsInit from '@/utils/gmaps';

export default {
  name: 'Map',
  data () {
    return {
      locations: [
        {lat: 43.745529, lng: -81.712486},
        {lat: 43.745529, lng: -91.712486},
        {lat: 43.745529, lng: -101.712486}
      ]
    }
  },
  async mounted() {
    try {
      // const google = await gmapsInit();
      // const map = new google.maps.Map(this.$el,
      // {
      //   center: this.locations[0],
      //   zoom: 8
      // })

    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main-map {
    width: 600px;
    height: 600px;
  }
</style>
