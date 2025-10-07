<script setup lang="ts">
import type { Book } from '@/types/Book'
import BookCard from './BookCard.vue'

defineProps<{
  books: Book[]
  showActions?: boolean
}>()

const emit = defineEmits<{
  delete: [bookId: string]
}>()

const handleDelete = (bookId: string) => {
  emit('delete', bookId)
}
</script>

<template>
  <div class="book-list">
    <div v-if="books.length === 0" class="no-books">
      <span class="empty-icon">📚</span>
      <p>Keine Bücher verfügbar</p>
    </div>
    <div v-else class="books-grid">
      <BookCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        :show-actions="showActions"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/components/book-list';
</style>
