# Refactoring-Analyse: KanbanView.vue

**Datum:** 2025-10-07
**Komponente:** `src/views/KanbanView.vue`
**Analysiert von:** Vue.js Expert (SOLID-Prinzipien)

---

## 📊 Executive Summary

Die `KanbanView.vue` ist eine monolithische View-Komponente mit 432 Zeilen Code, die mehrere Verantwortlichkeiten vermischt: API-Logik, State-Management, UI-Rendering und Drag-and-Drop-Logik. Die Komponente verletzt signifikant das Single Responsibility Principle und ist schwer testbar, wartbar und wiederverwendbar.

**Gesamtbewertung:** 🔴 Hohe Priorität
**SOLID-Score:** 1/5 Prinzipien eingehalten

---

## 🔴 SOLID-Prinzipien: Verletzungen & Probleme

### 1. Single Responsibility Principle (SRP)
**Status:** 🔴 **MASSIV VERLETZT**

#### Probleme:
Die Komponente hat mindestens **6 verschiedene Verantwortlichkeiten**:

1. **API-Kommunikation** (Zeile 20-37)
   ```typescript
   const fetchBooks = async () => {
     const response = await fetch('http://localhost:4730/books')
     // ...
   }
   ```

2. **State-Management** (Zeile 12-17, 40-54)
   ```typescript
   const bookStatuses = useLocalStorage<Record<string, KanbanColumn>>('book-kanban-statuses', {})
   const kanbanBooks = computed((): KanbanBook[] => { /* ... */ })
   ```

3. **Business-Logik** (Zeile 48-59)
   ```typescript
   const getBooksByStatus = (status: KanbanColumn) => { /* ... */ }
   const moveBook = (bookId: string, newStatus: KanbanColumn) => { /* ... */ }
   ```

4. **Drag-and-Drop-Steuerung** (Zeile 62-78)
   ```typescript
   const handleDragStart = (bookId: string) => { /* ... */ }
   const handleDrop = (event: DragEvent, targetStatus: KanbanColumn) => { /* ... */ }
   ```

5. **UI-Konfiguration** (Zeile 80-99)
   ```typescript
   const columns = [{ id: 'want-to-read', title: '...', icon: '...' }]
   ```

6. **UI-Rendering** (Zeile 106-175 + 177-431)
   - Template-Logik
   - Styling

#### Konsequenzen:
- ❌ Komponente schwer zu testen (432 Zeilen!)
- ❌ Änderungen an einer Funktionalität riskieren Bugs in anderen
- ❌ Code nicht wiederverwendbar
- ❌ Schwierig zu verstehen und zu warten

#### Refactoring:

**Schritt 1: Extrahieren in Composables**

```typescript
// composables/useKanbanData.ts
import { ref, computed } from 'vue'
import type { Book } from '@/types/Book'
import type { KanbanColumn, KanbanBook } from '@/types/Kanban'

export function useKanbanData() {
  const allBooks = ref<Book[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBooks = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch('http://localhost:4730/books')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      allBooks.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Bücher konnten nicht geladen werden'
      console.error('Error fetching books:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    allBooks,
    loading,
    error,
    fetchBooks
  }
}
```

```typescript
// composables/useKanbanBoard.ts
import { computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Book } from '@/types/Book'
import type { KanbanColumn, KanbanBook } from '@/types/Kanban'

export function useKanbanBoard(books: Ref<Book[]>) {
  const bookStatuses = useLocalStorage<Record<string, KanbanColumn>>(
    'book-kanban-statuses',
    {}
  )

  const kanbanBooks = computed((): KanbanBook[] => {
    return books.value.map((book) => ({
      ...book,
      status: bookStatuses.value[book.id] || 'want-to-read'
    }))
  })

  const getBooksByStatus = (status: KanbanColumn) => {
    return kanbanBooks.value.filter((book) => book.status === status)
  }

  const moveBook = (bookId: string, newStatus: KanbanColumn) => {
    bookStatuses.value[bookId] = newStatus
  }

  const wantToReadBooks = computed(() => getBooksByStatus('want-to-read'))
  const readingBooks = computed(() => getBooksByStatus('reading'))
  const finishedBooks = computed(() => getBooksByStatus('finished'))

  return {
    bookStatuses,
    kanbanBooks,
    getBooksByStatus,
    moveBook,
    wantToReadBooks,
    readingBooks,
    finishedBooks
  }
}
```

