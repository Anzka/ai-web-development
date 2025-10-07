<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import BookForm from '@/components/BookForm.vue'
import type { Book } from '@/types/Book'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const book = ref<Book | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const bookId = route.params.id as string

onMounted(async () => {
  try {
    loading.value = true
    const response = await fetch(`http://localhost:4730/books/${bookId}`)

    if (!response.ok) {
      throw new Error('Buch nicht gefunden')
    }

    book.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Fehler beim Laden des Buches'
    toast.error(error.value)
    console.error('Error loading book:', e)
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (bookData: Partial<Book>) => {
  try {
    const response = await fetch(`http://localhost:4730/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...book.value,
        ...bookData
      })
    })

    if (!response.ok) {
      throw new Error('Fehler beim Aktualisieren des Buches')
    }

    toast.success('Buch erfolgreich aktualisiert!')
    router.push('/books')
  } catch (error) {
    console.error('Error updating book:', error)
    toast.error('Fehler beim Aktualisieren des Buches. Bitte versuchen Sie es erneut.')
  }
}

const handleCancel = () => {
  router.push('/books')
}
</script>

<template>
  <main class="edit-book-view">
    <div class="container">
      <div v-if="loading" class="message">
        <div class="spinner"></div>
        <p>Buch wird geladen...</p>
      </div>

      <div v-else-if="error" class="message error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="router.push('/books')" class="btn-back">Zurück zur Liste</button>
      </div>

      <BookForm
        v-else-if="book"
        mode="edit"
        :book="book"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </main>
</template>

<style scoped>
.edit-book-view {
  min-height: calc(100vh - 60px);
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

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

.message.error p {
  color: #ef4444;
  font-weight: 500;
}

.error-icon {
  font-size: 3rem;
  opacity: 0.7;
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

.btn-back {
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

.btn-back:hover {
  background: var(--color-background-mute);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}
</style>
