<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type as keyof typeof icons] || icons.info
}
</script>

<template>
  <div class="toast-container" role="region" aria-label="Benachrichtigungen">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
        role="alert"
        aria-live="polite"
      >
        <div class="toast-icon" aria-hidden="true">
          {{ getIcon(toast.type) }}
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button
          class="toast-close"
          @click="removeToast(toast.id)"
          aria-label="Benachrichtigung schließen"
          type="button"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  width: calc(100% - 2rem);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  min-height: 60px;
  border-left: 4px solid;
}

.toast-success {
  border-left-color: #10b981;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.1), white);
}

.toast-error {
  border-left-color: #ef4444;
  background: linear-gradient(to right, rgba(239, 68, 68, 0.1), white);
}

.toast-warning {
  border-left-color: #f59e0b;
  background: linear-gradient(to right, rgba(245, 158, 11, 0.1), white);
}

.toast-info {
  border-left-color: #3b82f6;
  background: linear-gradient(to right, rgba(59, 130, 246, 0.1), white);
}

.toast-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #10b981;
  color: white;
}

.toast-error .toast-icon {
  background: #ef4444;
  color: white;
}

.toast-warning .toast-icon {
  background: #f59e0b;
  color: white;
}

.toast-info .toast-icon {
  background: #3b82f6;
  color: white;
}

.toast-message {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #1f2937;
  font-weight: 500;
}

.toast-close {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.toast-close:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Animations */
.toast-enter-active {
  animation: toast-slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-slide-out 0.3s ease-in;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(calc(100% + 1rem));
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(calc(100% + 1rem));
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 70px;
    right: 0.75rem;
    left: 0.75rem;
    width: auto;
    max-width: none;
  }

  .toast {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }

  .toast-icon {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.125rem;
  }
}
</style>