```typescript
// composables/useDragAndDrop.ts
import { ref } from 'vue'
import type { KanbanColumn } from '@/types/Kanban'

export function useDragAndDrop(
  onDrop: (bookId: string, targetStatus: KanbanColumn) => void
) {
  const draggedBookId = ref<string | null>(null)

  const handleDragStart = (bookId: string) => {
    draggedBookId.value = bookId
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent, targetStatus: KanbanColumn) => {
    event.preventDefault()
    if (draggedBookId.value) {
      onDrop(draggedBookId.value, targetStatus)
      draggedBookId.value = null
    }
  }

  return {
    draggedBookId,
    handleDragStart,
    handleDragOver,
    handleDrop
  }
}
```

**Schritt 2: Extrahieren in Komponenten**

```vue
<!-- components/KanbanColumn.vue -->
<script setup lang="ts">
import type { KanbanBook, KanbanColumn } from '@/types/Kanban'
import KanbanCard from './KanbanCard.vue'

interface Props {
  id: KanbanColumn
  title: string
  icon: string
  books: KanbanBook[]
}

defineProps<Props>()

const emit = defineEmits<{
  drop: [event: DragEvent]
  dragOver: [event: DragEvent]
  cardDragStart: [bookId: string]
}>()
</script>

<template>
  <div
    class="kanban-column"
    @dragover="emit('dragOver', $event)"
    @drop="emit('drop', $event)"
  >
    <div class="column-header">
      <span class="column-icon">{{ icon }}</span>
      <h2 class="column-title">{{ title }}</h2>
      <span class="column-count">{{ books.length }}</span>
    </div>

    <div class="column-content">
      <KanbanCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        @drag-start="emit('cardDragStart', book.id)"
      />

      <div v-if="books.length === 0" class="empty-column">
        <slot name="empty">
          <p>Ziehen Sie Bücher hierher</p>
        </slot>
      </div>
    </div>
  </div>
</template>
```

```vue
<!-- components/KanbanCard.vue -->
<script setup lang="ts">
import type { KanbanBook } from '@/types/Kanban'
import LazyImage from './LazyImage.vue'

interface Props {
  book: KanbanBook
}

defineProps<Props>()

const emit = defineEmits<{
  dragStart: []
}>()
</script>

<template>
  <div
    class="kanban-card"
    draggable="true"
    @dragstart="emit('dragStart')"
  >
    <div class="card-cover">
      <LazyImage
        v-if="book.cover"
        :src="book.cover"
        :alt="book.title"
        fallback-icon="📚"
      />
      <div v-else class="cover-placeholder">
        <span class="book-icon">📚</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ book.title }}</h3>
      <p class="card-author">{{ book.author }}</p>
      <div v-if="book.numPages" class="card-meta">
        {{ book.numPages }} Seiten
      </div>
    </div>
  </div>
</template>
```

**Schritt 3: Vereinfachte KanbanView**

