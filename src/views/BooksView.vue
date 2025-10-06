<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Book } from '@/types/Book'
import BookList from '@/components/BookList.vue'

const books = ref<Book[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchBooks = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('http://localhost:4730/books')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    books.value = data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch books'
    console.error('Error fetching books:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <main>
    <div class="books-container">
      <h1>Books Collection</h1>
      <p class="subtitle">Explore our curated selection of classic literature</p>

      <div v-if="loading" class="message">Loading books...</div>
      <div v-else-if="error" class="message error">{{ error }}</div>
      <BookList v-else :books="books" />
    </div>
  </main>
</template>

<style scoped>
.books-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.message.error {
  color: #ef4444;
  font-weight: 500;
}
</style>
