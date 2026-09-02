<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none" @click.self="closeModal">
      <div class="relative max-w-lg mx-auto w-full bg-black/92 rounded-3xl backdrop-blur-xl border border-amber-500/40 shadow-2xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar text-right">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 class="text-xl sm:text-2xl font-black text-gold-light flex items-center gap-2">
              <span>📊</span>
              <span>إحصائيات الجولة المباشرة</span>
            </h3>
            <span class="text-xs text-emerald-300/80">الجولة {{ game.round }} · رزمة: {{ game.deckCount }} ورقة متبقية</span>
          </div>
          <button class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Mode & Difficulty Strip -->
        <div class="grid grid-cols-3 gap-2 mb-4 p-2 rounded-2xl bg-black/50 border border-white/10 text-center text-xs">
          <div>
            <span class="text-gray-400 block text-[10px]">الوضع</span>
            <b class="text-white">{{ game.mode === 'teams' ? 'جماعي 2×2' : 'فردي 🎯' }}</b>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px]">الذكاء</span>
            <b class="text-amber-300">{{ difficultyText }}</b>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px]">الموزع</span>
            <b class="text-emerald-300">{{ dealerName }}</b>
          </div>
        </div>

        <!-- 4 Players Breakdown -->
        <div class="space-y-2.5 mb-6">
          <div
            v-for="(s, idx) in game.seats"
            :key="idx"
            class="p-3 rounded-2xl border flex items-center justify-between transition-all"
            :class="[
              idx === game.turn ? 'ring-2 ring-amber-400 bg-amber-500/10 border-amber-400' : 'bg-black/40 border-white/10',
              game.mode === 'teams' ? (idx % 2 === 0 ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-rose-400') : ''
            ]"
          >
            <!-- Player Info -->
            <div class="flex items-center gap-2.5">
              <UiAvatarImg :avatar="s?.avatar || 'a1'" size="sm" :border="idx === game.turn ? 'gold' : 'white'" />
              <div class="flex flex-col text-right">
                <div class="flex items-center gap-1.5">
                  <b class="text-xs sm:text-sm text-white font-black">{{ s?.name || `لاعب ${idx + 1}` }}</b>
                  <span v-if="idx === game.mySeat" class="text-[9px] px-1.5 py-0.2 rounded bg-gold/20 text-gold font-bold">أنت</span>
                  <span v-if="s?.isBot" class="text-[10px]">🤖</span>
                  <span v-if="idx === game.dealer" class="text-xs" title="الموزع">🪙</span>
                </div>
                <span class="text-[10px] text-gray-400 font-mono">
                  {{ game.mode === 'teams' ? (idx % 2 === 0 ? 'فريق أزرق 🔵' : 'فريق أحمر 🔴') : `مقعد ${idx + 1}` }}
                </span>
              </div>
            </div>

            <!-- Stats Counts -->
            <div class="flex items-center gap-3 text-center">
              <div>
                <span class="text-[9px] text-gray-400 block">في اليد</span>
                <b class="text-xs sm:text-sm font-mono text-white">{{ game.handCounts[idx] || 0 }}</b>
              </div>
              <div>
                <span class="text-[9px] text-gray-400 block">المدفون</span>
                <b class="text-xs sm:text-sm font-mono text-amber-300">{{ game.piles[idx]?.buriedCount || 0 }}</b>
              </div>
              <div>
                <span class="text-[9px] text-gray-400 block">الجبيد</span>
                <b class="text-xs sm:text-sm font-mono text-emerald-300">
                  {{ game.piles[idx]?.chain ? `${game.piles[idx].chain!.rank} (${game.piles[idx].chain!.count})` : '-' }}
                </b>
              </div>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <div class="text-center">
          <button
            class="px-8 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-transform"
            @click="closeModal"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const ui = useUiStore()

const dealerName = computed(() => {
  return game.seats[game.dealer]?.name || `لاعب ${game.dealer + 1}`
})

const difficultyText = computed(() => {
  switch (game.difficulty) {
    case 'casual': return 'مبتدئ 🐣'
    case 'legend': return 'الذيب 🐺'
    case 'pro':
    default: return 'محترف ⚔️'
  }
})

function closeModal() {
  ui.closeModal()
}
</script>