```vue
<!-- views/KanbanView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useKanbanData } from '@/composables/useKanbanData'
import { useKanbanBoard } from '@/composables/useKanbanBoard'
import { useDragAndDrop } from '@/composables/useDragAndDrop'
import KanbanColumn from '@/components/KanbanColumn.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const { allBooks, loading, error, fetchBooks } = useKanbanData()

const {
  moveBook,
  wantToReadBooks,
  readingBooks,
  finishedBooks
} = useKanbanBoard(allBooks)

const {
  handleDragStart,
  handleDragOver,
  handleDrop
} = useDragAndDrop(moveBook)

const columns = [
  {
    id: 'want-to-read',
    title: 'Möchte ich lesen',
    icon: '📚',
    books: wantToReadBooks
  },
  {
    id: 'reading',
    title: 'Lese ich gerade',
    icon: '📖',
    books: readingBooks
  },
  {
    id: 'finished',
    title: 'Fertig gelesen',
    icon: '✅',
    books: finishedBooks
  }
]

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <main class="kanban-view">
    <div class="kanban-container">
      <header class="kanban-header">
        <h1>Mein Lese-Board</h1>
        <p class="subtitle">Verwalten Sie Ihre Bücher per Drag & Drop</p>
      </header>

      <LoadingState v-if="loading" message="Bücher werden geladen..." />

      <ErrorState
        v-else-if="error"
        :message="error"
        @retry="fetchBooks"
      />

      <div v-else class="kanban-board">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :id="column.id"
          :title="column.title"
          :icon="column.icon"
          :books="column.books.value"
          @drag-over="handleDragOver"
          @drop="(e) => handleDrop(e, column.id)"
          @card-drag-start="handleDragStart"
        />
      </div>
    </div>
  </main>
</template>
```

**Reduziert von 432 Zeilen auf ~70 Zeilen!**

**Priorität:** 🔴 Hoch
**Aufwand:** 6-8 Stunden

---

### 2. Open/Closed Principle (OCP)
**Status:** 🔴 **VERLETZT**

#### Probleme:

1. **Hardcoded Spalten-Konfiguration** (Zeile 80-99)
   ```typescript
   const columns = [
     { id: 'want-to-read', title: 'Möchte ich lesen', icon: '📚' }
     // ...
   ]
   ```
   - Neue Spalten erfordern Code-Änderungen
   - Keine dynamische Konfiguration

2. **Hardcoded API-Endpoint** (Zeile 24)
   ```typescript
   const response = await fetch('http://localhost:4730/books')
   ```
   - Keine Umgebungskonfiguration
   - Nicht testbar

3. **Hardcoded Status-Typen** (Zeile 6)
   ```typescript
   type KanbanColumn = 'want-to-read' | 'reading' | 'finished'
   ```

#### Refactoring:

```typescript
// config/kanban.config.ts
export interface ColumnConfig {
  id: string
  title: string
  icon: string
  color?: string
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'want-to-read',
    title: 'Möchte ich lesen',
    icon: '📚',
    color: '#6366f1'
  },
  {
    id: 'reading',
    title: 'Lese ich gerade',
    icon: '📖',
    color: '#ec4899'
  },
  {
    id: 'finished',
    title: 'Fertig gelesen',
    icon: '✅',
    color: '#10b981'
  }
]
```

```vue
<script setup lang="ts">
import { DEFAULT_COLUMNS } from '@/config/kanban.config'

// Jetzt konfigurierbar!
const columns = ref(DEFAULT_COLUMNS)
</script>
```

**Priorität:** 🟡 Mittel
**Aufwand:** 2 Stunden

---

### 3. Liskov Substitution Principle (LSP)
**Status:** ⚠️ **TEILWEISE VERLETZT**

#### Problem:
Die View ist monolithisch und nicht durch alternative Implementierungen ersetzbar.

#### Refactoring:
Nach dem SRP-Refactoring werden die einzelnen Komponenten austauschbar:

```vue
<!-- Alternative Card-Darstellung -->
<KanbanColumn :card-component="CompactKanbanCard" />

<!-- Alternative Spalten-Darstellung -->
<component :is="ListColumn" v-if="viewMode === 'list'" />
<component :is="KanbanColumn" v-else />
```

**Priorität:** 🟢 Niedrig (wird durch SRP-Fix gelöst)
**Aufwand:** Inkludiert in SRP-Refactoring

