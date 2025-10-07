<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Book } from '@/types/Book'

const props = defineProps<{
  book?: Book
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  submit: [book: Partial<Book>]
  cancel: []
}>()

// Form state
const formData = ref({
  title: '',
  subtitle: '',
  author: '',
  publisher: '',
  price: '',
  numPages: undefined as number | undefined,
  isbn: '',
  cover: '',
  abstract: ''
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Initialize form with existing book data
onMounted(() => {
  if (props.book) {
    formData.value = {
      title: props.book.title || '',
      subtitle: props.book.subtitle || '',
      author: props.book.author || '',
      publisher: props.book.publisher || '',
      price: props.book.price || '',
      numPages: props.book.numPages,
      isbn: props.book.isbn || '',
      cover: props.book.cover || '',
      abstract: props.book.abstract || ''
    }
  }
})

const validate = (): boolean => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Titel ist erforderlich'
  }

  if (!formData.value.author.trim()) {
    errors.value.author = 'Autor ist erforderlich'
  }

  if (!formData.value.isbn.trim()) {
    errors.value.isbn = 'ISBN ist erforderlich'
  }

  if (formData.value.cover && !isValidUrl(formData.value.cover)) {
    errors.value.cover = 'Cover muss eine gültige URL sein'
  }

  return Object.keys(errors.value).length === 0
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  const bookData: Partial<Book> = {
    title: formData.value.title.trim(),
    author: formData.value.author.trim(),
    isbn: formData.value.isbn.trim() // ISBN is required
  }

  // Add optional fields only if they have values
  if (formData.value.subtitle) bookData.subtitle = formData.value.subtitle.trim()
  if (formData.value.publisher) bookData.publisher = formData.value.publisher.trim()
  if (formData.value.price) bookData.price = formData.value.price.trim()
  if (formData.value.numPages) bookData.numPages = formData.value.numPages
  if (formData.value.cover) bookData.cover = formData.value.cover.trim()
  if (formData.value.abstract) bookData.abstract = formData.value.abstract.trim()

  try {
    emit('submit', bookData)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const formTitle = computed(() =>
  props.mode === 'create' ? 'Neues Buch hinzufügen' : 'Buch bearbeiten'
)

const submitButtonText = computed(() =>
  props.mode === 'create' ? 'Buch erstellen' : 'Änderungen speichern'
)
</script>

<template>
  <div class="book-form">
    <h2 class="form-title">{{ formTitle }}</h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <div class="form-grid">
        <!-- Title -->
        <div class="form-group full-width">
          <label for="title" class="form-label required">Titel</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            class="form-input"
            :class="{ 'form-input-error': errors.title }"
            placeholder="Titel des Buches eingeben"
            required
          />
          <span v-if="errors.title" class="form-error">{{ errors.title }}</span>
        </div>

        <!-- Subtitle -->
        <div class="form-group full-width">
          <label for="subtitle" class="form-label">Untertitel</label>
          <input
            id="subtitle"
            v-model="formData.subtitle"
            type="text"
            class="form-input"
            placeholder="Untertitel (optional)"
          />
        </div>

        <!-- Author -->
        <div class="form-group">
          <label for="author" class="form-label required">Autor</label>
          <input
            id="author"
            v-model="formData.author"
            type="text"
            class="form-input"
            :class="{ 'form-input-error': errors.author }"
            placeholder="Autor des Buches"
            required
          />
          <span v-if="errors.author" class="form-error">{{ errors.author }}</span>
        </div>

        <!-- Publisher -->
        <div class="form-group">
          <label for="publisher" class="form-label">Verlag</label>
          <input
            id="publisher"
            v-model="formData.publisher"
            type="text"
            class="form-input"
            placeholder="Verlag (optional)"
          />
        </div>

        <!-- ISBN -->
        <div class="form-group">
          <label for="isbn" class="form-label required">ISBN</label>
          <input
            id="isbn"
            v-model="formData.isbn"
            type="text"
            class="form-input"
            :class="{ 'form-input-error': errors.isbn }"
            placeholder="978-0-123456-78-9"
            required
          />
          <span v-if="errors.isbn" class="form-error">{{ errors.isbn }}</span>
        </div>

        <!-- Number of Pages -->
        <div class="form-group">
          <label for="numPages" class="form-label">Seitenzahl</label>
          <input
            id="numPages"
            v-model.number="formData.numPages"
            type="number"
            class="form-input"
            placeholder="320"
            min="1"
          />
        </div>

        <!-- Price -->
        <div class="form-group">
          <label for="price" class="form-label">Preis</label>
          <input
            id="price"
            v-model="formData.price"
            type="text"
            class="form-input"
            placeholder="$29.99"
          />
        </div>

        <!-- Cover URL -->
        <div class="form-group">
          <label for="cover" class="form-label">Cover URL</label>
          <input
            id="cover"
            v-model="formData.cover"
            type="url"
            class="form-input"
            :class="{ 'form-input-error': errors.cover }"
            placeholder="https://example.com/cover.jpg"
          />
          <span v-if="errors.cover" class="form-error">{{ errors.cover }}</span>
        </div>

        <!-- Abstract -->
        <div class="form-group full-width">
          <label for="abstract" class="form-label">Beschreibung</label>
          <textarea
            id="abstract"
            v-model="formData.abstract"
            class="form-textarea"
            rows="5"
            placeholder="Kurze Beschreibung des Buchinhalts..."
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="isSubmitting"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Wird gespeichert...' : submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.book-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-heading);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-heading);
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-background-soft);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px rgba(var(--color-border-hover-rgb, 100, 108, 255), 0.1);
}

.form-input-error {
  border-color: #ef4444;
}

.form-input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-error {
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: -0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-background-soft);
  border-color: var(--color-border);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background-mute);
  border-color: var(--color-border-hover);
}

.btn-primary {
  background: var(--color-border-hover);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .book-form {
    padding: 1.5rem 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
