<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Book } from '@/types/Book'

type KanbanColumn = 'want-to-read' | 'reading' | 'finished'

interface KanbanBook extends Book {
  status: KanbanColumn
}

const allBooks = ref<Book[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Load book statuses from localStorage
const bookStatuses = useLocalStorage<Record<string, KanbanColumn>>('book-kanban-statuses', {})

// Fetch all books from API
const fetchBooks = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('http://localhost:4730/books')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    allBooks.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Bücher konnten nicht geladen werden'
    console.error('Error fetching books:', e)
  } finally {
    loading.value = false
  }
}

// Combine books with their statuses
const kanbanBooks = computed((): KanbanBook[] => {
  return allBooks.value.map((book) => ({
    ...book,
    status: bookStatuses.value[book.id] || 'want-to-read'
  }))
})

// Filter books by column
const getBooksByStatus = (status: KanbanColumn) => {
  return kanbanBooks.value.filter((book) => book.status === status)
}

const wantToReadBooks = computed(() => getBooksByStatus('want-to-read'))
const readingBooks = computed(() => getBooksByStatus('reading'))
const finishedBooks = computed(() => getBooksByStatus('finished'))

// Move book to different column
const moveBook = (bookId: string, newStatus: KanbanColumn) => {
  bookStatuses.value[bookId] = newStatus
}

// Drag and drop handlers
const draggedBookId = ref<string | null>(null)

const handleDragStart = (bookId: string) => {
  draggedBookId.value = bookId
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent, targetStatus: KanbanColumn) => {
  event.preventDefault()
  if (draggedBookId.value) {
    moveBook(draggedBookId.value, targetStatus)
    draggedBookId.value = null
  }
}

const columns = [
  {
    id: 'want-to-read' as KanbanColumn,
    title: 'Möchte ich lesen',
    icon: '📚',
    books: wantToReadBooks
  },
  {
    id: 'reading' as KanbanColumn,
    title: 'Lese ich gerade',
    icon: '📖',
    books: readingBooks
  },
  {
    id: 'finished' as KanbanColumn,
    title: 'Fertig gelesen',
    icon: '✅',
    books: finishedBooks
  }
]

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <main class="kanban-view">
    <div class="kanban-container">
      <header class="kanban-header">
        <h1>Mein Lese-Board</h1>
        <p class="subtitle">Verwalten Sie Ihre Bücher per Drag & Drop</p>
      </header>

      <div v-if="loading" class="message">
        <div class="spinner"></div>
        <p>Bücher werden geladen...</p>
      </div>

      <div v-else-if="error" class="message error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="fetchBooks" class="retry-button">Erneut versuchen</button>
      </div>

      <div v-else class="kanban-board">
        <div
          v-for="column in columns"
          :key="column.id"
          class="kanban-column"
          @dragover="handleDragOver"
          @drop="(e) => handleDrop(e, column.id)"
        >
          <div class="column-header">
            <span class="column-icon">{{ column.icon }}</span>
            <h2 class="column-title">{{ column.title }}</h2>
            <span class="column-count">{{ column.books.value.length }}</span>
          </div>

          <div class="column-content">
            <div
              v-for="book in column.books.value"
              :key="book.id"
              class="kanban-card"
              draggable="true"
              @dragstart="handleDragStart(book.id)"
            >
              <div class="card-cover">
                <img
                  v-if="book.cover"
                  :src="book.cover"
                  :alt="book.title"
                  class="cover-image"
                />
                <div v-else class="cover-placeholder">
                  <span class="book-icon">📚</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ book.title }}</h3>
                <p class="card-author">{{ book.author }}</p>
                <div v-if="book.numPages" class="card-meta">
                  {{ book.numPages }} Seiten
                </div>
              </div>
            </div>

            <div v-if="column.books.value.length === 0" class="empty-column">
              <p>Ziehen Sie Bücher hierher</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.kanban-view {
  min-height: calc(100vh - 60px);
  padding: 2rem 0;
}

.kanban-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.kanban-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--color-heading);
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.125rem;
  margin: 0;
}

/* Loading/Error States */
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;
}

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

.error-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.retry-button {
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

.retry-button:hover {
  background: var(--color-background-mute);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

/* Kanban Board */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.kanban-column {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.column-icon {
  font-size: 1.5rem;
}

.column-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
  flex: 1;
}

.column-count {
  background: var(--color-background-mute);
  color: var(--color-text-muted);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.column-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Kanban Cards */
.kanban-card {
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: move;
  transition: all 0.2s ease;
  display: flex;
  gap: 1rem;
}

.kanban-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kanban-card:active {
  cursor: grabbing;
  opacity: 0.7;
}

.card-cover {
  width: 60px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-background-mute);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-background-mute) 0%, var(--color-border) 100%);
}

.book-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-author {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: var(--color-text);
}

.card-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.empty-column {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Responsive */
@media (max-width: 1200px) {
  .kanban-board {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .kanban-column {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .kanban-column {
    padding: 1rem;
  }

  .column-header {
    margin-bottom: 1rem;
  }
}
</style>