---

### 4. Interface Segregation Principle (ISP)
**Status:** ✅ **EINGEHALTEN**

Die Komponente hat keine externe Schnittstelle (keine Props/Emits), da es eine View ist.

---

### 5. Dependency Inversion Principle (DIP)
**Status:** 🔴 **VERLETZT**

#### Probleme:

1. **Direkte API-Calls** (Zeile 24)
   ```typescript
   const response = await fetch('http://localhost:4730/books')
   ```
   - View kennt API-Details
   - Keine Abstraktionsschicht

2. **Direkte LocalStorage-Nutzung** (Zeile 17)
   ```typescript
   const bookStatuses = useLocalStorage<Record<string, KanbanColumn>>(
     'book-kanban-statuses',
     {}
   )
   ```

#### Refactoring:

**API-Service-Schicht**

```typescript
// services/BookService.ts
export interface IBookService {
  getAll(): Promise<Book[]>
  getById(id: string): Promise<Book>
  create(book: Partial<Book>): Promise<Book>
  update(id: string, book: Partial<Book>): Promise<Book>
  delete(id: string): Promise<void>
}

export class BookApiService implements IBookService {
  constructor(private baseUrl: string) {}

  async getAll(): Promise<Book[]> {
    const response = await fetch(`${this.baseUrl}/books`)
    if (!response.ok) throw new Error('Failed to fetch books')
    return response.json()
  }

  // ... weitere Methoden
}

// Singleton-Instance
export const bookService = new BookApiService(
  import.meta.env.VITE_API_URL || 'http://localhost:4730'
)
```

**Storage-Service-Schicht**

```typescript
// services/KanbanStorageService.ts
import type { KanbanColumn } from '@/types/Kanban'

export interface IKanbanStorage {
  getBookStatus(bookId: string): KanbanColumn | null
  setBookStatus(bookId: string, status: KanbanColumn): void
  getAllStatuses(): Record<string, KanbanColumn>
}

export class LocalStorageKanbanService implements IKanbanStorage {
  private readonly STORAGE_KEY = 'book-kanban-statuses'

  getBookStatus(bookId: string): KanbanColumn | null {
    const statuses = this.getAllStatuses()
    return statuses[bookId] || null
  }

  setBookStatus(bookId: string, status: KanbanColumn): void {
    const statuses = this.getAllStatuses()
    statuses[bookId] = status
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(statuses))
  }

  getAllStatuses(): Record<string, KanbanColumn> {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  }
}

export const kanbanStorage = new LocalStorageKanbanService()
```

**Verwendung in Composable**

```typescript
// composables/useKanbanData.ts
import { bookService } from '@/services/BookService'
import { kanbanStorage } from '@/services/KanbanStorageService'

export function useKanbanData() {
  const allBooks = ref<Book[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBooks = async () => {
    try {
      loading.value = true
      error.value = null
      allBooks.value = await bookService.getAll() // ✅ Abstrahiert
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fehler beim Laden'
    } finally {
      loading.value = false
    }
  }

  return { allBooks, loading, error, fetchBooks }
}
```

**Vorteile:**
- ✅ Testbar durch Dependency Injection
- ✅ API-Änderungen nur an einer Stelle
- ✅ Leicht durch alternative Services ersetzbar
- ✅ Mock-Services für Tests

**Priorität:** 🔴 Hoch
**Aufwand:** 4-5 Stunden

---

## 🐛 Konkrete Code-Probleme

### Problem 1: Fehlende TypeScript-Typen
**Severity:** 🟡 Mittel

```typescript
// ❌ Inline-Type-Definition
interface KanbanBook extends Book {
  status: KanbanColumn
}
```

**Fix:**
```typescript
// types/Kanban.ts
export type KanbanColumn = 'want-to-read' | 'reading' | 'finished'

export interface KanbanBook extends Book {
  status: KanbanColumn
}

export interface ColumnConfig {
  id: KanbanColumn
  title: string
  icon: string
  books: ComputedRef<KanbanBook[]>
}
```

