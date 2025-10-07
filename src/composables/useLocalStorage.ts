import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  // Try to load from localStorage
  const loadFromStorage = (): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // Create reactive ref
  const storedValue = ref<T>(loadFromStorage()) as Ref<T>

  // Watch for changes and save to localStorage
  watch(
    storedValue,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
      }
    },
    { deep: true }
  )

  return storedValue
}
