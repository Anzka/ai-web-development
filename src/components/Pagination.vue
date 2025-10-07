<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const maxVisible = props.maxVisiblePages || 7

const visiblePages = computed(() => {
  if (props.totalPages <= maxVisible) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []
  const halfVisible = Math.floor(maxVisible / 2)

  // Immer erste Seite zeigen
  pages.push(1)

  let startPage = Math.max(2, props.currentPage - halfVisible)
  let endPage = Math.min(props.totalPages - 1, props.currentPage + halfVisible)

  // Anpassungen wenn am Anfang oder Ende
  if (props.currentPage <= halfVisible + 1) {
    endPage = maxVisible - 1
  }
  if (props.currentPage >= props.totalPages - halfVisible) {
    startPage = props.totalPages - maxVisible + 2
  }

  // Ellipsis am Anfang
  if (startPage > 2) {
    pages.push('...')
  }

  // Mittlere Seiten
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  // Ellipsis am Ende
  if (endPage < props.totalPages - 1) {
    pages.push('...')
  }

  // Immer letzte Seite zeigen
  if (props.totalPages > 1) {
    pages.push(props.totalPages)
  }

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('pageChange', page)
  }
}

const previousPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1)
  }
}
</script>

<template>
  <nav class="pagination" role="navigation" aria-label="Seitennavigation">
    <button
      class="pagination-button pagination-prev"
      :disabled="currentPage === 1"
      @click="previousPage"
      aria-label="Vorherige Seite"
      type="button"
    >
      <span aria-hidden="true">‹</span>
      <span class="sr-only">Vorherige</span>
    </button>

    <div class="pagination-pages">
      <button
        v-for="(page, index) in visiblePages"
        :key="`page-${index}`"
        class="pagination-button"
        :class="{
          'pagination-active': page === currentPage,
          'pagination-ellipsis': page === '...'
        }"
        :disabled="page === '...'"
        :aria-label="`Seite ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
        type="button"
        @click="typeof page === 'number' ? goToPage(page) : undefined"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="pagination-button pagination-next"
      :disabled="currentPage === totalPages"
      @click="nextPage"
      aria-label="Nächste Seite"
      type="button"
    >
      <span aria-hidden="true">›</span>
      <span class="sr-only">Nächste</span>
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 3rem 0 2rem;
  flex-wrap: wrap;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-button {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-button:hover:not(:disabled):not(.pagination-ellipsis) {
  background: var(--color-background-mute);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.pagination-button:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-button:focus-visible {
  outline: 2px solid var(--color-border-hover);
  outline-offset: 2px;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-active {
  background: var(--color-border-hover);
  border-color: var(--color-border-hover);
  color: white;
  font-weight: 600;
}

.pagination-active:hover {
  transform: none;
}

.pagination-ellipsis {
  cursor: default;
  border-color: transparent;
  background: transparent;
}

.pagination-ellipsis:hover {
  transform: none;
  background: transparent;
  border-color: transparent;
}

.pagination-prev,
.pagination-next {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .pagination {
    gap: 0.375rem;
    margin: 2rem 0 1.5rem;
  }

  .pagination-pages {
    gap: 0.375rem;
  }

  .pagination-button {
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0.375rem 0.625rem;
    font-size: 0.9rem;
  }

  .pagination-prev,
  .pagination-next {
    font-size: 1.25rem;
  }
}
</style>
