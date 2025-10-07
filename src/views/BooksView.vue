<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import type { Book } from '@/types/Book'
import BookList from '@/components/BookList.vue'
import Pagination from '@/components/Pagination.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const toast = useToast()
const books = ref<Book[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Delete state
const showDeleteModal = ref(false)
const bookToDelete = ref<string | null>(null)

// Pagination State
const currentPage = ref(1)
const itemsPerPage = 10

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

// Pagination Computed Properties
const totalPages = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage))

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBooks.value.slice(start, end)
})

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const goToPage = (page: number) => {
  currentPage.value = page
  // Scroll to top of book list
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleDeleteClick = (bookId: string) => {
  bookToDelete.value = bookId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!bookToDelete.value) return

  try {
    const response = await fetch(`http://localhost:4730/books/${bookToDelete.value}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Fehler beim Löschen des Buches')
    }

    // Remove book from local state
    books.value = books.value.filter((book) => book.id !== bookToDelete.value)

    toast.success('Buch erfolgreich gelöscht!')

    // Adjust current page if needed
    if (paginatedBooks.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    toast.error('Fehler beim Löschen des Buches. Bitte versuchen Sie es erneut.')
  } finally {
    showDeleteModal.value = false
    bookToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  bookToDelete.value = null
}

const getBookTitle = (bookId: string): string => {
  const book = books.value.find((b) => b.id === bookId)
  return book?.title || 'Dieses Buch'
}

// Reset to page 1 when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <main>
    <div class="books-container">
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Buchsammlung</h1>
            <p class="subtitle">Entdecken Sie unsere Auswahl klassischer Literatur</p>
          </div>
          <RouterLink to="/books/add" class="btn-add-book">
            <span class="btn-icon">➕</span>
            Neues Buch
          </RouterLink>
        </div>
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
        <template v-else>
          <div class="results-info">
            Seite {{ currentPage }} von {{ totalPages }} ({{ filteredBooks.length }} Bücher gesamt)
          </div>
          <BookList :books="paginatedBooks" :show-actions="true" @delete="handleDeleteClick" />
          <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="goToPage"
          />
        </template>
      </template>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal && bookToDelete"
      title="Buch löschen?"
      :message="`Möchten Sie '${getBookTitle(bookToDelete)}' wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`"
      confirm-text="Löschen"
      cancel-text="Abbrechen"
      confirm-type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/views/modern-books-view';
</style>