**Priorität:** 🟡 Mittel
**Aufwand:** 30 Minuten

---

### Problem 2: Fehlende Accessibility
**Severity:** 🟡 Mittel

```vue
<!-- ❌ Keine ARIA-Attribute -->
<div class="kanban-column">
  <h2 class="column-title">{{ column.title }}</h2>
  <!-- ... -->
</div>
```

**Fix:**
```vue
<div
  class="kanban-column"
  role="region"
  :aria-label="`${column.title} - ${column.books.value.length} Bücher`"
  @dragover="handleDragOver"
  @drop="(e) => handleDrop(e, column.id)"
>
  <div class="column-header">
    <span class="column-icon" aria-hidden="true">{{ column.icon }}</span>
    <h2 class="column-title" :id="`column-${column.id}`">
      {{ column.title }}
    </h2>
    <span
      class="column-count"
      :aria-label="`${column.books.value.length} Bücher in dieser Spalte`"
    >
      {{ column.books.value.length }}
    </span>
  </div>

  <div
    class="column-content"
    role="list"
    :aria-labelledby="`column-${column.id}`"
  >
    <div
      v-for="book in column.books.value"
      :key="book.id"
      class="kanban-card"
      role="listitem"
      draggable="true"
      :aria-label="`${book.title} von ${book.author}`"
      @dragstart="handleDragStart(book.id)"
    >
      <!-- ... -->
    </div>
  </div>
</div>
```

**Keyboard-Navigation hinzufügen:**
```typescript
// composables/useKanbanKeyboard.ts
export function useKanbanKeyboard(
  moveBook: (bookId: string, status: KanbanColumn) => void
) {
  const focusedBookId = ref<string | null>(null)
  const focusedColumn = ref<KanbanColumn>('want-to-read')

  const handleKeyDown = (event: KeyboardEvent, bookId: string, currentStatus: KanbanColumn) => {
    switch (event.key) {
      case 'ArrowLeft':
        // Bewege Buch nach links
        if (currentStatus === 'reading') {
          moveBook(bookId, 'want-to-read')
        } else if (currentStatus === 'finished') {
          moveBook(bookId, 'reading')
        }
        break
      case 'ArrowRight':
        // Bewege Buch nach rechts
        if (currentStatus === 'want-to-read') {
          moveBook(bookId, 'reading')
        } else if (currentStatus === 'reading') {
          moveBook(bookId, 'finished')
        }
        break
    }
  }

  return { handleKeyDown }
}
```

**Priorität:** 🟡 Mittel
**Aufwand:** 2-3 Stunden

---

### Problem 3: Keine Optimistic Updates
**Severity:** 🟢 Niedrig

**Aktuelles Verhalten:**
```typescript
const moveBook = (bookId: string, newStatus: KanbanColumn) => {
  bookStatuses.value[bookId] = newStatus // Nur lokal
}
```

**Problem:** Änderungen werden nicht an Backend gesendet.

**Fix:**
```typescript
// composables/useKanbanBoard.ts
export function useKanbanBoard(books: Ref<Book[]>) {
  const bookStatuses = useLocalStorage<Record<string, KanbanColumn>>(
    'book-kanban-statuses',
    {}
  )

  const moveBook = async (bookId: string, newStatus: KanbanColumn) => {
    // Optimistic Update
    const previousStatus = bookStatuses.value[bookId]
    bookStatuses.value[bookId] = newStatus

    try {
      // Backend-Update
      await bookService.updateStatus(bookId, newStatus)
    } catch (error) {
      // Rollback bei Fehler
      if (previousStatus) {
        bookStatuses.value[bookId] = previousStatus
      } else {
        delete bookStatuses.value[bookId]
      }

      // Toast-Notification
      toast.error('Fehler beim Verschieben des Buches')
    }
  }

  return { moveBook }
}
```

