# Vue.js Coding Guidelines - High Quality Standards

**Version:** 1.0.0
**Last Updated:** 2025-10-07
**Based on:** SOLID Principles, Vue.js Best Practices, Accessibility Standards

---

## 🎯 Core Principles

### 1. SOLID Principles sind PFLICHT

Jede Komponente, jedes Composable und jeder Service MUSS die SOLID-Prinzipien befolgen:

- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### 2. Composition over Inheritance

Nutze Composition API und Composables statt komplexer Vererbungshierarchien.

### 3. Accessibility First

Jede Komponente MUSS barrierefrei sein. ARIA-Attribute und Keyboard-Navigation sind Pflicht, nicht optional.

---

## 📏 SOLID Principles im Detail

### S - Single Responsibility Principle

**Regel:** Eine Komponente/Datei hat genau EINE Verantwortung.

#### ❌ BAD: Zu viele Verantwortlichkeiten

```vue
<!-- BooksView.vue - 500+ Zeilen -->
<script setup lang="ts">
// ❌ API-Calls direkt in der Komponente
const fetchBooks = async () => {
  const response = await fetch('http://localhost:4730/books')
  books.value = await response.json()
}

// ❌ Validierungs-Logik in der View
const validateBook = (book: Book) => {
  if (!book.title) return false
  if (!book.isbn || book.isbn.length < 10) return false
  return true
}

// ❌ Formatierungs-Logik in der View
const formatPrice = (price: string) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(parseFloat(price))
}

// ❌ State-Management
const books = ref<Book[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)

// ... 300 weitere Zeilen
</script>
```

**Probleme:**
- View kennt API-Details
- Validierung nicht wiederverwendbar
- Formatierung nicht testbar
- Zu komplex zum Testen

#### ✅ GOOD: Klare Verantwortungstrennung

```vue
<!-- BooksView.vue - ~80 Zeilen -->
<script setup lang="ts">
import { useBooks } from '@/composables/useBooks'
import { usePagination } from '@/composables/usePagination'
import { useSearch } from '@/composables/useSearch'
import BookList from '@/components/BookList.vue'
import SearchBar from '@/components/SearchBar.vue'
import Pagination from '@/components/Pagination.vue'

// ✅ Klare Zuständigkeiten
const { books, loading, error, fetchBooks } = useBooks()
const { searchQuery, filteredItems } = useSearch(books)
const { currentPage, paginatedItems, totalPages, goToPage } = usePagination(
  filteredItems,
  10
)

onMounted(fetchBooks)
</script>

<template>
  <div class="books-view">
    <SearchBar v-model="searchQuery" />

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :error="error" @retry="fetchBooks" />

    <template v-else>
      <BookList :books="paginatedItems" />
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="goToPage"
      />
    </template>
  </div>
</template>
```

```typescript
// composables/useBooks.ts - Eine Verantwortung: Bücher-Daten verwalten
export function useBooks() {
  const books = ref<Book[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBooks = async () => {
    try {
      loading.value = true
      error.value = null
      books.value = await bookService.getAll() // ✅ Service-Layer
    } catch (e) {
      error.value = handleError(e)
    } finally {
      loading.value = false
    }
  }

  return { books, loading, error, fetchBooks }
}
```

```typescript
// services/BookService.ts - Eine Verantwortung: API-Kommunikation
export class BookService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<Book[]> {
    return this.apiClient.get<Book[]>('/books')
  }

  async getById(id: string): Promise<Book> {
    return this.apiClient.get<Book>(`/books/${id}`)
  }

  async create(book: CreateBookDto): Promise<Book> {
    return this.apiClient.post<Book>('/books', book)
  }
}
```

```typescript
// utils/validators/bookValidator.ts - Eine Verantwortung: Validierung
export function validateBook(book: Partial<Book>): ValidationResult {
  const errors: Record<string, string> = {}

  if (!book.title?.trim()) {
    errors.title = 'Titel ist erforderlich'
  }

  if (!book.isbn || !isValidISBN(book.isbn)) {
    errors.isbn = 'ISBN ist ungültig'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
```

**Vorteile:**
- ✅ Jede Datei hat genau eine Verantwortung
- ✅ Testbar (Unit-Tests für jede Funktion)
- ✅ Wiederverwendbar
- ✅ Wartbar

---

### O - Open/Closed Principle

**Regel:** Offen für Erweiterungen, geschlossen für Modifikationen.

