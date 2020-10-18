<template>
  <!-- Header -->
  <div
    class="header"
    :class="{'header-loading': loading}"
  >
    <div
      class="header-logo"
    >
      <p class="p p-lg p-logo">
        Trakr
      </p>
      <img
        class="img"
        :src="`${baseURL}/Logo.svg`"
        alt="Trakr Logo."
      >
    </div>
    <transition name="fade">
      <p
        v-if="loading"
        class="p p-sm p-greeting"
      >
        {{ randomGreeting() }}
      </p>
    </transition>
    <transition name="fade">
      <!-- Button -->
      <button
        class="btn btn-sm btn-primary"
        @click="$emit('tracking')"
        v-if="loading"
      >
        Track
      </button>
    </transition>
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
  },
  methods: {
    /**
     * Pick a random greeting.
     * @function
     */
    randomGreeting () {
      const randomInt = Math.floor(Math.random() * 3)
      const greetings = [
        'library book bins in Toronto?',
        'recycle boxes in Vancouver?',
        'uni textbook dropoffs around London?'
      ]
      return greetings[randomInt]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/variables';
@import '@/scss/elements';
@import '@/scss/transitions';

// Header
.header {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  transition: transform 1s linear;

  &-loading {
    transform: translateY(150px);
  }
}

.header-logo {
  align-items: center;
  display: flex;
  justify-content: center;
}

.p-greeting {
  font-style: italic;
  text-align: center;
  text-decoration: underline;
}
</style>