**Priorität:** 🟡 Mittel
**Aufwand:** 1-2 Stunden

---

### Problem 4: Hardcoded Strings (i18n fehlt)
**Severity:** 🟢 Niedrig

```typescript
const columns = [
  { id: 'want-to-read', title: 'Möchte ich lesen', icon: '📚' }
  // ❌ Hardcoded Deutsch
]
```

**Fix:**
```typescript
// i18n/de.json
{
  "kanban": {
    "title": "Mein Lese-Board",
    "subtitle": "Verwalten Sie Ihre Bücher per Drag & Drop",
    "columns": {
      "wantToRead": "Möchte ich lesen",
      "reading": "Lese ich gerade",
      "finished": "Fertig gelesen"
    },
    "emptyColumn": "Ziehen Sie Bücher hierher",
    "loading": "Bücher werden geladen...",
    "error": "Fehler beim Laden der Bücher"
  }
}
```

```typescript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const columns = [
  {
    id: 'want-to-read',
    title: t('kanban.columns.wantToRead'),
    icon: '📚'
  }
  // ...
]
```

**Priorität:** 🟢 Niedrig
**Aufwand:** 1 Stunde

---

### Problem 5: Fehlende Animationen
**Severity:** 🟢 Niedrig

**Aktuell:** Keine Animationen beim Verschieben von Karten.

**Fix mit Vue Transitions:**
```vue
<template>
  <div class="column-content">
    <TransitionGroup name="kanban-card" tag="div">
      <KanbanCard
        v-for="book in column.books.value"
        :key="book.id"
        :book="book"
        @drag-start="handleDragStart(book.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style>
.kanban-card-move {
  transition: transform 0.3s ease;
}

.kanban-card-enter-active,
.kanban-card-leave-active {
  transition: all 0.3s ease;
}

.kanban-card-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.kanban-card-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
```

**Priorität:** 🟢 Niedrig
**Aufwand:** 1 Stunde

---

### Problem 6: Keine Touch-Unterstützung
**Severity:** 🟡 Mittel

**Problem:** Drag-and-Drop funktioniert nicht auf Touch-Geräten.

**Fix:**
```typescript
// composables/useDragAndDrop.ts
export function useDragAndDrop(
  onDrop: (bookId: string, targetStatus: KanbanColumn) => void
) {
  const draggedBookId = ref<string | null>(null)
  const touchStartY = ref(0)

  // Desktop: Drag Events
  const handleDragStart = (bookId: string) => {
    draggedBookId.value = bookId
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent, targetStatus: KanbanColumn) => {
    event.preventDefault()
    if (draggedBookId.value) {
      onDrop(draggedBookId.value, targetStatus)
      draggedBookId.value = null
    }
  }

  // Mobile: Touch Events
  const handleTouchStart = (event: TouchEvent, bookId: string) => {
    draggedBookId.value = bookId
    touchStartY.value = event.touches[0].clientY
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (!draggedBookId.value) return
    event.preventDefault()

    // Visual feedback hier implementieren
  }

  const handleTouchEnd = (event: TouchEvent, targetStatus: KanbanColumn) => {
    if (draggedBookId.value) {
      onDrop(draggedBookId.value, targetStatus)
      draggedBookId.value = null
    }
  }

  return {
    draggedBookId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
```

**Alternative:** Library wie `@vueuse/gesture` verwenden.

**Priorität:** 🟡 Mittel
**Aufwand:** 3-4 Stunden (manuell) oder 1 Stunde (mit Library)

---

### Problem 7: Keine Error-Boundary
**Severity:** 🟡 Mittel

**Problem:** Wenn eine Karte fehlschlägt, crashed die ganze View.

