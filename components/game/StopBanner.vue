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
      class="fixed bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[92vw] w-auto"
    >
      <!-- Stop Status Banner -->
      <div class="px-5 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-400/60 shadow-gold-glow text-center flex items-center gap-3">
        <span class="text-2xl animate-bounce">🍽️</span>
        <div class="flex flex-col text-right">
          <div class="text-sm sm:text-base font-black text-amber-300">
            {{ ownerName }} أكل {{ game.pending.rank }} ({{ game.pending.count }} ورقة)
          </div>
          <div class="text-[11px] text-gray-300">
            {{ game.canStop ? '⛔ الورقة في يدك! اخطف الأكلة فوراً' : 'من يملك نفس الرقم أو الجوكر يمكنه الخطف' }}
          </div>
        </div>
        <!-- Countdown Seconds -->
        <div class="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center font-black text-amber-300 font-mono text-sm">
          {{ remainingSeconds }}
        </div>
      </div>

      <!-- Pulsing Ambush Button (When player CAN stop) -->
      <button
        v-if="game.canStop"
        class="group relative px-8 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 text-white font-black text-lg sm:text-xl shadow-red-glow border-2 border-yellow-300 animate-pulse transition-transform active:scale-95 flex items-center gap-2"
        @click="executeStop"
      >
        <span class="text-2xl">⛔</span>
        <span>صرخة «وقّف!»</span>
        <span v-if="matchingCardText" class="text-xs bg-black/40 px-2 py-0.5 rounded-full font-normal">
          ({{ matchingCardText }})
        </span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
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

const remainingSeconds = ref(5)
let secInterval: ReturnType<typeof setInterval> | null = null

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

onMounted(() => {
  secInterval = setInterval(updateSeconds, 150)
})

onUnmounted(() => {
  if (secInterval) clearInterval(secInterval)
})

function executeStop() {
  if (!matchingCard.value) return
  audio.sfx.stop()
  game.playCard('stop', matchingCard.value.id)
}
</script>
