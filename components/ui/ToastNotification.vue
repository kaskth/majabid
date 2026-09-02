<template>
  <Transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="translate-y-6 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-4 opacity-0 scale-95"
  >
    <div
      v-if="ui.isToastVisible"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] px-6 py-3 rounded-full text-sm sm:text-base font-bold text-center pointer-events-none shadow-2xl backdrop-blur-md flex items-center justify-center gap-2"
      :class="ui.toastIsGold ? 'bg-gradient-to-r from-amber-500/90 to-yellow-600/90 text-black border-2 border-yellow-300 shadow-gold-glow' : 'bg-black/85 text-white border border-white/20'"
    >
      <span>{{ ui.toastMessage }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
const ui = useUiStore()
</script>
