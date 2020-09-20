# vue-gmaps-tracker

I made this repo to experience setting up a live web app. Its purpose is to track the product levels at a business' locations.

## Suggested JSON structure
```
[
  {
    "lat": ###,
    "lng": ###,
    "level": ###,
    "name": string
  },
  ...
]
```

## Env File
# This is your api key for the Google Maps Javascript API
VUE_APP_API_KEY=myapikey
# Your host address
VUE_APP_BASE_URL=http*
# Threshold for location to be unmarked by default
VUE_APP_THRESHOLD=50

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
