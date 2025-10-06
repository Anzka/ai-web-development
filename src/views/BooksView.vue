<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Book } from '@/types/Book'
import BookList from '@/components/BookList.vue'

const books = ref<Book[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

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
    error.value = e instanceof Error ? e.message : 'Bücher konnten nicht geladen werden'
    console.error('Error fetching books:', e)
  } finally {
    loading.value = false
  }
}

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) {
    return books.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return books.value.filter((book) =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  )
})

const clearSearch = () => {
  searchQuery.value = ''
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <main>
    <div class="books-container">
      <header class="page-header">
        <h1>Buchsammlung</h1>
        <p class="subtitle">Entdecken Sie unsere Auswahl klassischer Literatur</p>
      </header>

      <div v-if="!loading && !error" class="search-section" role="search">
        <div class="search-wrapper">
          <label for="book-search" class="search-label">Bücher durchsuchen</label>
          <div class="search-input-wrapper">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input
              id="book-search"
              v-model="searchQuery"
              type="search"
              placeholder="Nach Titel oder Autor suchen..."
              class="search-input"
              aria-label="Nach Titel oder Autor suchen"
              aria-describedby="search-results-info"
              autocomplete="off"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-button"
              aria-label="Suche zurücksetzen"
              type="button"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div
            v-if="searchQuery"
            id="search-results-info"
            class="search-results-info"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {{ filteredBooks.length }} von {{ books.length }} Büchern gefunden
          </div>
        </div>
      </div>

      <div v-if="loading" class="message">
        <div class="spinner"></div>
        <p>Bücher werden geladen...</p>
      </div>
      <div v-else-if="error" class="message error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="fetchBooks" class="retry-button">Erneut versuchen</button>
      </div>
      <template v-else>
        <div v-if="filteredBooks.length === 0 && searchQuery" class="message">
          <span class="empty-icon">📚</span>
          <p>Keine Bücher gefunden für "{{ searchQuery }}"</p>
          <button @click="clearSearch" class="clear-search-button">Suche zurücksetzen</button>
        </div>
        <BookList v-else :books="filteredBooks" />
      </template>
    </div>
  </main>
</template>

<style scoped>
.books-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--color-heading);
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.125rem;
  margin: 0;
}

/* Search Section */
.search-section {
  margin-bottom: 2.5rem;
}

.search-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.75rem;
  text-align: center;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-input-wrapper:focus-within {
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px rgba(var(--color-border-hover-rgb, 100, 108, 255), 0.1);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.search-icon {
  padding: 0 1rem;
  font-size: 1.25rem;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  padding: 1rem 0.5rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: var(--color-text);
  background: var(--color-background-mute);
}

.clear-button:focus-visible {
  outline: 2px solid var(--color-border-hover);
  outline-offset: 2px;
}

.search-results-info {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

/* Message States */
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;
}

.message p {
  font-size: 1.125rem;
  color: var(--color-text);
  margin: 0;
}

.message.error {
  color: var(--color-text);
}

.message.error p {
  color: #ef4444;
  font-weight: 500;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  opacity: 0.7;
}

/* Spinner */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-border-hover);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Buttons */
.retry-button,
.clear-search-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover,
.clear-search-button:hover {
  background: var(--color-background-mute);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.retry-button:active,
.clear-search-button:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .books-container {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .search-section {
    margin-bottom: 2rem;
  }

  .message {
    padding: 3rem 1.5rem;
  }

  .message p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.75rem;
  }

  .search-input-wrapper {
    border-radius: 8px;
  }

  .search-input {
    font-size: 0.95rem;
    padding: 0.875rem 0.5rem;
  }
}
</style>
