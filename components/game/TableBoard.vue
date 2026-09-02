<template>
  <div class="relative w-full max-w-2xl mx-auto flex items-center justify-center p-3 sm:p-5 rounded-3xl bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl">
    <!-- Field Center Plate -->
    <div class="flex-1 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[170px] px-2">
      <div class="text-[11px] font-bold text-emerald-300/80 mb-2 flex items-center gap-1">
        <span>الميدان 🎯</span>
        <span class="text-xs text-white/50">({{ totalFieldCards }} ورقة)</span>
      </div>

      <!-- Field Cards Row / Grid -->
      <div v-if="groupedField.length > 0" class="flex flex-wrap items-center justify-center gap-2 max-w-full">
        <div
          v-for="grp in groupedField"
          :key="grp.rank"
          class="relative flex items-center justify-center p-1 rounded-xl bg-black/30 border border-white/10 hover:border-gold/50 transition-transform hover:scale-105"
        >
          <!-- Stack of same rank -->
          <div class="relative w-10 sm:w-12 h-14 sm:h-16">
            <div
              v-for="k in Math.min(grp.count, 3)"
              :key="k"
              class="absolute inset-0"
              :style="{ transform: `translateY(${-(k - 1) * 2}px) translateX(${(k - 1) * 1.5}px)` }"
            >
              <GameCard :rank="grp.rank" suit="♥" />
            </div>
          </div>
          <!-- Multiplier Badge -->
          <span
            v-if="grp.count > 1"
            class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-black text-[10px] shadow"
          >
            ×{{ grp.count }}
          </span>
        </div>
      </div>

      <!-- Empty field placeholder -->
      <div v-else class="text-xs text-emerald-200/50 font-medium py-6">
        الميدان خالي — ابدأ بالرمي أو الأكل
      </div>
    </div>

    <!-- Deck (الرزمة) -->
    <div class="flex flex-col items-center justify-center pl-3 border-r border-white/10 shrink-0">
      <div class="relative w-14 sm:w-18 h-20 sm:h-24 transition-transform hover:scale-105">
        <!-- Deck Glow -->
        <div class="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-2xl blur-md pointer-events-none" />
        
        <!-- Stack effect for deck -->
        <div class="absolute inset-0 translate-y-1.5 translate-x-1.5 opacity-60">
          <GameCard :back="true" />
        </div>
        <div class="absolute inset-0 translate-y-0.5 translate-x-0.5 opacity-85">
          <GameCard :back="true" />
        </div>
        <div class="relative w-full h-full">
          <GameCard :back="true" />
        </div>

        <!-- Deck Count Overlay -->
        <div class="absolute -bottom-2 -left-2 px-2 py-0.5 rounded-full bg-black/90 border border-gold/50 text-gold-light font-mono font-black text-xs shadow-lg">
          {{ game.deckCount }}
        </div>
      </div>
      <span class="text-[10px] font-bold text-gray-300 mt-2">الرزمة</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'

const game = useGameStore()

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const totalFieldCards = computed(() => game.field.length)

const groupedField = computed(() => {
  const map = new Map<string, number>()
  for (const c of game.field) {
    map.set(c.r, (map.get(c.r) || 0) + 1)
  }
  const res: { rank: string; count: number }[] = []
  for (const r of RANK_ORDER) {
    const count = map.get(r) || 0
    if (count > 0) {
      res.push({ rank: r, count })
    }
  }
  return res
})
</script>