#### ❌ BAD: Hardcoded Konfiguration

```vue
<script setup lang="ts">
// ❌ Grid-Layout ist hardcoded
const gridColumns = 4
</script>

<style>
.books-grid {
  grid-template-columns: repeat(4, 1fr); /* ❌ Hardcoded */
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr); /* ❌ Hardcoded */
  }
}
</style>
```

**Problem:** Neue Layouts erfordern Code-Änderungen.

#### ✅ GOOD: Konfigurierbar und erweiterbar

```vue
<script setup lang="ts">
interface Props {
  columns?: {
    default?: number
    xl?: number
    lg?: number
    md?: number
    sm?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  layout?: 'grid' | 'list' | 'masonry'
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => ({ default: 4, xl: 3, md: 2, sm: 1 }),
  gap: 'xl',
  layout: 'grid'
})

// ✅ Layout-Strategien
const layoutComponents = {
  grid: GridLayout,
  list: ListLayout,
  masonry: MasonryLayout
}
</script>

<template>
  <component
    :is="layoutComponents[layout]"
    :columns="columns"
    :gap="gap"
  >
    <slot />
  </component>
</template>
```

**Verwendung:**
```vue
<!-- Standard -->
<BookList :books="books" />

<!-- Custom Grid -->
<BookList
  :books="books"
  :columns="{ default: 3, md: 2, sm: 1 }"
  gap="lg"
/>

<!-- Listenansicht -->
<BookList :books="books" layout="list" />
```

---

### L - Liskov Substitution Principle

**Regel:** Komponenten müssen durch ihre Subtypen/Alternativen ersetzbar sein.

#### ❌ BAD: Fest gekoppelte Komponenten

```vue
<script setup lang="ts">
import BookCard from './BookCard.vue' // ❌ Konkrete Abhängigkeit
</script>

<template>
  <div class="book-list">
    <BookCard
      v-for="book in books"
      :key="book.id"
      :book="book"
    />
  </div>
</template>
```

**Problem:** Keine alternativen Card-Designs möglich.

#### ✅ GOOD: Slot-basierte Architektur

```vue
<script setup lang="ts">
import type { Book } from '@/types/Book'
import BookCard from './BookCard.vue'

interface Props {
  books: Book[]
}

defineProps<Props>()
</script>

<template>
  <div class="book-list">
    <!-- ✅ Slot mit Fallback -->
    <slot
      v-for="book in books"
      name="book-item"
      :book="book"
    >
      <!-- Fallback: Standard-Komponente -->
      <BookCard :key="book.id" :book="book" />
    </slot>
  </div>
</template>
```

**Verwendung:**
```vue
<!-- Standard: Verwendet BookCard -->
<BookList :books="books" />

<!-- Custom: Verwendet eigene Komponente -->
<BookList :books="books">
  <template #book-item="{ book }">
    <CompactBookCard :book="book" />
  </template>
</BookList>

<!-- Sehr Custom: Eigenes Layout -->
<BookList :books="books">
  <template #book-item="{ book }">
    <div class="custom-layout">
      <img :src="book.cover" />
      <h3>{{ book.title }}</h3>
    </div>
  </template>
</BookList>
```

---

### I - Interface Segregation Principle

**Regel:** Keine Komponente sollte gezwungen werden, von Props abzuhängen, die sie nicht nutzt.

#### ❌ BAD: Überladene Props

```vue
<script setup lang="ts">
interface Props {
  book: Book
  showActions?: boolean
  showCover?: boolean
  showDescription?: boolean
  showPrice?: boolean
  showISBN?: boolean
  showPublisher?: boolean
  showPages?: boolean
  onEdit?: (book: Book) => void
  onDelete?: (book: Book) => void
  onView?: (book: Book) => void
  onShare?: (book: Book) => void
  // ❌ Zu viele Props!
}
</script>
```

**Problem:** Komponente ist überladen, schwer zu nutzen.

#### ✅ GOOD: Fokussierte Interfaces

```vue
<!-- BookCard.vue - Basis-Komponente -->
<script setup lang="ts">
interface Props {
  book: Book
  variant?: 'default' | 'compact' | 'detailed'
}

defineProps<Props>()

// ✅ Events statt Callbacks
const emit = defineEmits<{
  click: [book: Book]
  edit: [book: Book]
  delete: [book: Book]
}>()
</script>
```

