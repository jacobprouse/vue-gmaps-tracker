<template>
  <div id="app" class="main-grid">
    <!-- Header -->
    <h1 class="header">Vue Gmaps Tracker</h1>
    <div class="description">
      <p>Track your products all over the world!<img :src="`${baseURL}/marker_red.png`" alt=""></p>
      <p>Upload a json file using structure suggested in the <a href="https://github.com/jacobprouse/vue-gmaps-tracker/blob/setup/README.md">README.md</a></p>
    </div>
    <!--  Current Location -->
    <p class="current-location"> You are centered on {{ currentLocation.name }}</p>
    <!-- Map -->
    <div ref="map" class="map" />
    <!-- Location List -->
    <div class="sidebar">
      <p><strong>Locations</strong></p>
      <ul>
        <!-- Legend Entry -->
        <li
          v-for="(location, index) in locations"
          :key="index">
          <button
            :title="disabled(location) ? '' : 'Center on Map'"
            :disabled="disabled(location)"
            :alt="`Click to center ${location.name} on the map.`"
            class="location-button"
            :class="{'location-button-inactive': disabled(location)}" 
            @click="goTo(location)">
            {{ location.name }}
          </button>
        </li>
      </ul>
    </div>
    <!-- Legend -->
    <div class="legend">
      <p class="legend-title">Legend</p>
      <div class="legend-container">
        <ul>
          <li class="legend-entry"><p>Active Marker</p><img :src="`${baseURL}/marker_red.png`" alt="Selected Marker"></li>
          <li class="legend-entry"><p>Inactive Marker</p><img :src="`${baseURL}/marker_gray.png`" alt="Not Selected Marker"></li>
        </ul>
      </div>
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
        {lat: 43.653225, lng: -79.4, name:'Toronto', level: 10, id: 1},
        {lat: 43.653225, lng: -79.5, name:'Toronto2', level: 50, id: 2},
        {lat: 43.653225, lng: -79.6, name:'Toronto3', level: 60, id: 3}
      ],
      currentLocation: null,
      map: null,
      google: null,
      markers: [],
      icons: {},
      baseURL: process.env.VUE_APP_BASE_URL
    }
  },
  async beforeMount () {
    this.currentLocation = this.locations[this.locations.findIndex(location => !this.disabled(location))]
  },
  async mounted() {
    await this.initializeMap()
  },
  methods: {
    goTo (location) {
      this.currentLocation = location
      this.map.setCenter(this.currentLocation)
    },
    disabled (location) {
      if (location.level <= 50) return true
      return false
    },
    makeIcons () {
      const inactiveMarker = {
        url: 'http://localhost:8080/marker_gray.png',
        size: new google.maps.Size(20, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
      }
      const activeMarker = {
        url: 'http://localhost:8080/marker_red.png',
        size: new google.maps.Size(20, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
      }
      this.icons.active = activeMarker
      this.icons.inactive = inactiveMarker
    },
    addMarkers() {
      this.makeIcons()
      for (let i = this.locations.length; i--;) {
        const location = this.locations[i]
        const marker = new google.maps.Marker(
          {
            position: location,
            map: this.map,
            animation: google.maps.Animation.DROP,
            icon: this.disabled(location) ? this.icons.inactive : this.icons.active
          }
        )
        const content = `
          <div>
            <h4>${location.name}</h4>
            <p>The level of this product is ${location.level}</p>
          </div>
        `
        const infoWindow = new google.maps.InfoWindow ({
          content: content
        })

        // Add bounce animation with a timeout
        marker.addListener('click', function () {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function () {
            marker.setAnimation(null);
          }, 200)
        })

        // Add an info window
        marker.addListener('click', function () {
          infoWindow.open(this.map, marker)
        })
        this.markers.push(marker)
      }
    },
    async initializeMap() {
      try {
        // Initialize the google maps API connection (add script)
        const google = await gmapsInit()
        this.map = new google.maps.Map(this.$refs.map,
        {
          center: this.currentLocation,
          zoom: 8
        })
        this.addMarkers()
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<style lang="scss">
$primary: whitesmoke;
$border-radius: 0.25rem;

// Style buttons
button {
  border-radius: 0.25rem;
  padding: 5px;
}

// Style lists
ul {
  list-style: none;
  padding-left: 0;
}

// Style Anchors


// Main App
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin-top: 40px;
  display: grid;
  grid-template-columns: 5% 30% 30% 30% 5%;
  grid-template-rows: auto;
  // Layout of the app
  grid-template-areas: 
  ". . header . ."
  ". . description . ."
  ". . location . ."
  ". sidebar map json ."
  ". . legend . .";

  // Header
  .header {
    grid-area: header;
    text-align: center;
  }

  // Description
  .description {
    grid-area: description;
    text-align: center;
    align-self: flex-end;

    a {
      text-decoration: none;
      color: white;
      background-color: green;
      border: 1px solid green;
      border-radius: $border-radius;

      &:hover {
        background-color: lighten(green, 5%);
      }
    }
  }

  // Current Location Text
  .current-location {
    grid-area: location;
    text-align: center;
    align-self: flex-end;
  }

  // Location List 
  .sidebar {
    grid-area: sidebar;
    width: 30%;
    justify-self: flex-end;
    display: flex;
    flex-direction: column;
    padding: 0 40px;
    
    // Style each list element
    .location-button {
      border: 1px solid blue;
      margin: 5px;
      width: 100%;

      // Style an inactive list element
      &-inactive { border: 1px solid black; }
    }
  }

  // Map Container
  .map {
    grid-area: map;
    width: 100%;
    height: 600px;
    border: 1px solid black;
  }

  // Legend
  .legend {
    grid-area: legend;
    display: flex;
    flex-direction: column;
    align-items: center;

    // Legend Title
    &-title {
      justify-self: center;
    }

    // Legend Container for list
    &-container { 
      width: 50%;
      justify-self: center;
    }

    // Legend Entry
    &-entry { 
      display: flex;
      text-align: left;
      justify-content: center;

      p { padding-right: 30px; }
    }
  }
}
</style>
