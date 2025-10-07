<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Book } from '@/types/Book'

const props = defineProps<{
  book: Book
  showActions?: boolean
}>()

const emit = defineEmits<{
  delete: [bookId: string]
}>()

const router = useRouter()

const handleEdit = (event: Event) => {
  event.stopPropagation()
  router.push(`/books/edit/${props.book.id}`)
}

const handleDelete = (event: Event) => {
  event.stopPropagation()
  emit('delete', props.book.id)
}
</script>

<template>
  <article class="book-card">
    <div v-if="showActions" class="action-buttons">
      <button
        class="action-button edit-button"
        @click="handleEdit"
        aria-label="Buch bearbeiten"
        title="Buch bearbeiten"
      >
        ✏️
      </button>
      <button
        class="action-button delete-button"
        @click="handleDelete"
        aria-label="Buch löschen"
        title="Buch löschen"
      >
        🗑️
      </button>
    </div>
    <div class="book-cover">
      <img
        v-if="book.cover"
        :src="book.cover"
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
      <p v-if="book.subtitle" class="book-subtitle">{{ book.subtitle }}</p>
      <p class="book-author">{{ book.author }}</p>
      <div class="book-meta">
        <span v-if="book.publisher" class="book-publisher">{{ book.publisher }}</span>
        <span v-if="book.numPages" class="book-pages">{{ book.numPages }} Seiten</span>
        <span v-if="book.price" class="book-price">{{ book.price }}</span>
      </div>
      <p v-if="book.abstract" class="book-description">
        {{ book.abstract }}
      </p>
      <p v-if="book.isbn" class="book-isbn">ISBN: {{ book.isbn }}</p>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.action-buttons {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.book-card:hover .action-buttons {
  opacity: 1;
}

.action-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  transform: scale(0.95);
}

.action-button:focus-visible {
  outline: 2px solid var(--color-border-hover);
  outline-offset: 2px;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.95);
}

.delete-button:hover {
  color: white;
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

.book-subtitle {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.book-publisher,
.book-pages {
  font-weight: 400;
}

.book-price {
  font-weight: 600;
  color: var(--color-heading);
  font-size: 1rem;
}

.book-isbn {
  margin: 0.5rem 0 0 0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--color-text-muted);
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
