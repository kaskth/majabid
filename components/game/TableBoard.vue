<template>
  <div class="relative w-full max-w-2xl mx-auto flex items-center justify-center p-3 sm:p-5 rounded-3xl bg-black/45 backdrop-blur-md border border-amber-500/20 shadow-2xl">
    <!-- Field Center Plate -->
    <div class="flex-1 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[170px] px-2">
      <div class="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5 select-none">
        <span>الميدان 🎯</span>
        <span class="text-xs text-amber-200/70 font-mono">({{ totalFieldCards }} ورقة)</span>
      </div>

      <!-- Field Cards Grid / Row -->
      <div v-if="groupedField.length > 0" class="flex flex-wrap items-center justify-center gap-2.5 max-w-full">
        <div
          v-for="grp in groupedField"
          :key="grp.rank"
          class="group relative flex items-center justify-center p-1 rounded-2xl bg-black/40 border transition-all duration-200 cursor-pointer"
          :class="[
            canEatRank(grp.rank)
              ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105 hover:scale-110 ring-2 ring-emerald-400/80 animate-pulse'
              : 'border-white/10 hover:border-amber-400/50 hover:scale-105'
          ]"
          :title="canEatRank(grp.rank) ? 'اضغط للأكل المباشر!' : `مجموعة ${grp.rank}`"
          @click="onFieldCardClick(grp.rank)"
        >
          <!-- Stack Effect -->
          <div class="relative w-11 sm:w-13 h-15 sm:h-18">
            <div
              v-for="k in Math.min(grp.count, 3)"
              :key="k"
              class="absolute inset-0"
              :style="{ transform: `translateY(${-(k - 1) * 2.5}px) translateX(${(k - 1) * 1.5}px)` }"
            >
              <GameCard :rank="grp.rank" :suit="grp.suit" />
            </div>
          </div>

          <!-- Multiplier Badge -->
          <span
            v-if="grp.count > 1"
            class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-black text-[10px] shadow"
          >
            ×{{ grp.count }}
          </span>

          <!-- Eat Hint Pill -->
          <span
            v-if="canEatRank(grp.rank)"
            class="absolute -top-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-black text-[9px] shadow-sm select-none"
          >
            كِل 🍽️
          </span>
        </div>
      </div>

      <!-- Empty field placeholder -->
      <div v-else class="text-xs text-emerald-200/50 font-medium py-6 select-none">
        الميدان خالي — ابدأ بالرمي أو الأكل
      </div>
    </div>

    <!-- Deck (الرزمة) -->
    <div class="flex flex-col items-center justify-center pl-3 border-r border-white/10 shrink-0 select-none">
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
import { useGameStore, type CardData } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

const game = useGameStore()
const audio = useAudioStore()

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const totalFieldCards = computed(() => game.field.length)

interface GroupedRank {
  rank: string
  count: number
  suit: string
}

const groupedField = computed<GroupedRank[]>(() => {
  const map = new Map<string, { count: number; topSuit: string }>()
  for (const c of game.field) {
    const existing = map.get(c.r)
    if (existing) {
      existing.count++
      existing.topSuit = c.s
    } else {
      map.set(c.r, { count: 1, topSuit: c.s })
    }
  }

  const res: GroupedRank[] = []
  for (const r of RANK_ORDER) {
    const item = map.get(r)
    if (item && item.count > 0) {
      res.push({ rank: r, count: item.count, suit: item.topSuit })
    }
  }
  return res
})

function canEatRank(rank: string): boolean {
  if (!game.isMyTurn) return false
  const sel = game.myHand.find((c) => c.id === game.selectedCardId)
  if (sel) {
    if (sel.j) return true
    if (sel.r === rank) return true
  }
  return game.myHand.some((c) => c.r === rank || c.j)
}

function onFieldCardClick(rank: string) {
  if (!game.isMyTurn) return

  let cardToUse: CardData | undefined = game.myHand.find((c) => c.id === game.selectedCardId)

  // If selected card doesn't match and isn't joker, find one in hand that matches
  if (!cardToUse || (cardToUse.r !== rank && !cardToUse.j)) {
    cardToUse = game.myHand.find((c) => c.r === rank) || game.myHand.find((c) => c.j)
    if (cardToUse) {
      game.selectedCardId = cardToUse.id!
      audio.sfx.pick()
    }
  }

  if (cardToUse) {
    audio.sfx.eat()
    game.playEat(cardToUse.id!, rank)
  }
}
</script>
