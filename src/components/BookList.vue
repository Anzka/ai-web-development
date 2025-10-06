<script setup lang="ts">
import type { Book } from '@/types/Book'
import BookCard from './BookCard.vue'

defineProps<{
  books: Book[]
}>()
</script>

<template>
  <div class="book-list">
    <div v-if="books.length === 0" class="no-books">
      <span class="empty-icon">📚</span>
      <p>Keine Bücher verfügbar</p>
    </div>
    <div v-else class="books-grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>
  </div>
</template>

<style scoped>
.book-list {
  width: 100%;
}

.no-books {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.no-books p {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin: 0;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 0;
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (max-width: 640px) {
  .books-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
