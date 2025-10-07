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

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

nav {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

nav a {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

nav a:hover {
  background: var(--color-background-soft);
  color: var(--color-heading);
}

nav a.router-link-active {
  background: var(--color-background-soft);
  color: var(--color-heading);
}

main {
  min-height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  nav {
    padding: 0.75rem;
  }

  nav a {
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
