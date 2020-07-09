<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <p>
      You are currently at: <span class="location">{{ currentLocation.name }}</span>
    </p>
    <div class="inline-map">
      <ul class="location-list">
        <li v-for="(location, index) in locations" :key="index" @click="goTo(location)">
          {{ location.name }}
        </li>
      </ul>
      <div id="map" ref="map" class="main-map" />
    </div>
  </div>
</template>

<script>
import gmapsInit from '@/utils/gmaps'

export default {
  name: 'App',
  data () {
    return {
      locations: [
        {lat: 43.653225, lng: -79.383186, name:'Toronto'},
        {lat: 43.653225, lng: -89.383186, name:'Toronto2'},
        {lat: 43.653225, lng: -99.383186, name:'Toronto3'}
      ],
      currentLocation: null,
      map: null
    }
  },
  created () {
    this.currentLocation = this.locations[0]
  },
  async mounted() {
    try {
      const google = await gmapsInit()
      this.map = new google.maps.Map(this.$refs.map,
      {
        center: this.currentLocation,
        zoom: 8
      })

    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    goTo (location) {
      this.currentLocation = location
      this.map.setCenter(this.currentLocation)
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .inline-map {
    display: inherit;
    flex-direction: row;

    .location-list {
      padding-right: 20px;
      list-style: none;

      li {
        border: 2px solid red;
        margin: 5px 0;
        padding: 5px 0;
      }
    }

    #map {
      width: 500px;
      height: 500px;
      border: 1px solid black;
    }

    .location {
      color: green;
      border: 1px solid green;
    }
  }
}
</style>