**Fix:**
```vue
<!-- components/ErrorBoundary.vue -->
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // Verhindert Fehler-Propagation
})
</script>

<template>
  <div v-if="error" class="error-boundary">
    <h3>Etwas ist schiefgelaufen</h3>
    <p>{{ error.message }}</p>
    <button @click="error = null">Erneut versuchen</button>
  </div>
  <slot v-else />
</template>
```

**Verwendung:**
```vue
<ErrorBoundary>
  <KanbanColumn
    v-for="column in columns"
    :key="column.id"
    v-bind="column"
  />
</ErrorBoundary>
```

**Priorität:** 🟡 Mittel
**Aufwand:** 1 Stunde

---

## 📈 Vorgeschlagene Refactoring-Reihenfolge

### Phase 1: Kritische Architektur-Fixes (Woche 1)
**Aufwand: ~16 Stunden**

1. **SRP: Composables extrahieren** - 6-8 Stunden
   - `useKanbanData.ts`
   - `useKanbanBoard.ts`
   - `useDragAndDrop.ts`

2. **SRP: Komponenten extrahieren** - 4-5 Stunden
   - `KanbanColumn.vue`
   - `KanbanCard.vue`
   - `LoadingState.vue`
   - `ErrorState.vue`

3. **DIP: Service-Layer erstellen** - 4-5 Stunden
   - `BookService.ts`
   - `KanbanStorageService.ts`

4. **TypeScript-Typen extrahieren** - 30 Min
   - `types/Kanban.ts`

### Phase 2: Qualitätsverbesserungen (Woche 2)
**Aufwand: ~10 Stunden**

5. **Accessibility hinzufügen** - 2-3 Stunden
   - ARIA-Attribute
   - Keyboard-Navigation

6. **OCP: Konfigurierbarkeit** - 2 Stunden
   - `kanban.config.ts`
   - Umgebungsvariablen

7. **Optimistic Updates** - 1-2 Stunden

8. **Error-Boundary** - 1 Stunde

9. **Touch-Unterstützung** - 3-4 Stunden

### Phase 3: UX-Verbesserungen (Woche 3)
**Aufwand: ~5 Stunden**

10. **Animationen** - 1 Stunde

11. **i18n Integration** - 1 Stunde

12. **Modern Design anwenden** - 3 Stunden
    - Modern Variables verwenden
    - Gradient-Effekte
    - Glassmorphism

---

## 🧪 Testing-Strategie

### Unit Tests für Composables

```typescript
// composables/__tests__/useKanbanBoard.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useKanbanBoard } from '../useKanbanBoard'

describe('useKanbanBoard', () => {
  it('should initialize with empty statuses', () => {
    const books = ref([
      { id: '1', title: 'Book 1', author: 'Author 1' }
    ])

    const { kanbanBooks } = useKanbanBoard(books)

    expect(kanbanBooks.value[0].status).toBe('want-to-read')
  })

  it('should move book to new status', () => {
    const books = ref([
      { id: '1', title: 'Book 1', author: 'Author 1' }
    ])

    const { moveBook, kanbanBooks } = useKanbanBoard(books)

    moveBook('1', 'reading')

    expect(kanbanBooks.value[0].status).toBe('reading')
  })

  it('should filter books by status', () => {
    const books = ref([
      { id: '1', title: 'Book 1', author: 'Author 1' },
      { id: '2', title: 'Book 2', author: 'Author 2' }
    ])

    const { moveBook, readingBooks } = useKanbanBoard(books)

    moveBook('1', 'reading')

    expect(readingBooks.value).toHaveLength(1)
    expect(readingBooks.value[0].id).toBe('1')
  })
})
```

### Component Tests