```vue
<!-- BookCardActions.vue - Separate Komponente für Aktionen -->
<script setup lang="ts">
interface Props {
  bookId: string
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
  share: []
}>()
</script>
```

**Verwendung:**
```vue
<!-- Einfach: Nur Anzeige -->
<BookCard :book="book" />

<!-- Mit Aktionen: Composable Pattern -->
<BookCard :book="book">
  <template #actions>
    <BookCardActions
      :book-id="book.id"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </template>
</BookCard>
```

---

### D - Dependency Inversion Principle

**Regel:** Abhängigkeiten zu Abstraktionen, nicht zu konkreten Implementierungen.

#### ❌ BAD: Direkte Abhängigkeiten

```vue
<script setup lang="ts">
// ❌ Direkte API-Calls
const fetchBooks = async () => {
  const response = await fetch('http://localhost:4730/books')
  return response.json()
}

// ❌ Direkte LocalStorage-Nutzung
const saveSettings = (settings: Settings) => {
  localStorage.setItem('app-settings', JSON.stringify(settings))
}
</script>
```

**Probleme:**
- Nicht testbar (keine Mocks möglich)
- Nicht austauschbar
- Tight Coupling

#### ✅ GOOD: Dependency Injection

```typescript
// services/interfaces/IBookService.ts
export interface IBookService {
  getAll(): Promise<Book[]>
  getById(id: string): Promise<Book>
  create(book: CreateBookDto): Promise<Book>
  update(id: string, book: UpdateBookDto): Promise<Book>
  delete(id: string): Promise<void>
}
```

```typescript
// services/BookApiService.ts
export class BookApiService implements IBookService {
  constructor(private httpClient: IHttpClient) {}

  async getAll(): Promise<Book[]> {
    return this.httpClient.get<Book[]>('/books')
  }

  // ... weitere Methoden
}
```

```typescript
// services/BookMockService.ts (für Tests/Entwicklung)
export class BookMockService implements IBookService {
  private books: Book[] = MOCK_BOOKS

  async getAll(): Promise<Book[]> {
    return Promise.resolve([...this.books])
  }

  // ... weitere Methoden
}
```

```typescript
// composables/useBooks.ts
import { inject } from 'vue'
import { BOOK_SERVICE_KEY } from '@/services/keys'

export function useBooks() {
  // ✅ Injected Dependency
  const bookService = inject<IBookService>(BOOK_SERVICE_KEY)

  if (!bookService) {
    throw new Error('BookService not provided')
  }

  const books = ref<Book[]>([])
  const loading = ref(false)

  const fetchBooks = async () => {
    loading.value = true
    books.value = await bookService.getAll() // ✅ Abstraktion
    loading.value = false
  }

  return { books, loading, fetchBooks }
}
```

```typescript
// main.ts - Dependency Registration
import { BookApiService } from '@/services/BookApiService'
import { BookMockService } from '@/services/BookMockService'
import { BOOK_SERVICE_KEY } from '@/services/keys'

const app = createApp(App)

// ✅ Umschaltbar per Umgebungsvariable
const bookService = import.meta.env.VITE_USE_MOCK_API
  ? new BookMockService()
  : new BookApiService(httpClient)

app.provide(BOOK_SERVICE_KEY, bookService)
```

**Vorteile:**
- ✅ Einfach testbar (Mock-Service in Tests)
- ✅ Austauschbar (API vs Mock vs LocalStorage)
- ✅ Lose gekoppelt

---

## 🧩 Component Architecture

### Komponenten-Größe

**Regel:** Komponenten sollten maximal 200 Zeilen haben (Script + Template + Style).

#### Größen-Richtlinien:

| Typ | Max. Zeilen | Verantwortung |
|-----|-------------|---------------|
| **Atom** | 50-100 | Einzelnes UI-Element (Button, Input) |
| **Molecule** | 100-150 | Kombination von Atoms (SearchBar, Card) |
| **Organism** | 150-200 | Komplexe Komponente (BookList, Header) |
| **Template** | 80-120 | Layout-Struktur |
| **Page/View** | 50-100 | Orchestrierung von Organisms |

#### ❌ BAD: Zu groß

```vue
<!-- BookView.vue - 500+ Zeilen -->
<script setup lang="ts">
// 200 Zeilen Script
// API-Calls, State, Validierung, Formatierung, etc.
</script>

<template>
  <!-- 200 Zeilen Template -->
  <!-- Header, Search, Filter, List, Pagination, Modals -->
</template>

<style scoped lang="scss">
// 100 Zeilen Styles
</style>
```

