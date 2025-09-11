<script lang="ts" setup>
import {ref} from "vue";

const searchQuery = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  emit('search', searchQuery.value);
}
</script>

<template>
  <form @submit.prevent="handleSearch">
    <input v-model="searchQuery" placeholder="Search for a place..." type="text">
    <button>Search</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 1rem;
}
</style>