<template>
  <Transition
    enter-active-class "transition duration-300 ease-out transform"
    enter-from-class "scale-90 opacity-0 -translate-y-4"
    enter-to-class "scale-100 opacity-100 translate-y-0"
    leave-active-class "transition duration-200 ease-in transform"
    leave-from-class "scale-100 opacity-100"
    leave-to-class "scale-95 opacity-0"
  >
    <div
      v-if="game.phase === 'stop' && game.pending"
      class="fixed bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[92vw] w-auto"
    >
      <!-- Cinematic Ambush Overlay -->
      <div
        class="relative px-6 py-4 rounded-3xl bg-black/90 backdrop-blur-lg border border-amber-500/40 shadow-gold-glow text-center transform hover:scale-105 transition-transform min-w-[260px]"
      >
        <!-- Animated Amber Icon -->
        <div class="absolute -top-2 -left-2 flex items-center justify-center">
          <span class="text-4xl animate-bounce">🍽️</span>
        </div>

        <!-- Title -->
        <h3 class="text-amber-400 font-bold text-lg mb-2 tracking-wider">⛔ صرخة «وقّف!»</h3>

        <!-- Countdown & Status -->
        <div class="flex flex-col items-center gap-2 mb-4">
          <!-- Owner Name -->
          <div class="text-white font-black text-sm">
            {{ ownerName }} صرخ «وقّف!»
          </div>

          <!-- Countdown Circle -->
          <div class="w-20 h-20 rounded-full relative flex items-center justify-center">
            <span class="text-3xl font-black text-amber-300">{{ remainingSeconds }}</span>
            <!-- Inner pulse ring -->
            <div
              class="absolute inset-0 rounded-full border-2 border-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            ></div>
          </div>

          <!-- Subtitle -->
          <p class="text-gray-300 text-xs sm:text-base">
            {{ game.canStop ? '⛔ لديك الورقة — اخطف الأكلة فوراً!' : 'من يملك نفس الرقم أو الجوكر يمكنه الخطف' }}
          </p>
        </div>

        <!-- Golden Shockwave (When joker used) -->
        <div
          v-if="jokerUsed"
          class="absolute -inset-2 rounded-3xl opacity-0 border-4 border-amber-500/20 animate-pulse-slow pointer-events-none"
          :style="{
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            transform: 'scale(' + (1 + (5 - remainingSeconds) * 0.15) + ')'
          }"
        />
      </div>

      <!-- Ambush Decision Buttons -->
      <div class="mt-5 flex gap-4">
        <!-- Stop Button - Primary CTA -->
        <button
          v-if="game.canStop && matchingCard"
          class="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 text-white font-black text-lg sm:text-xl shadow-red-glow border-2 border-yellow-300 animate-pulse flex items-center gap-3"
          @click="executeStop"
        >
          <span class="text-3xl">⛔</span>
          <span>صرخة «وقّف!»</span>
          <span v-if="matchingCardText" class="text-xs bg-black/40 px-2 py-0.5 rounded-full font-normal">
            ({{ matchingCardText }})
          </span>
        </button>

        <!-- Wait / Fold Button -->
        <button
          v-if="!game.canStop || !matchingCard"
          class="flex-1 px-6 py-3 rounded-full bg-slate-700/80 text-gray-300 font-medium text-sm sm:text-base border border-white/10 transition-colors"
          @click="waitForNext"
        >
          ⏳ انتظار
        </button>
      </div>

      <!-- Matching Card Preview -->
      <div v-if="matchingCard" class="mt-3 text-sm text-gray-300">
        <span class="text-amber-300 font-medium">🎯 لديك: {{ matchingCard.value.j ? '🃏 الجوكر الذهبي' : `${matchingCard.value.r} ${matchingCard.value.s}` }}</span>
      </div>

      <!-- Cinematic Effects Legend -->
      <div v-if="showLegend" class="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
        <p class="mb-1"><span class="text-amber-300">⏱️</span> تباطؤ الزمن: تنخفض السرعة إلى 20% للحظات الدرامية</p>
        <p class="mb-1"><span class="text-amber-300">💫</span> بقعة الضوء: المجلس ينطفئ وتسلط الأضواء على الخاطف</p>
        <p class="mb-1"><span class="text-amber-300">🏆</span> موجة الصدمة: الجوكر يُحدث صدمة ذهبية تغير موازين الجولة</p>
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

const ownerName = computed(() => {
  if (!game.pending) return ''
  const s = game.seats[game.pending.owner]
  return s?.name || `لاعب ${game.pending.owner + 1}`
})

const matchingCard = computed(() => {
  if (!game.pending) return null
  return game.myHand.find(c => c.j || c.r === game.pending!.rank)
})

const matchingCardText = computed(() => {
  if (!matchingCard.value) return ''
  if (matchingCard.value.j) return '🃏 الجوكر الذهبي'
  return `${matchingCard.value.r} ${matchingCard.value.s}`
})

const jokerUsed = computed(() => {
  if (!game.pending) return false
  return game.myHand.some(c => c.j && game.pending.stops?.includes(game.mySeat ?? 0))
})

const remainingSeconds = ref(5)
let secInterval: ReturnType<typeof setInterval> | null = null
let pulseInterval: ReturnType<typeof setInterval> | null = null
let showLegend = ref(true) // Show legend first time

function updateSeconds() {
  if (game.phase !== 'stop' || !game.deadline) {
    remainingSeconds.value = 5
    return
  }
  const now = Date.now()
  const deadlineTime = game.deadline + game.clockSkew
  const rem = Math.max(0, deadlineTime - now)
  remainingSeconds.value = Math.ceil(rem / 1000)
}

function startPulseEffect() {
  // Pulse the amber border when time is running out
  pulseInterval = setInterval(() => {
    // Intensity increases as time runs out
  }, 150)
}

function stopPulseEffect() {
  if (pulseInterval) {
    clearInterval(pulseInterval)
    pulseInterval = null
  }
}

function executeStop() {
  if (!matchingCard.value) return
  audio.sfx.stop()
  game.playCard('stop', matchingCard.value.id)
}

function waitForNext() {
  if (remainingSeconds.value <= 1) {
    // Time's up, auto-resolve
    if (game.deadline && game.phase === 'stop') {
      // Window resolves naturally
    }
  }
}

// Initialize
onMounted(() => {
  secInterval = setInterval(updateSeconds, 100)
  startPulseEffect()
})

onUnmounted(() => {
  if (secInterval) clearInterval(secInterval)
  if (pulseInterval) clearInterval(pulseInterval)
})

// Auto-hide legend after first show or when user interacts
watch(() => remainingSeconds.value, (newVal) => {
  if (newVal <= 3 && showLegend.value) {
    showLegend.value = false
  }
})
</script>

<!-- Animation Keyframes -->
<style scoped>
/* Pulse animation for low time */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

/* Shake animation for dramatic effect */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
</style>