#### ✅ GOOD: Modular

```vue
<!-- BookView.vue - 80 Zeilen -->
<script setup lang="ts">
import { useBooks } from '@/composables/useBooks'
import BookHeader from '@/components/BookHeader.vue'
import BookSearch from '@/components/BookSearch.vue'
import BookList from '@/components/BookList.vue'
import BookPagination from '@/components/BookPagination.vue'

const { books, loading, error, fetchBooks } = useBooks()
// ... minimal logic
</script>

<template>
  <div class="book-view">
    <BookHeader />
    <BookSearch v-model="searchQuery" />
    <BookList :books="paginatedBooks" :loading="loading" />
    <BookPagination v-if="totalPages > 1" />
  </div>
</template>

<style scoped lang="scss">
// Nur Layout-Styles
</style>
```

---

### Composables

**Regel:** Composables für wiederverwendbare Logik, nicht für einmalige Funktionen.

#### ❌ BAD: Unnötige Composables

```typescript
// ❌ Zu spezifisch, nicht wiederverwendbar
export function useBookTitleFormatter() {
  const formatTitle = (title: string) => {
    return title.toUpperCase()
  }
  return { formatTitle }
}

// ❌ Zu trivial
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
```

#### ✅ GOOD: Wiederverwendbare Composables

```typescript
// ✅ Generisch und wiederverwendbar
export function usePagination<T>(
  items: Ref<T[]>,
  itemsPerPage: number = 10
) {
  const currentPage = ref(1)

  const totalPages = computed(() =>
    Math.ceil(items.value.length / itemsPerPage)
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return items.value.slice(start, start + itemsPerPage)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => goToPage(currentPage.value + 1)
  const prevPage = () => goToPage(currentPage.value - 1)

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage
  }
}
```

```typescript
// ✅ Feature-basiertes Composable
export function useSearch<T>(
  items: Ref<T[]>,
  searchFields: (keyof T)[]
) {
  const searchQuery = ref('')

  const filteredItems = computed(() => {
    if (!searchQuery.value.trim()) return items.value

    const query = searchQuery.value.toLowerCase()

    return items.value.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return String(value).toLowerCase().includes(query)
      })
    )
  })

  const clearSearch = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    filteredItems,
    clearSearch
  }
}
```

**Verwendung:**
```typescript
// ✅ Composable Komposition
const { books } = useBooks()
const { searchQuery, filteredItems } = useSearch(books, ['title', 'author'])
const { currentPage, paginatedItems, goToPage } = usePagination(filteredItems, 10)
```

---

## ♿ Accessibility Guidelines

**Regel:** Jede Komponente MUSS barrierefrei sein.

### Checklist für jede Komponente:

- [ ] Semantisches HTML (`button` statt `div`, `nav`, `main`, `article`)
- [ ] ARIA-Attribute wo nötig
- [ ] Keyboard-Navigation
- [ ] Focus-Management
- [ ] Screen-Reader-Unterstützung
- [ ] Color-Contrast (WCAG AA minimum)

#### ❌ BAD: Keine Accessibility

```vue
<template>
  <div class="book-list">
    <!-- ❌ Keine semantischen Rollen -->
    <div v-if="books.length === 0">
      <p>Keine Bücher verfügbar</p>
    </div>

    <!-- ❌ Keine ARIA-Labels -->
    <div class="books-grid">
      <div
        v-for="book in books"
        :key="book.id"
        @click="handleClick(book)"
      >
        <!-- ❌ Click auf div, nicht keyboard-accessible -->
        <img :src="book.cover" />
        <h3>{{ book.title }}</h3>
      </div>
    </div>
  </div>
</template>
```

#### ✅ GOOD: Vollständig Accessible

```vue
<template>
  <div
    class="book-list"
    role="region"
    aria-label="Buchsammlung"
  >
    <!-- ✅ Status-Meldung für Screen-Reader -->
    <div
      v-if="books.length === 0"
      class="empty-state"
      role="status"
      aria-live="polite"
    >
      <span class="empty-icon" aria-hidden="true">📚</span>
      <p>Keine Bücher verfügbar</p>
    </div>

    <!-- ✅ Liste mit ARIA-Attributen -->
    <div
      v-else
      class="books-grid"
      role="list"
      :aria-label="`${books.length} Bücher gefunden`"
    >
      <!-- ✅ Semantic button mit Keyboard-Support -->
      <article
        v-for="book in books"
        :key="book.id"
        role="listitem"
        class="book-card"
        tabindex="0"
        :aria-label="`${book.title} von ${book.author}`"
        @click="handleClick(book)"
        @keydown.enter="handleClick(book)"
        @keydown.space.prevent="handleClick(book)"
      >
        <img
          :src="book.cover"
          :alt="`Cover von ${book.title}`"
          loading="lazy"
        />
        <h3>{{ book.title }}</h3>
        <p>{{ book.author }}</p>
      </article>
    </div>
  </div>
</template>
```

