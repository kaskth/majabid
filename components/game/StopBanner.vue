<template>
  <div>
    <!-- Subtle Red Ambient Glow around Screen Edges during Ambush Window -->
    <div
      v-if="game.phase === 'stop' && game.pending"
      class="fixed inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(225,29,72,0.25)_100%)] animate-pulse transition-opacity duration-300"
    />

    <!-- 1. SLIM AMBIENT NOTIFICATION PILL AT TOP OF ARENA (For Everyone, Zero Table Obstruction) -->
    <Transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="game.phase === 'stop' && game.pending"
        class="fixed top-12 inset-x-0 z-40 flex justify-center pointer-events-none select-none px-2"
      >
        <div class="px-4 py-1.5 rounded-full bg-black/90 border border-rose-500/80 shadow-[0_0_20px_rgba(225,29,72,0.6)] backdrop-blur-md flex items-center gap-2 text-xs">
          <span class="text-rose-400 font-black animate-pulse">⛔ كمين «وقّف!»:</span>
          <span class="text-amber-300 font-bold">{{ ownerName }}</span>
          <span class="text-white">أكل</span>
          <span class="px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-400/40">
            {{ game.pending.rank }} ({{ game.pending.count }} ورقة)
          </span>
          <!-- Countdown Badge -->
          <span class="w-5 h-5 rounded-full bg-rose-600 text-white font-mono font-black text-[11px] flex items-center justify-center">
            {{ remainingSeconds }}
          </span>
        </div>
      </div>
    </Transition>

    <!-- 2. TACTICAL THUMB ACTION BAR (Appears directly above hand cards ONLY if player has the card) -->
    <Transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 translate-y-3 scale-95"
    >
      <div
        v-if="game.phase === 'stop' && game.pending && canAct && !hasFolded"
        class="fixed bottom-22 sm:bottom-26 inset-x-0 z-50 flex items-center justify-center px-3 pointer-events-none select-none"
      >
        <div class="pointer-events-auto flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/95 border-2 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.85)] backdrop-blur-xl animate-bounce">
          <!-- Big Red-Gold Ambush Button -->
          <button
            class="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            @click="executeStop"
          >
            <span class="text-base sm:text-lg">⛔</span>
            <span>صرخة «وقّف!» (اخطف الصيدة)</span>
            <span v-if="matchingCardText" class="bg-black/60 px-2 py-0.5 rounded-md text-amber-300 text-xs font-mono font-bold">
              {{ matchingCardText }}
            </span>
            <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/40 text-amber-300 font-mono text-[11px] sm:text-xs font-black flex items-center justify-center border border-white/20">
              {{ remainingSeconds }}ث
            </span>
          </button>

          <!-- Fold Button -->
          <button
            class="px-3 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs border border-white/20 active:scale-95 transition-colors"
            title="تجاوز واحتفظ بورقتك"
            @click="hasFolded = true"
          >
            تجاوز
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

const game = useGameStore()
const audio = useAudioStore()

const hasFolded = ref(false)

// Reset fold state when pending window changes
watch(
  () => game.pending?.tStop,
  () => {
    hasFolded.value = false
  }
)

const isPendingOwner = computed(() => {
  if (!game.pending) return false
  const ownerSeat = game.pending.owner !== undefined ? game.pending.owner : (game.pending as any).by
  return ownerSeat === game.mySeat
})

// Can the local player play a Stop ambush?
const canAct = computed(() => {
  if (game.isSpec) return false
  if (isPendingOwner.value) return false
  if (game.mySeat < 0) return false
  return game.myStopCards.length > 0
})

const matchingCard = computed(() => {
  if (!canAct.value) return null
  return game.myStopCards[0]
})

const matchingCardText = computed(() => {
  if (!matchingCard.value) return ''
  if (matchingCard.value.joker) return '🃏 جوكر'
  return `${matchingCard.value.suit}${matchingCard.value.rank}`
})

const ownerName = computed(() => {
  if (!game.pending) return ''
  const ownerSeat = game.pending.owner !== undefined ? game.pending.owner : (game.pending as any).by
  if (ownerSeat === undefined || ownerSeat === null) return 'الخصم'
  const s = game.seats[ownerSeat]
  return s?.name || `لاعب ${ownerSeat + 1}`
})

// Timer countdown animation
const now = ref(Date.now())
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = Date.now()
  }, 100)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const remainingMs = computed(() => {
  if (!game.pending?.tStop) return 0
  return Math.max(0, game.pending.tStop - now.value)
})

const remainingSeconds = computed(() => {
  return Math.ceil(remainingMs.value / 1000)
})

function executeStop() {
  if (!canAct.value || !matchingCard.value) return
  audio.sfx.stopAmbush()
  game.playCard('stop', matchingCard.value.id)
}
</script>