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

<style scoped lang="scss">
@use '@/assets/styles/modern-variables' as *;
@use '@/assets/styles/modern-mixins' as *;

.pagination {
  @include flex-center;
  gap: $spacing-sm;
  margin: $spacing-3xl 0 $spacing-2xl;
  flex-wrap: wrap;
  @include fade-in(500ms, 300ms);
}

.pagination-pages {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-button {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: $spacing-sm $spacing-md;
  border: 2px solid transparent;
  background: $color-white;
  color: $color-gray-700;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base $ease-out;
  @include flex-center;
  box-shadow: $shadow-sm;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: $gradient-primary;
    opacity: 0;
    transition: opacity $transition-base;
  }

  &:hover:not(:disabled):not(.pagination-ellipsis) {
    transform: translateY(-3px) scale(1.05);
    box-shadow: $shadow-md;
    color: $color-primary;

    &::before {
      opacity: 0.1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
  }

  @include focus-visible($color-primary);

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: $shadow-xs;
  }
}

.pagination-active {
  background: $gradient-primary;
  color: $color-white;
  font-weight: $font-weight-bold;
  box-shadow: $shadow-primary;

  &::before {
    opacity: 0;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: $shadow-primary, $shadow-glow;
  }
}

.pagination-ellipsis {
  cursor: default;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  color: $color-gray-400;

  &:hover {
    transform: none;
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    color: $color-gray-400;
  }
}

.pagination-prev,
.pagination-next {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;

  &:hover:not(:disabled) {
    &::before {
      opacity: 0.15;
    }
  }
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
@include respond-to('sm') {
  .pagination {
    gap: $spacing-xs;
    margin: $spacing-2xl 0 $spacing-xl;
  }

  .pagination-pages {
    gap: $spacing-xs;
  }

  .pagination-button {
    min-width: 2.25rem;
    height: 2.25rem;
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }

  .pagination-prev,
  .pagination-next {
    font-size: $font-size-xl;
  }
}
</style>