### Keyboard-Navigation

**Regel:** Alle interaktiven Elemente müssen per Keyboard bedienbar sein.

```typescript
// composables/useKeyboardNavigation.ts
export function useKeyboardNavigation(
  items: Ref<any[]>,
  onSelect: (item: any) => void
) {
  const focusedIndex = ref(0)

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusedIndex.value = Math.min(
          focusedIndex.value + 1,
          items.value.length - 1
        )
        break

      case 'ArrowUp':
        event.preventDefault()
        focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect(items.value[focusedIndex.value])
        break

      case 'Home':
        event.preventDefault()
        focusedIndex.value = 0
        break

      case 'End':
        event.preventDefault()
        focusedIndex.value = items.value.length - 1
        break
    }
  }

  return {
    focusedIndex,
    handleKeyDown
  }
}
```

---

## 🎨 Styling Guidelines

### SCSS-Struktur

**Regel:** Verwende das Design-System, keine Magic Numbers.

#### ❌ BAD: Magic Numbers

```scss
.book-card {
  padding: 24px; // ❌ Magic Number
  margin-bottom: 16px; // ❌ Magic Number
  border-radius: 8px; // ❌ Magic Number
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // ❌ Magic Number

  &:hover {
    transform: translateY(-4px); // ❌ Magic Number
  }
}
```

#### ✅ GOOD: Design-System

```scss
@use '@/assets/styles/modern-variables' as *;
@use '@/assets/styles/modern-mixins' as *;

.book-card {
  padding: $spacing-xl; // ✅ Design Token
  margin-bottom: $spacing-lg; // ✅ Design Token
  border-radius: $radius-xl; // ✅ Design Token
  box-shadow: $shadow-md; // ✅ Design Token
  transition: all $transition-base $ease-out; // ✅ Design Token

  &:hover {
    @include hover-lift(8px); // ✅ Mixin
  }
}
```

### BEM-Naming (Optional, aber empfohlen)

```scss
// Block
.book-card {
  // Element
  &__cover {
    // ...
  }

  &__content {
    // ...
  }

  &__title {
    // ...
  }

  // Modifier
  &--compact {
    // ...
  }

  &--featured {
    // ...
  }
}
```

---

## 📝 TypeScript Guidelines

### Typen-Sicherheit

**Regel:** Explizite Typen > Type Inference > `any` (niemals!)

#### ❌ BAD: Schwache Typisierung

```typescript
// ❌ any ist verboten!
const fetchData = async (url: string): Promise<any> => {
  const response = await fetch(url)
  return response.json()
}

// ❌ Untyped Props
defineProps({
  items: Array,
  title: String
})

// ❌ Keine Return-Typen
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

#### ✅ GOOD: Strenge Typisierung

```typescript
// ✅ Explizite Typen
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
  const response = await fetch(url)
  return response.json()
}

// ✅ Typed Props
interface Props {
  items: Book[]
  title: string
  showActions?: boolean
}

defineProps<Props>()

// ✅ Explizite Return-Typen
const calculateTotal = (items: Book[]): number => {
  return items.reduce((sum, item) => sum + (item.price || 0), 0)
}
```

### Type Guards

```typescript
// ✅ Type Guards für Runtime-Checks
function isBook(obj: unknown): obj is Book {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'author' in obj
  )
}

// Verwendung
const data: unknown = await response.json()

if (isBook(data)) {
  console.log(data.title) // ✅ Type-safe
}
```

### Utility Types

```typescript
// ✅ Nutze TypeScript Utility Types
type CreateBookDto = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
type UpdateBookDto = Partial<CreateBookDto>
type BookSummary = Pick<Book, 'id' | 'title' | 'author'>

