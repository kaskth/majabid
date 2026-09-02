<template>
  <div>
    <!-- Cinematic Vignette Pulse Overlay during Stop Window -->
    <div
      v-if="game.phase === 'stop' && game.pending"
      class="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(220,38,38,0.35)_100%)] animate-pulse transition-opacity duration-300"
    />

    <Transition
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="scale-90 opacity-0 -translate-y-4"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="game.phase === 'stop' && game.pending"
        class="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 max-w-[94vw] w-auto select-none"
      >
        <!-- Cinematic Ambush Card -->
        <div
          class="relative px-3.5 py-2 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-black/95 backdrop-blur-2xl border border-rose-500/60 shadow-[0_0_30px_rgba(225,29,72,0.45)] text-center min-w-[260px] sm:min-w-[320px]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between gap-2 mb-1">
            <h3 class="text-amber-300 font-black text-xs sm:text-base tracking-wide flex items-center gap-1">
              <span>⛔</span>
              <span>«وقّف!» (الكمين)</span>
            </h3>

            <!-- Circular Countdown Timer Badge -->
            <div class="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" class="stroke-white/10 fill-none" stroke-width="5" />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  class="stroke-rose-500 fill-none transition-all duration-100"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-dasharray="163"
                  :stroke-dashoffset="163 * (1 - timerFrac)"
                />
              </svg>
              <span class="absolute font-mono font-black text-xs sm:text-sm text-amber-300">
                {{ remainingSeconds }}
              </span>
            </div>
          </div>

          <!-- Owner & Capture info -->
          <div class="text-[11px] sm:text-xs text-white/90 mb-2 flex items-center justify-center gap-1.5">
            <span class="font-bold text-amber-300">{{ ownerName }}</span>
            <span>يأكل</span>
            <span class="font-black text-amber-400 bg-amber-500/20 px-2 py-0.2 rounded-full border border-amber-400/50">
              {{ game.pending.rank }} ({{ game.pending.count }} ورقة)
            </span>
          </div>

          <!-- Decision Buttons -->
          <div class="mt-1 flex items-center justify-center gap-2">
            <!-- Stop / Ambush CTA Button -->
            <button
              v-if="canAct && !hasFolded"
              class="flex-1 px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(225,29,72,0.7)] border border-amber-300 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-1.5 animate-pulse"
              @click="executeStop"
            >
              <span>⛔ صرخة «وقّف!»</span>
              <span v-if="matchingCardText" class="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full">
                {{ matchingCardText }}
              </span>
            </button>

            <!-- Fold / Keep Card Button -->
            <button
              v-if="canAct && !hasFolded"
              class="px-3 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-[10px] sm:text-xs border border-white/15 transition-colors"
              title="تجاوز واحتفظ بالورقة"
              @click="hasFolded = true"
            >
              تجاوز
            </button>

            <!-- Waiting status -->
            <div
              v-if="!canAct || hasFolded"
              class="w-full py-0.5 text-center text-[11px] text-gray-300 font-medium"
            >
              {{ hasFolded ? 'تم حفظ الورقة — بانتظار العداد ⏳' : (isPendingOwner ? 'أكلتك معلقة — ترقّب ثواني الكمين ⏳' : 'بانتظار انتهاء النافذة ⏳') }}
            </div>
          </div>
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
watch(() => game.pending, () => {
  hasFolded.value = false
})

const ownerName = computed(() => {
  if (!game.pending) return ''
  const s = game.seats[game.pending.owner]
  return s?.name || `لاعب ${game.pending.owner + 1}`
})

const isPendingOwner = computed(() => {
  return game.pending?.owner === game.mySeat
})

const matchingCard = computed(() => {
  if (!game.pending || isPendingOwner.value) return null
  return game.myHand.find((c) => c.j || c.r === game.pending!.rank) || null
})

const canAct = computed(() => {
  return !isPendingOwner.value && !!matchingCard.value && game.canStop
})

const matchingCardText = computed(() => {
  if (!matchingCard.value) return ''
  if (matchingCard.value.j) return '🃏 الجوكر'
  return `${matchingCard.value.r} ${matchingCard.value.s}`
})

const remainingSeconds = ref(5)
const timerFrac = ref(1)
let secInterval: ReturnType<typeof setInterval> | null = null
let lastBeepSec = 5

function updateCountdown() {
  if (game.phase !== 'stop' || !game.deadline) {
    remainingSeconds.value = 5
    timerFrac.value = 1
    return
  }
  const now = Date.now()
  const deadlineTime = game.deadline + game.clockSkew
  const rem = Math.max(0, deadlineTime - now)
  const total = 5000
  const curSec = Math.ceil(rem / 1000)
  if (curSec !== lastBeepSec && curSec > 0) {
    lastBeepSec = curSec
    audio.sfx.heartbeat()
  }
  remainingSeconds.value = curSec
  timerFrac.value = Math.min(1, Math.max(0, rem / total))
}

function executeStop() {
  if (!matchingCard.value) return
  audio.sfx.stop()
  game.playCard('stop', matchingCard.value.id)
}

onMounted(() => {
  secInterval = setInterval(updateCountdown, 80)
})

onUnmounted(() => {
  if (secInterval) clearInterval(secInterval)
})
</script>