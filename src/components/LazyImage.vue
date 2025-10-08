<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  src?: string
  alt: string
  fallbackIcon?: string
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}>()

const isLoaded = ref(false)
const hasError = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  hasError.value = true
}

onMounted(() => {
  if (imageRef.value?.complete) {
    isLoaded.value = true
  }
})
</script>

<template>
  <div class="lazy-image" :style="{ aspectRatio: aspectRatio || 'auto' }">
    <!-- Image -->
    <img
      v-if="src && !hasError"
      ref="imageRef"
      :src="src"
      :alt="alt"
      :class="['lazy-image__img', { 'lazy-image__img--loaded': isLoaded }]"
      :style="{ objectFit: objectFit || 'cover' }"
      loading="lazy"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Fallback/Placeholder -->
    <div v-if="!src || hasError" class="lazy-image__placeholder">
      <span class="lazy-image__icon" aria-hidden="true">
        {{ fallbackIcon || '📚' }}
      </span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="src && !isLoaded && !hasError" class="lazy-image__skeleton"></div>
  </div>
</template>

<style scoped lang="scss">
.lazy-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-background-mute);
  display: flex;
  align-items: center;
  justify-content: center;

  &__img {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease;

    &--loaded {
      opacity: 1;
    }
  }

  &__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      var(--color-background-mute) 0%,
      var(--color-border) 100%
    );
  }

  &__icon {
    font-size: 4.5rem;
    opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__skeleton {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--color-background-mute) 0%,
      var(--color-background-soft) 50%,
      var(--color-background-mute) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .lazy-image__icon {
    font-size: 3.5rem;
  }
}
</style>
