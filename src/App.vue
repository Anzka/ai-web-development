<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/books">Bücher</RouterLink>
      <RouterLink to="/kanban">Lese-Board</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>

  <ToastContainer />
</template>

<style scoped lang="scss">
@use '@/assets/styles/layout/header';
</style>
