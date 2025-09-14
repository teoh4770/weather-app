<script lang="ts" setup>
// import the components here later
import SearchBar from "./components/SearchBar.vue";
import {simplestTaco} from "./services/weather.ts";

// taco()
//     "latitude": 43.4254,
// "longitude": -80.5112
simplestTaco({
  "latitude": 43.4254,
  "longitude": -80.5112
})

const handleWeatherSearch = (city: string) => {
  console.log('App component received city:', city);
}
</script>

<template>
  <main>
    <h1>Weather App</h1>
    <SearchBar @search="handleWeatherSearch"/>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