```typescript
// components/__tests__/KanbanColumn.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanColumn from '../KanbanColumn.vue'

describe('KanbanColumn.vue', () => {
  it('should render column with correct title', () => {
    const wrapper = mount(KanbanColumn, {
      props: {
        id: 'reading',
        title: 'Lese ich gerade',
        icon: '📖',
        books: []
      }
    })

    expect(wrapper.find('.column-title').text()).toBe('Lese ich gerade')
  })

  it('should show empty state when no books', () => {
    const wrapper = mount(KanbanColumn, {
      props: {
        id: 'reading',
        title: 'Lese ich gerade',
        icon: '📖',
        books: []
      }
    })

    expect(wrapper.find('.empty-column').exists()).toBe(true)
  })

  it('should render books', () => {
    const books = [
      { id: '1', title: 'Book 1', author: 'Author 1', status: 'reading' }
    ]

    const wrapper = mount(KanbanColumn, {
      props: {
        id: 'reading',
        title: 'Lese ich gerade',
        icon: '📖',
        books
      }
    })

    expect(wrapper.findAllComponents({ name: 'KanbanCard' })).toHaveLength(1)
  })

  it('should emit drop event', async () => {
    const wrapper = mount(KanbanColumn, {
      props: {
        id: 'reading',
        title: 'Lese ich gerade',
        icon: '📖',
        books: []
      }
    })

    await wrapper.trigger('drop', { preventDefault: () => {} })

    expect(wrapper.emitted('drop')).toBeTruthy()
  })
})
```

### Integration Tests

```typescript
// views/__tests__/KanbanView.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import KanbanView from '../KanbanView.vue'

describe('KanbanView.vue', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', title: 'Book 1', author: 'Author 1' }
        ])
      })
    )
  })

  it('should load and display books', async () => {
    const wrapper = mount(KanbanView)

    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'KanbanColumn' })).toHaveLength(3)
  })

  it('should show loading state initially', () => {
    const wrapper = mount(KanbanView)

    expect(wrapper.findComponent({ name: 'LoadingState' }).exists()).toBe(true)
  })

  it('should handle drag and drop', async () => {
    const wrapper = mount(KanbanView)
    await flushPromises()

    const column = wrapper.findComponent({ name: 'KanbanColumn' })

    // Simulate drag start
    column.vm.$emit('cardDragStart', '1')

    // Simulate drop
    column.vm.$emit('drop', { preventDefault: () => {} })

    await wrapper.vm.$nextTick()

    // Verify book moved
    // ...assertions
  })
})
```

---

## ✅ Zusammenfassung

### Was funktioniert gut:
- ✅ Drag-and-Drop funktioniert
- ✅ LocalStorage-Persistenz
- ✅ Loading/Error States vorhanden

### Was kritisch verbessert werden muss:
- 🔴 **SRP massiv verletzt** - 432 Zeilen Monolith
- 🔴 **DIP verletzt** - Direkte API/Storage-Aufrufe
- 🔴 **OCP verletzt** - Hardcoded Konfiguration
- 🔴 **Nicht testbar** - Zu viele Verantwortlichkeiten

### Was zusätzlich fehlt:
- ⚠️ Accessibility (ARIA, Keyboard-Navigation)
- ⚠️ Touch-Unterstützung für Mobile
- ⚠️ Animationen beim Verschieben
- ⚠️ Optimistic Updates mit Backend-Sync
- ⚠️ i18n für Mehrsprachigkeit
- ⚠️ Error-Boundary für Fehlerbehandlung

### Geschätzter Gesamt-Aufwand:
**~31 Stunden** für vollständiges Refactoring

### ROI-Bewertung:
**SEHR HOCH** - Die aktuelle Architektur ist nicht wartbar. Refactoring ist dringend empfohlen:
- ✅ Drastisch verbesserte Testbarkeit
- ✅ Wiederverwendbare Komponenten
- ✅ Einfachere Wartung
- ✅ Bessere Performance (kleinere Komponenten)
- ✅ Mobile-Unterstützung
- ✅ Professionelle Accessibility

---

**Empfehlung:** Beginnen Sie mit Phase 1 (Architektur-Fixes), um die Basis für alle weiteren Verbesserungen zu schaffen.

---

**Ende der Analyse**
