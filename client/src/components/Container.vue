<template>
  <div id="container" class="main-grid">
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
import axios from 'axios'
import debug from 'debug'
import gmapsInit from '@/utils/gmaps'
import { Location } from '@/utils/classes'

const log = debug('vgm:container')
log.log = console.log.bind(console)

export default {
  name: 'Container',
  data () {
    return {
      apiKey: null,
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
    /**
		 * Used to determine the disabled state of UI elements.
		 * @computed
		 */
    disableUi () {
      // If the map has not been initialized.
      if (!this.map) return true
      return false
    },
    /**
		 * Determines if the json is valid.
		 * @computed
		 */
    valid () {
      // If the json is a json array, loop through and check the property types.
      // Otherwise just check properties
      let json = this.parsedJSON
      if (!Array.isArray(this.parsedJSON)) json = [this.parsedJSON]
      if (Array.isArray(json) && json.length) {
        for (let i = json.length; i--;) {
          try {
            // Check to see if it obeys the properties.
            new Location(
              {...json[i]}
            )
          } catch (error) {
            log(error)
            return false
          }
        }
        return true
      }
      return false
    },
    /**
		 * Formats the incoming json and provides a fallback.
		 * @computed
		 */
    locations () {
      if (this.valid) {
        if (Array.isArray(this.parsedJSON)) return this.parsedJSON
        return [this.parsedJSON]
      }
      return []
    },
    /**
		 * Parses the json, and will catch errors from parsing.
		 * @computed
		 */
    parsedJSON () {
      try{
        return JSON.parse(this.json)
      } catch {
        return []
      }
    }
  },
  async mounted () {
    try {
      log('Connecting to the Google Maps API...')
      // Initialize the google maps API connection (add script).
      await gmapsInit()
      log('Connected to the Google Maps API.')
    } catch (error) {
      log('The Container component failed to mount with the following error: ', error)
    }
  },
  methods: {
    getLocations () {

    },
    /**
		 * Set the map on a location.
		 * @function
		 * @param {object} location - An object with properties following the README's direction.
		 */
    goTo (location) {
      this.currentLocation = location
      this.map.setCenter(this.currentLocation)
    },
    /**
		 * Check a location's level against its threshold.
     * @function
		 */
    disabled (location) {
      if (location.selected) return false
      // By default locations will not be selected if they have less than the threshold.
      if (location.level < location.threshold || location.selected === false) return true
      return false
    },
    /**
		 * Set the icons.
		 * @function
		 */
    makeIcons () {
      const inactiveMarker = {
        url: `${this.baseURL}/marker_gray.png`,
        size: new google.maps.Size(20, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
      }
      const activeMarker = {
        url: `${this.baseURL}/marker_red.png`,
        size: new google.maps.Size(20, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
      }
      this.icons.active = activeMarker
      this.icons.inactive = inactiveMarker
    },
    /**
		 * Add the markers to the map.
		 * @function
		 */
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

        // Create Content
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
          marker.setAnimation(google.maps.Animation.BOUNCE)
          setTimeout(function () {
            marker.setAnimation(null)
          }, 200)
        })

        // Add an info window
        marker.addListener('click', function () {
          infoWindow.open(this.map, marker)
        })
        this.markers.push(marker)
      }
    },
    /**
     * Instansiate maps api on the map area.
     * @function
     */
    async makeMap () {
      try {
        // Initialize array.
        this.markers = []
        // Set the current location.
        this.currentLocation = this.locations[0]
        // Make a gmaps instance centered on the current location with moderate zoom.
        this.map = new google.maps.Map(this.$refs.map,
          {
            center: this.currentLocation,
            zoom: 8
          })
        // Add markers to the map.
        this.addMarkers()
      } catch (error) {
        console.error(error)
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
#container {
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
