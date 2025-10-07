<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import BookForm from '@/components/BookForm.vue'
import type { Book } from '@/types/Book'

const router = useRouter()
const toast = useToast()

const handleSubmit = async (bookData: Partial<Book>) => {
  try {
    // Ensure title and isbn are present (required fields)
    if (!bookData.title || !bookData.isbn) {
      toast.error('Titel und ISBN sind Pflichtfelder!')
      return
    }

    const response = await fetch('http://localhost:4730/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...bookData,
        userId: 1 // Default user ID
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', errorText)
      throw new Error('Fehler beim Erstellen des Buches')
    }

    const createdBook = await response.json()
    console.log('Book created successfully:', createdBook)

    // Show success message
    toast.success('Buch erfolgreich erstellt!')
    router.push('/books')
  } catch (error) {
    console.error('Error creating book:', error)
    toast.error('Fehler beim Erstellen des Buches. Bitte versuchen Sie es erneut.')
  }
}

const handleCancel = () => {
  router.push('/books')
}
</script>

<template>
  <main class="add-book-view">
    <div class="container">
      <BookForm mode="create" @submit="handleSubmit" @cancel="handleCancel" />
    </div>
  </main>
</template>

<style scoped>
.add-book-view {
  min-height: calc(100vh - 60px);
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
