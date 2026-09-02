<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="relative w-full max-w-lg p-6 rounded-3xl bg-[#0f241a] border border-gold/40 shadow-gold-glow flex flex-col items-center text-center">
      <h2 class="text-2xl font-black text-gold-light mb-1 flex items-center gap-2">
        <span>🛍️</span>
        <span>مظاهر الطاولة</span>
      </h2>
      <p class="text-xs text-emerald-300/80 mb-6">
        اختر مظهرك المفضل — سيُطبق تلقائياً على طاولاتك وجلساتك
      </p>

      <!-- Theme Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
        <button
          v-for="th in themes"
          :key="th.id"
          class="p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200"
          :class="[
            ui.theme === th.id
              ? 'border-gold shadow-gold-glow bg-black/60 scale-105 ring-2 ring-gold/50'
              : 'border-white/15 bg-black/30 hover:border-white/40'
          ]"
          @click="ui.setTheme(th.id)"
        >
          <!-- Swatch Circle -->
          <div
            class="w-14 h-14 rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center text-2xl"
            :class="th.colorClass"
          >
            {{ th.icon }}
          </div>
          <span class="font-black text-sm text-white">{{ th.name }}</span>
          <span class="text-[11px] text-gray-300">{{ th.desc }}</span>
        </button>
      </div>

      <!-- Close Button -->
      <button
        class="mt-6 px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
        @click="ui.closeModal"
      >
        حفظ واختيار
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

const themes = [
  {
    id: 1,
    name: 'كلاسيكي أخضر',
    desc: 'جوكر الكازينو الفاخر',
    icon: '🃏',
    colorClass: 'bg-gradient-to-br from-emerald-700 to-emerald-950',
  },
  {
    id: 2,
    name: 'مجلس شعبي',
    desc: 'سجادة حمراء تراثية',
    icon: '🏮',
    colorClass: 'bg-gradient-to-br from-red-700 to-amber-950',
  },
  {
    id: 3,
    name: 'ليلي ملكي',
    desc: 'كحلي فاخر × ذهب',
    icon: '👑',
    colorClass: 'bg-gradient-to-br from-blue-900 to-slate-950',
  },
]
</script>
