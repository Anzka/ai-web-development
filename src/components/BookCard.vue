<script setup lang="ts">
import { useRouter } from 'vue-router'
import ActionButton from './ActionButton.vue'
import LazyImage from './LazyImage.vue'
import type { Book } from '@/types/Book'

const props = defineProps<{
  book: Book
  showActions?: boolean
}>()

const emit = defineEmits<{
  delete: [bookId: string]
}>()

const router = useRouter()

const handleEdit = (event: MouseEvent) => {
  event.stopPropagation()
  router.push(`/books/edit/${props.book.id}`)
}

const handleDelete = (event: MouseEvent) => {
  event.stopPropagation()
  emit('delete', props.book.id)
}
</script>

<template>
  <article class="book-card">
    <div v-if="showActions" class="action-buttons">
      <ActionButton icon="✏️" label="Buch bearbeiten" variant="primary" @click="handleEdit" />
      <ActionButton icon="🗑️" label="Buch löschen" variant="danger" @click="handleDelete" />
    </div>
    <div class="book-cover">
      <LazyImage :src="book.cover" :alt="`Cover von ${book.title}`" fallback-icon="📚" />
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
    </div>K
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/components/modern-book-card';
</style>
