<template>
  <div id="app" class="main-grid">
    <!-- Header -->
    <h1 class="header">
      Vue Gmaps Tracker
    </h1>
    <div class="description">
      <p>Track your products all over the world!<img :src="`${baseURL}/marker_red.png`" alt=""></p>
      <p>Copy and paste json using structure suggested in the <a href="https://github.com/jacobprouse/vue-gmaps-tracker/blob/master/README.md">README.md</a></p>
    </div>
    <!-- Map -->
    <div ref="map" class="map" />
    <!-- Json Area -->
    <div class="json-area">
      <p><strong>JSON Data</strong></p>
      <textarea v-model.lazy="json" aria-required="true" :aria-invalid="!valid" placeholder="Paste JSON here..." />
      <button :disabled="!valid" alt="Load a new map." title="Load a new map" @click="makeMap">
        Load Map
      </button>
      <p v-if="!valid" class="error" aria-hidden="true" role="alert">
        Invalid JSON
      </p>
    </div>
    <!-- Location List -->
    <div class="sidebar">
      <p v-if="locations.length">
        <strong>Locations</strong>
      </p>
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
      <!--  Current Location -->
      <p v-if="currentLocation" class="current-location">
        You are centered on {{ currentLocation.name }}
      </p>
    </div>
    <!-- Legend -->
    <div class="legend">
      <p class="legend-title">
        Legend
      </p>
      <div class="legend-container">
        <ul>
          <li class="legend-entry">
            <p>Active Marker</p><img :src="`${baseURL}/marker_red.png`" alt="Selected Marker">
          </li>
          <li class="legend-entry">
            <p>Inactive Marker</p><img :src="`${baseURL}/marker_gray.png`" alt="Not Selected Marker">
          </li>
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
      // locations: [
      //   {"lat": 43.653225, "lng": -79.4, "name":'Toronto', "level": 10, "id": 1},
      //   {"lat": 43.653225, "lng": -79.5, "name":'Toronto1', "level": 10, "id": 1},
      //   {"lat": 43.653225, "lng": -79.6, "name":'Toronto2', "level": 10, "id": 1},
      // ],
      currentLocation: null,
      map: null,
      google: null,
      markers: [],
      icons: {},
      baseURL: process.env.VUE_APP_BASE_URL,
      json: "",
      threshold: parseInt(process.env.VUE_APP_THRESHOLD) || 50
    }
  },
  computed: {
    disableUi () {
      // If the map has not been initialized.
      if (!this.map) return true
      return false
    },
    valid () {
      if (Array.isArray(this.parsedJSON) && this.parsedJSON.length) {
        for (let i = this.parsedJSON.length; i--;) {
          if (Object.keys(this.parsedJSON).includes('level', 'lat', 'lng', 'name') &&
            typeof this.parsedJSON.level === 'number' &&
            typeof this.parsedJSON.lat === 'number' &&
            typeof this.parsedJSON.lng === 'number' &&
            typeof this.parsedJSON.name === 'string') continue
          else return false
        }
        return true
      } else if (Object.keys(this.parsedJSON).includes('level', 'lat', 'lng', 'name') &&
          typeof this.parsedJSON.level === 'number' &&
          typeof this.parsedJSON.lat === 'number' &&
          typeof this.parsedJSON.lng === 'number' &&
          typeof this.parsedJSON.name === 'string') {
        return true
      }
      return false
    },
    locations () {
      if (this.valid) {
        if (Array.isArray(this.parsedJSON)) return this.parsedJSON
        return [this.parsedJSON]
      }
      return []
    },
    parsedJSON () {
      try{
        return JSON.parse(this.json)
      } catch {
        return []
      }
    }
  },
  async mounted () {
    // Initialize the google maps API connection (add script)
    await gmapsInit()
  },
  methods: {
    goTo (location) {
      this.currentLocation = location
      this.map.setCenter(this.currentLocation)
    },
    disabled (location) {
      if (location.selected) return false
      // By default locations will not be selected if they have less than the threshold
      if (location.level < this.threshold || location.selected === false) return true
      return false
    },
    makeIcons () {
      const inactiveMarker = {
        url: `${baseURL}/marker_gray.png`,
        size: new google.maps.Size(20, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
      }
      const activeMarker = {
        url: `${baseURL}/marker_red.png`,
        size: new google.maps.Size(20, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
      }
      this.icons.active = activeMarker
      this.icons.inactive = inactiveMarker
    },
    addMarkers () {
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
    async makeMap () {
      try {
        this.markers = []
        this.currentLocation = this.locations[0]
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
  ". sidebar map json-area ."
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

  // Json Area =
  .json-area {
    grid-area: json-area;
    display: flex;
    margin-left: 20px;
    flex-direction: column;

    button {
      width: 50%;
    }

    .error {
      color: red
    }

    p {
      margin-top: 0;
    }

    textarea {
      min-width: 50%;
      width: 400px;
      max-width: 80%;
      min-height: 25px;
      height: 400px;
      max-height: 500px;
    }
  }

  // Location List
  .sidebar {
    grid-area: sidebar;
    width: 30%;
    justify-self: flex-end;
    display: flex;
    flex-direction: column;
    padding: 0 40px;

    :nth-child(1) {
      margin-top: 0;
    }

    // Style each list element
    .location-button {
      border: 1px solid blue;
      margin: 5px;
      width: 100%;

      // Style an inactive list element
      &-inactive { border: 1px solid black; }
    }

    // Current Location Text
    .current-location {
      grid-area: location;
      text-align: left;
      word-break: break-word;
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

      img { align-self: center; }
    }
  }
}
</style>
