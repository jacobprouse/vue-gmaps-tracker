<template>
  <div class="main-grid">
    <!-- Header -->
    <p class="header p p-large">
      Vue Gmaps Tracker
      <img
        class="img img-logo"
        :src="`${baseURL}/marker_red.png`"
        alt
      >
    </p>
    <div class="description">
      <p class="p p-medium">
        Track your products all over the world!
      </p>
      <p class="p p-small">
        Copy and paste json using structure suggested in the
        <a
          href="https://github.com/jacobprouse/vue-gmaps-tracker/blob/master/README.md"
        >README.md</a>
      </p>
    </div>
    <!-- Map -->
    <div
      ref="map"
      class="map"
    />
    <!-- Json Area -->
    <div class="json-area">
      <p>
        <strong>JSON Data</strong>
      </p>
      <textarea
        v-model.lazy="json"
        aria-required="true"
        :aria-invalid="!valid"
        placeholder="Paste JSON here..."
      />
      <button
        class="btn"
        :disabled="!valid"
        alt="Load a new map."
        title="Load a new map"
        @click="makeMap"
      >
        Load Map
      </button>
      <p
        v-if="!valid"
        class="error"
        aria-hidden="true"
        role="alert"
      >
        Invalid JSON
      </p>
    </div>
    <!-- Location List -->
    <div class="sidebar">
      <p v-if="locations.length">
        <strong>Locations</strong>
      </p>
      <ul class="list">
        <!-- Legend Entry -->
        <li
          v-for="(location, index) in locations"
          :key="index"
        >
          <button
            :title="disabled(location) ? '' : 'Center on Map'"
            :disabled="disabled(location)"
            :alt="`Click to center ${location.name} on the map.`"
            class="button location-button"
            :class="{ 'location-button-inactive': disabled(location) }"
            @click="goTo(location)"
          >
            {{ location.name }}
          </button>
        </li>
      </ul>
      <!--  Current Location -->
      <p
        v-if="currentLocation"
        class="current-location"
      >
        You are centered on {{ currentLocation.name }}
      </p>
    </div>
    <!-- Legend -->
    <div class="legend">
      <p class="legend-title">
        Legend
      </p>
      <div class="legend-container">
        <ul class="list">
          <li class="legend-entry">
            <p>Active Marker</p>
            <img
              :src="`${baseURL}/marker_red.png`"
              alt="Selected Marker"
            >
          </li>
          <li class="legend-entry">
            <p>Inactive Marker</p>
            <img
              :src="`${baseURL}/marker_gray.png`"
              alt="Not Selected Marker"
            >
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
      mode: 'json',
      baseURL: process.env.VUE_APP_BASE_URL,
      json: '',
      threshold: parseInt(process.env.VUE_APP_THRESHOLD) || 50,
      providedURL: ''
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
            Location({ ...json[i] })
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
     * Stores the current list of locations either
     * from incoming json, or from a database. It also provides a fallback.
     * @computed
     */
    locations () {
      // If the user chooses to use json.
      switch (this.mode) {
        case 'json':
          if (this.valid) {
            if (Array.isArray(this.parsedJSON)) return this.parsedJSON
            return [this.parsedJSON]
          }
          break
        case 'api':
          // if (this.valid) {

          // }
          break
        default:
          log('Nothing')
      }
      return []
    },
    /**
     * Parses the json, and will catch errors from parsing.
     * @computed
     */
    parsedJSON () {
      try {
        return JSON.parse(this.json)
      } catch (error) {
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
      log(
        'The Container component failed to mount with the following error: ',
        error
      )
    }
  },
  methods: {
    async getLocations () {
      const response = await axios.get(this.providedURL)
      log(response)
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
      if (location.level < location.threshold || location.selected === false) { return true }
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
        const marker = new google.maps.Marker({
          position: location,
          map: this.map,
          animation: google.maps.Animation.DROP,
          icon: this.disabled(location)
            ? this.icons.inactive
            : this.icons.active
        })

        // Create Content
        const content = `
          <div>
            <h4>${location.name}</h4>
            <p>The level of this product is ${location.level}</p>
          </div>
        `
        const infoWindow = new google.maps.InfoWindow({
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
        this.map = new google.maps.Map(this.$refs.map, {
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
// Colors
$primary: #3fb27f;
$secondary: #e2e7de;
$tertiary: #688159;
$error: rgba(255, 0, 0);

// Sizes (Padding, Margin, etc...)
$size-base: 1em;
$size-sm: $size-base / 2;
$size-md: $size-base * 1.2;
$size-lg: $size-base * 1.5;

// Font sizes
$font-base: 1.5em;
$font-sm: $font-base * 0.5;
$font-md: $font-base * 1.2;
$font-lg: $font-base * 1.5;

// Borders
$border-radius: 0.25rem;

// Paragraphs
.p {
  color: $secondary;
  font-family: Verdana, Geneva, Tahoma, sans-serif;

  &-large {
    font-size: $font-lg;
  }

  &-medium {
    font-size: $font-md;
  }

  &-small {
    font-size: $font-sm;
  }
}

// Images
.img {
  &-logo {
    display: block;
    padding: 0 auto;
  }
}

// Buttons
.btn {
  border-radius: 0.25rem;
  padding: 5px;
}

// Style lists
.list {
  list-style: none;
  padding-left: 0;
}

// Main App
.main-grid {
  background-color: $primary;
  display: grid;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  // Layout of the app
  grid-template-areas:
    '. . header . .'
    '. . description . .'
    '. sidebar map json-area .'
    '. . legend . .';
  grid-template-columns: 5% 30% 30% 30% 5%;
  grid-template-rows: auto;
}

// Header
.header {
  grid-area: header;
  text-align: center;
}

// Description
.description {
  align-self: flex-end;
  grid-area: description;
  text-align: center;

  a {
    background-color: $tertiary;
    border: 1px solid $primary;
    border-radius: $border-radius;
    color: $secondary;
    padding: $size-sm;
    text-decoration: none;
  }

  a:hover {
    background-color: lighten($tertiary, 5%);
  }
}

// Json Area =
.json-area {
  display: flex;
  flex-direction: column;
  grid-area: json-area;
  margin-left: 20px;

  button {
    width: 50%;
  }

  .error {
    color: $error;
  }

  p {
    margin-top: 0;
  }

  textarea {
    height: 400px;
    max-height: 500px;
    max-width: 80%;
    min-height: 25px;
    min-width: 50%;
    width: 400px;
  }
}

// Location List
.sidebar {
  display: flex;
  flex-direction: column;
  grid-area: sidebar;
  justify-self: flex-end;
  padding: 0 40px;
  width: 30%;

  :nth-child(1) {
    margin-top: 0;
  }

  // Style each list element
  .location-button {
    border: 1px solid $primary;
    margin: 5px;
    width: 100%;
  }

  .location-button-inactive {
    border: 1px solid $primary;
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
  border: 1px solid $primary;
  grid-area: map;
  height: 600px;
  width: 100%;
}

// Legend
.legend {
  align-items: center;
  display: flex;
  flex-direction: column;
  grid-area: legend;

  // Legend Title
  &-title {
    justify-self: center;
  }

  // Legend Container for list
  &-container {
    justify-self: center;
    width: 50%;
  }

  // Legend Entry
  &-entry {
    display: flex;
    justify-content: center;
    text-align: left;
  }

  &-entry p {
    padding-right: 30px;

  }

  &-entry img {
    align-self: center;
  }
}
</style>
