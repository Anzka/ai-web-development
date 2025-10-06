<script setup lang="ts">
import type { Book } from '@/types/Book'

defineProps<{
  book: Book
}>()
</script>

<template>
  <article class="book-card">
    <div class="book-cover">
      <img
        v-if="book.coverUrl"
        :src="book.coverUrl"
        :alt="`Cover von ${book.title}`"
        class="cover-image"
        loading="lazy"
      />
      <div v-else class="cover-placeholder">
        <span class="book-icon">📚</span>
      </div>
    </div>
    <div class="book-content">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      <div class="book-meta">
        <span class="book-year">{{ book.year }}</span>
        <span v-if="book.isbn" class="book-isbn">ISBN: {{ book.isbn }}</span>
      </div>
      <p v-if="book.description" class="book-description">
        {{ book.description }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.book-cover {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: var(--color-background-mute);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--color-background-mute) 0%,
    var(--color-border) 100%
  );
}

.book-icon {
  font-size: 4.5rem;
  opacity: 0.5;
}

.book-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.book-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
  font-style: italic;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.book-year {
  font-weight: 500;
}

.book-isbn {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
}

.book-description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .book-cover {
    height: 220px;
  }

  .book-content {
    padding: 1.25rem;
  }

  .book-title {
    font-size: 1.125rem;
  }
}
</style>