// ✅ Custom Utility Types
type Nullable<T> = T | null
type AsyncData<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}
```

---

## 🧪 Testing Guidelines

**Regel:** Mindestens 80% Code Coverage für Business-Logik.

### Test-Struktur

```
src/
├── components/
│   ├── BookCard.vue
│   └── __tests__/
│       └── BookCard.spec.ts
├── composables/
│   ├── useBooks.ts
│   └── __tests__/
│       └── useBooks.spec.ts
└── services/
    ├── BookService.ts
    └── __tests__/
        └── BookService.spec.ts
```

### Unit Tests

```typescript
// composables/__tests__/useBooks.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBooks } from '../useBooks'
import { bookService } from '@/services/BookService'

vi.mock('@/services/BookService')

describe('useBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch books successfully', async () => {
    const mockBooks = [
      { id: '1', title: 'Book 1', author: 'Author 1' }
    ]

    vi.mocked(bookService.getAll).mockResolvedValue(mockBooks)

    const { books, loading, error, fetchBooks } = useBooks()

    expect(loading.value).toBe(false)

    await fetchBooks()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(books.value).toEqual(mockBooks)
    expect(bookService.getAll).toHaveBeenCalledOnce()
  })

  it('should handle errors', async () => {
    vi.mocked(bookService.getAll).mockRejectedValue(
      new Error('Network error')
    )

    const { books, error, fetchBooks } = useBooks()

    await fetchBooks()

    expect(error.value).toBe('Network error')
    expect(books.value).toEqual([])
  })
})
```

### Component Tests

```typescript
// components/__tests__/BookCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookCard from '../BookCard.vue'

describe('BookCard.vue', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    cover: '/cover.jpg'
  }

  it('should render book information', () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook }
    })

    expect(wrapper.find('.book-title').text()).toBe('Test Book')
    expect(wrapper.find('.book-author').text()).toBe('Test Author')
  })

  it('should emit click event', async () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockBook])
  })

  it('should be accessible', () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook }
    })

    expect(wrapper.attributes('role')).toBe('article')
    expect(wrapper.attributes('aria-label')).toContain('Test Book')
  })
})
```

---

## 📦 File Organization

### Ordnerstruktur

```
src/
├── assets/
│   ├── images/
│   ├── fonts/
│   └── styles/
│       ├── _modern-variables.scss
│       ├── _modern-mixins.scss
│       ├── components/
│       └── views/
├── components/
│   ├── base/           # Atoms (Button, Input, etc.)
│   ├── common/         # Molecules (SearchBar, Card, etc.)
│   ├── layout/         # Organisms (Header, Sidebar, etc.)
│   └── __tests__/
├── composables/
│   ├── useBooks.ts
│   ├── usePagination.ts
│   └── __tests__/
├── views/              # Pages
│   ├── BooksView.vue
│   ├── KanbanView.vue
│   └── __tests__/
├── services/
│   ├── interfaces/
│   ├── BookService.ts
│   ├── ApiClient.ts
│   └── __tests__/
├── types/
│   ├── Book.ts
│   ├── Api.ts
│   └── Kanban.ts
├── utils/
│   ├── validators/
│   ├── formatters/
│   └── helpers/
├── config/
│   ├── kanban.config.ts
│   └── api.config.ts
├── router/
│   └── index.ts
└── main.ts
```

### Import-Reihenfolge

```typescript
// 1. Vue Core
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. Third-Party
import { useI18n } from 'vue-i18n'

// 3. Composables
import { useBooks } from '@/composables/useBooks'
import { usePagination } from '@/composables/usePagination'

// 4. Components
import BookCard from '@/components/BookCard.vue'
import Pagination from '@/components/Pagination.vue'

// 5. Services
import { bookService } from '@/services/BookService'

// 6. Types
import type { Book } from '@/types/Book'

// 7. Utils
import { formatDate } from '@/utils/formatters'

// 8. Styles (am Ende)
import '@/assets/styles/views/books-view.scss'
```

---

## 🔐 Security Guidelines

### XSS-Prevention

```vue
<!-- ❌ BAD: Dangerous -->
<div v-html="book.description" />

<!-- ✅ GOOD: Escaped -->
<div>{{ book.description }}</div>

<!-- ✅ GOOD: Sanitized (wenn HTML nötig) -->
<div v-html="sanitizeHtml(book.description)" />
```

### API-Keys

```typescript
// ❌ BAD: Hardcoded
const API_KEY = 'sk_live_1234567890'

// ✅ GOOD: Environment Variables
const API_KEY = import.meta.env.VITE_API_KEY

