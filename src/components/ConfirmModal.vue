<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'danger' | 'primary'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="handleCancel">
      <div
        class="modal-content"
        @click.stop
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'modal-title'"
      >
        <div class="modal-header">
          <h3 id="modal-title" class="modal-title">{{ title }}</h3>
          <button
            class="modal-close"
            @click="handleCancel"
            aria-label="Dialog schließen"
            type="button"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <p>{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            {{ cancelText || 'Abbrechen' }}
          </button>
          <button
            type="button"
            class="btn"
            :class="confirmType === 'danger' ? 'btn-danger' : 'btn-primary'"
            @click="handleConfirm"
          >
            {{ confirmText || 'Bestätigen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/styles/modern-variables' as *;
@use '@/assets/styles/modern-mixins' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($color-black, 0.6);
  backdrop-filter: blur(12px) saturate(150%);
  @include flex-center;
  z-index: $z-modal-backdrop;
  padding: $spacing-lg;
  animation: fade-in-overlay 300ms $ease-out both;
}

@keyframes fade-in-overlay {
  from {
    opacity: 0;
    backdrop-filter: blur(0) saturate(100%);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(12px) saturate(150%);
  }
}

.modal-content {
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-2xl;
  max-width: 500px;
  width: 100%;
  animation: slide-up-scale 400ms $ease-elastic both;
  border: 1px solid rgba($color-white, 0.8);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: $gradient-primary;
  }
}

@keyframes slide-up-scale {
  from {
    transform: translateY(40px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-xl;
  border-bottom: 2px solid $color-gray-100;
}

.modal-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  @include gradient-text;
  letter-spacing: -0.02em;
}

.modal-close {
  @include flex-center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: $color-gray-100;
  color: $color-gray-600;
  font-size: $font-size-2xl;
  line-height: 1;
  cursor: pointer;
  border-radius: $radius-full;
  transition: all $transition-base $ease-out;
  padding: 0;

  &:hover {
    background: $color-danger;
    color: $color-white;
    transform: rotate(90deg) scale(1.1);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }

  @include focus-visible($color-primary);
}

.modal-body {
  padding: $spacing-xl;

  p {
    margin: 0;
    font-size: $font-size-base;
    line-height: $line-height-relaxed;
    color: $color-gray-700;
  }
}

.modal-footer {
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
  padding: $spacing-xl;
  border-top: 2px solid $color-gray-100;
  background: linear-gradient(180deg, transparent 0%, $color-gray-50 100%);
}

.btn {
  padding: $spacing-sm $spacing-xl;
  border-radius: $radius-full;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base $ease-out;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity $transition-base;
  }
}

.btn-secondary {
  background: $color-white;
  border-color: $color-gray-300;
  color: $color-gray-700;
  box-shadow: $shadow-sm;

  &::before {
    background: $color-gray-100;
  }

  &:hover {
    border-color: $color-gray-400;
    transform: translateY(-2px);
    box-shadow: $shadow-md;

    &::before {
      opacity: 1;
    }
  }

  span {
    position: relative;
    z-index: $z-base;
  }
}

.btn-primary {
  background: $gradient-primary;
  color: $color-white;
  box-shadow: $shadow-primary;

  &::before {
    background: $gradient-sunset;
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: $shadow-lg, $shadow-glow;

    &::before {
      opacity: 1;
    }
  }

  span {
    position: relative;
    z-index: $z-base;
  }
}

.btn-danger {
  background: linear-gradient(135deg, $color-danger 0%, darken($color-danger, 10%) 100%);
  color: $color-white;
  box-shadow: 0 10px 30px -5px rgba($color-danger, 0.4);

  &::before {
    background: linear-gradient(135deg, darken($color-danger, 15%) 0%, $color-danger 100%);
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 40px -5px rgba($color-danger, 0.5);

    &::before {
      opacity: 1;
    }
  }

  span {
    position: relative;
    z-index: $z-base;
  }
}

.btn:active {
  transform: translateY(-1px) scale(0.98);
}

.btn:focus-visible {
  @include focus-visible($color-primary);
}

/* Responsive */
@include respond-to('sm') {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: $spacing-lg;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: $spacing-sm;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .modal-title {
    font-size: $font-size-lg;
  }
}
</style>
