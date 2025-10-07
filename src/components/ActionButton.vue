<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  variant?: 'primary' | 'danger' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="action-button"
    :class="[`action-button--${variant || 'primary'}`, `action-button--${size || 'md'}`]"
    :aria-label="label"
    :title="label"
    @click="handleClick"
  >
    <span class="action-button__icon" aria-hidden="true">{{ icon }}</span>
  </button>
</template>

<style scoped lang="scss">
@use '@/assets/styles/modern-variables' as *;
@use '@/assets/styles/modern-mixins' as *;

.action-button {
  @include flex-center;
  border: none;
  border-radius: $radius-full;
  @include glassmorphism(0.95, 10px);
  cursor: pointer;
  transition: all $transition-base $ease-out;
  box-shadow: $shadow-base;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: $gradient-primary;
    opacity: 0;
    transition: opacity $transition-base;
    border-radius: $radius-full;
  }

  &:hover {
    transform: scale(1.15) rotate(5deg);
    box-shadow: $shadow-lg;

    &::before {
      opacity: 0.1;
    }
  }

  &:active {
    transform: scale(0.95);
  }

  @include focus-visible($color-primary);

  // Sizes
  &--sm {
    width: 2rem;
    height: 2rem;
    font-size: $font-size-base;
  }

  &--md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: $font-size-lg;
  }

  &--lg {
    width: 3rem;
    height: 3rem;
    font-size: $font-size-xl;
  }

  // Variants
  &--primary {
    &:hover {
      &::before {
        opacity: 0.15;
      }
    }
  }

  &--danger {
    &::before {
      background: linear-gradient(135deg, $color-danger 0%, lighten($color-danger, 10%) 100%);
    }

    &:hover {
      color: $color-white;
      box-shadow: 0 10px 30px -5px rgba($color-danger, 0.4);

      &::before {
        opacity: 1;
      }
    }
  }

  &--secondary {
    background: rgba($color-gray-700, 0.95);
    color: $color-white;

    &::before {
      background: linear-gradient(135deg, $color-gray-600 0%, $color-gray-500 100%);
    }

    &:hover {
      box-shadow: $shadow-md;

      &::before {
        opacity: 1;
      }
    }
  }

  &__icon {
    @include flex-center;
    position: relative;
    z-index: $z-base;
    transition: transform $transition-base $ease-elastic;

    .action-button:hover & {
      transform: scale(1.1);
    }
  }
}
</style>