// ✅ GOOD: Validated
if (!import.meta.env.VITE_API_KEY) {
  throw new Error('VITE_API_KEY is required')
}
```

---

## ⚡ Performance Guidelines

### Lazy Loading

```typescript
// ✅ Route-based Code Splitting
const routes = [
  {
    path: '/books',
    component: () => import('@/views/BooksView.vue')
  },
  {
    path: '/kanban',
    component: () => import('@/views/KanbanView.vue')
  }
]
```

### Computed vs Methods

```typescript
// ❌ BAD: Method wird bei jedem Render aufgerufen
const getFilteredBooks = () => {
  return books.value.filter(book => book.author === selectedAuthor.value)
}

// ✅ GOOD: Computed wird gecached
const filteredBooks = computed(() => {
  return books.value.filter(book => book.author === selectedAuthor.value)
})
```

### v-for Performance

```vue
<!-- ❌ BAD: Unnötige Re-Renders -->
<div v-for="book in books" :key="Math.random()">

<!-- ✅ GOOD: Stable Keys -->
<div v-for="book in books" :key="book.id">

<!-- ✅ GOOD: Mit v-memo für große Listen -->
<div
  v-for="book in books"
  :key="book.id"
  v-memo="[book.id, book.title]"
>
```

---

## 📚 Code Review Checklist

Vor jedem Commit/PR:

### SOLID
- [ ] Komponente hat genau eine Verantwortung
- [ ] Keine hardcoded Werte, alles konfigurierbar
- [ ] Komponenten sind austauschbar (Slots/Props)
- [ ] Minimale Props-Interfaces
- [ ] Services statt direkte API-Calls

### TypeScript
- [ ] Keine `any` Types
- [ ] Explizite Return-Types
- [ ] Props mit Interface definiert
- [ ] Type Guards wo nötig

### Accessibility
- [ ] Semantisches HTML
- [ ] ARIA-Attribute gesetzt
- [ ] Keyboard-Navigation funktioniert
- [ ] Screen-Reader getestet

### Testing
- [ ] Unit Tests geschrieben
- [ ] Edge Cases getestet
- [ ] Mocks verwendet
- [ ] Coverage > 80%

### Performance
- [ ] Computed statt Methods
- [ ] Lazy Loading für Routes
- [ ] v-memo für große Listen
- [ ] Images lazy loaded

### Code Quality
- [ ] Keine Komponente > 200 Zeilen
- [ ] Design-System verwendet
- [ ] Keine Magic Numbers
- [ ] Imports sortiert

---

## 🎓 Learning Resources

### Empfohlene Bücher
- **"Clean Code"** - Robert C. Martin
- **"Refactoring"** - Martin Fowler
- **"Design Patterns"** - Gang of Four

### Vue.js Ressourcen
- [Vue.js Official Guide](https://vuejs.org/guide/)
- [Vue.js Best Practices](https://vuejs.org/style-guide/)
- [Vue Composition API RFC](https://github.com/vuejs/rfcs)

### SOLID Principles
- [SOLID Principles Explained](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [Clean Code in TypeScript](https://github.com/labs42io/clean-code-typescript)

### Accessibility
- [Vue A11y Guidelines](https://vue-a11y.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## ✅ Quick Reference

### SOLID Checklist
```
✓ Single Responsibility - Komponente < 200 Zeilen
✓ Open/Closed - Props für Konfiguration
✓ Liskov Substitution - Slots statt hardcoded Components
✓ Interface Segregation - Minimale Props
✓ Dependency Inversion - Services mit Interfaces
```

### Component Checklist
```
✓ TypeScript mit expliziten Types
✓ Props Interface definiert
✓ Emits typisiert
✓ ARIA-Attribute gesetzt
✓ Keyboard-Navigation
✓ Design-System verwendet
✓ Tests geschrieben (>80% Coverage)
```

### File Size Limits
```
✓ Komponente: < 200 Zeilen
✓ Composable: < 150 Zeilen
✓ Service: < 200 Zeilen
✓ Utility: < 100 Zeilen
```

---

**Diese Guidelines sind verpflichtend für alle neuen Features und Refactorings.**

Bei Fragen oder Unklarheiten: Siehe Refactoring-Dokumentation oder frage das Team.

---

**Version History:**
- v1.0.0 (2025-10-07): Initial Guidelines basierend auf BookList und KanbanView Refactorings
