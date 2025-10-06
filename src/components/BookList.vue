<script setup lang="ts">
import type { Book } from '@/types/Book'

defineProps<{
  books: Book[]
}>()
</script>

<template>
  <div class="book-list">
    <div v-if="books.length === 0" class="no-books">No books available</div>
    <div v-else class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <div class="book-cover">
          <img
            v-if="book.coverUrl"
            :src="book.coverUrl"
            :alt="`${book.title} cover`"
            class="cover-image"
          />
          <div v-else class="cover-placeholder">
            <span class="book-icon">📚</span>
          </div>
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">by {{ book.author }}</p>
          <p class="book-year">{{ book.year }}</p>
          <p v-if="book.description" class="book-description">{{ book.description }}</p>
          <p v-if="book.isbn" class="book-isbn">ISBN: {{ book.isbn }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-list {
  padding: 2rem 0;
}

.no-books {
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-text-muted);
  padding: 3rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.book-card {
  background: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--color-background-mute);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-background-mute) 0%, var(--color-border) 100%);
}

.book-icon {
  font-size: 4rem;
  opacity: 0.6;
}

.book-info {
  padding: 1.5rem;
}

.book-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--color-heading);
  line-height: 1.3;
}

.book-author {
  margin: 0 0 0.25rem 0;
  font-style: italic;
  color: var(--color-text);
}

.book-year {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.book-description {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text);
}

.book-isbn {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-family: monospace;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
