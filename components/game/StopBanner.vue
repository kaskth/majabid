<template>
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
      class="fixed bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[94vw] w-auto select-none"
    >
      <!-- Cinematic Ambush Card -->
      <div
        class="relative px-6 py-5 rounded-3xl bg-black/92 backdrop-blur-xl border border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.35)] text-center min-w-[280px] sm:min-w-[340px]"
      >
        <!-- Floating Ambush Icon -->
        <div class="absolute -top-4 -left-3 flex items-center justify-center text-3xl animate-bounce">
          🍽️
        </div>

        <!-- Header -->
        <h3 class="text-amber-400 font-black text-base sm:text-lg mb-1 tracking-wide flex items-center justify-center gap-2">
          <span>⛔</span>
          <span>نافذة «وقّف!» (الكمين)</span>
        </h3>

        <!-- Owner & Capture info -->
        <div class="text-xs text-white/90 mb-3">
          <span class="font-bold text-amber-300">{{ ownerName }}</span>
          <span> يأكل </span>
          <span class="font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
            {{ game.pending.rank }} ({{ game.pending.count }} ورقة)
          </span>
        </div>

        <!-- Circular Countdown Timer -->
        <div class="relative w-16 h-16 mx-auto my-2 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" class="stroke-white/10 fill-none" stroke-width="4" />
            <circle
              cx="30"
              cy="30"
              r="26"
              class="stroke-amber-400 fill-none transition-all duration-100"
              stroke-width="4.5"
              stroke-linecap="round"
              stroke-dasharray="163"
              :stroke-dashoffset="163 * (1 - timerFrac)"
            />
          </svg>
          <span class="absolute font-mono font-black text-2xl text-amber-300">
            {{ remainingSeconds }}
          </span>
        </div>

        <!-- Action Prompt -->
        <p class="text-xs font-bold mt-1" :class="canAct ? 'text-amber-200' : 'text-gray-400'">
          {{ canAct ? '🎯 لديك الورقة — اخطف الأكلة فوراً!' : (isPendingOwner ? 'أكلتك في الهواء.. ترقّب ثواني الكمين' : 'من يملك نفس الرقم أو الجوكر يمكنه الخطف') }}
        </p>

        <!-- Decision Buttons -->
        <div class="mt-4 flex items-center gap-3">
          <!-- Stop / Ambush CTA Button -->
          <button
            v-if="canAct && !hasFolded"
            class="flex-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 text-white font-black text-sm sm:text-base shadow-[0_0_20px_rgba(225,29,72,0.6)] border border-amber-300 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 animate-pulse"
            @click="executeStop"
          >
            <span class="text-xl">⛔</span>
            <span>صرخة «وقّف!»</span>
            <span v-if="matchingCardText" class="text-xs bg-black/40 px-2 py-0.5 rounded-full font-bold">
              {{ matchingCardText }}
            </span>
          </button>

          <!-- Fold / Keep Card Button -->
          <button
            v-if="canAct && !hasFolded"
            class="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs border border-white/15 transition-colors"
            title="احتفظ بالورقة للجولات القادمة"
            @click="hasFolded = true"
          >
            تجاوز
          </button>

          <!-- Waiting status -->
          <div
            v-if="!canAct || hasFolded"
            class="w-full py-2 text-center text-xs text-gray-400 font-medium"
          >
            {{ hasFolded ? 'تم حفظ الورقة — بانتظار اكتمال الثواني ⏳' : 'بانتظار انتهاء النافذة ⏳' }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
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
  remainingSeconds.value = Math.ceil(rem / 1000)
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