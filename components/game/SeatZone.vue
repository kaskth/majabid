<template>
  <div class="relative flex flex-col items-center justify-center transition-all duration-300">
    <!-- Speech Bubble -->
    <Transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="scale-75 opacity-0 -translate-y-2"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-75 opacity-0"
    >
      <div
        v-if="hasBubble"
        class="absolute -top-12 z-40 px-3 py-1.5 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 text-xs font-bold max-w-[180px] text-center whitespace-normal break-words after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-white"
      >
        {{ seat?.bubble?.text }}
      </div>
    </Transition>

    <!-- Player Card / Avatar Container -->
    <div
      class="relative flex items-center gap-2.5 p-2 rounded-2xl backdrop-blur-md transition-all duration-300 border shadow-md"
      :class="[
        isCurrentTurn ? 'ring-2 ring-gold shadow-gold-glow bg-black/75 border-gold/60 scale-105' : 'bg-black/45 border-white/15',
        isMe ? 'border-amber-400/40 bg-emerald-950/40' : '',
        !seat?.connected && !seat?.isBot ? 'opacity-50 grayscale' : '',
      ]"
    >
      <!-- Timer Ring (SVG circle) -->
      <div v-if="isCurrentTurn && game.phase === 'acting'" class="absolute -inset-1 pointer-events-none z-10">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" class="stroke-white/10 fill-none" stroke-width="3" />
          <circle
            cx="50"
            cy="50"
            r="46"
            class="stroke-gold fill-none transition-all duration-200"
            stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="289"
            :stroke-dashoffset="ringOffset"
          />
        </svg>
      </div>

      <!-- Avatar -->
      <div class="relative">
        <UiAvatarImg
          :avatar="seat?.avatar || 'a1'"
          :size="isCurrentTurn ? 'md' : 'sm'"
          :border="isCurrentTurn ? 'gold' : 'white'"
        />
        <!-- Bot Thinking indicator -->
        <div
          v-if="isBotThinking"
          class="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/80 border border-gold/40 text-[9px] text-gold-light animate-pulse"
        >
          <span>•••</span>
        </div>
      </div>

      <!-- Player Info -->
      <div class="flex flex-col text-right leading-tight">
        <div class="flex items-center gap-1">
          <span v-if="seat?.rank" class="text-xs">{{ seat.rank }}</span>
          <span class="font-bold text-xs sm:text-sm text-white max-w-[90px] truncate">
            {{ seat?.name || `لاعب ${seatIndex + 1}` }}
          </span>
          <span v-if="seat?.bot || seat?.isBot" class="text-[10px] text-emerald-400">🤖</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] text-gray-300">
          <span class="text-gold-light font-mono font-bold">🂠 {{ handCount }}</span>
          <span v-if="isMe" class="px-1 py-0.2 text-[9px] rounded bg-gold/20 text-gold font-bold">أنت</span>
        </div>
      </div>

      <!-- Partner Ping Bell Button (For player) -->
      <button
        v-if="isMe && game.isMyTurn"
        class="ml-1 p-1 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-gold border border-gold/40 text-xs transition-transform active:scale-90"
        title="نادِ شريكك"
        @click="sendPing"
      >
        🔔
      </button>
    </div>

    <!-- 3D Card Tower / Pile -->
    <div class="mt-2 flex items-center justify-center gap-1.5 min-h-[50px]">
      <!-- Buried Cards Stack -->
      <div v-if="pile.buriedCount > 0" class="flex flex-col items-center">
        <div class="relative w-8 h-11">
          <div
            v-for="k in Math.min(pile.buriedCount, 3)"
            :key="k"
            class="absolute inset-0 rounded overflow-hidden shadow-sm"
            :style="{ transform: `translateY(${-k * 2}px) translateX(${k * 1}px)` }"
          >
            <GameCard :back="true" />
          </div>
        </div>
        <span class="text-[10px] font-bold text-gray-300 mt-0.5">مدفون {{ pile.buriedCount }}</span>
      </div>

      <!-- Chain Top (الجبيد) -->
      <div v-if="pile.chain" class="flex flex-col items-center">
        <div class="relative w-9 h-12">
          <div
            v-for="k in Math.min(pile.chain.count, 3)"
            :key="k"
            class="absolute inset-0 rounded overflow-hidden shadow-md"
            :style="{ transform: `translateY(${-k * 2}px) rotate(${k * 1.5}deg)` }"
          >
            <GameCard :rank="pile.chain.rank" suit="♥" />
          </div>
        </div>
        <span class="text-[10px] font-bold text-amber-300 mt-0.5">👑 جبيد {{ pile.chain.rank }} ×{{ pile.chain.count }}</span>
      </div>

      <!-- Pending Stop Capture Stack (الأكلة المعلقة في الهواء) -->
      <div v-if="isPendingOwner" class="flex flex-col items-center animate-bounce">
        <div class="relative w-9 h-12">
          <GameCard :rank="game.pending!.rank" suit="♥" />
        </div>
        <span class="text-[10px] font-bold text-amber-400 bg-black/60 px-1 rounded">🍽️ {{ game.pending!.count }} ورقة</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore, type SeatData, type PileData } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

const props = defineProps<{
  seatIndex: number
  seat: SeatData | null
  pile: PileData
}>()

const game = useGameStore()
const audio = useAudioStore()

const isMe = computed(() => props.seatIndex === game.mySeat)
const isCurrentTurn = computed(() => game.turn === props.seatIndex && game.phase !== 'end')
const handCount = computed(() => game.handCounts[props.seatIndex] || 0)
const isPendingOwner = computed(() => game.pending?.owner === props.seatIndex && game.phase === 'stop')
const isBotThinking = computed(() => {
  return (props.seat?.bot || props.seat?.isBot) && isCurrentTurn.value && game.phase === 'acting'
})

const hasBubble = computed(() => {
  if (!props.seat?.bubble?.text) return false
  return Date.now() - (props.seat.bubble.at || 0) < 4500
})

// Timer calculation
const ringOffset = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

function updateTimer() {
  if (!isCurrentTurn.value || !game.deadline) {
    ringOffset.value = 0
    return
  }
  const now = Date.now()
  const deadlineTime = game.deadline + game.clockSkew
  const total = game.phase === 'stop' ? 5000 : 20000
  const remaining = Math.max(0, deadlineTime - now)
  const frac = Math.min(1, Math.max(0, remaining / total))
  ringOffset.value = 289 * (1 - frac)
}

onMounted(() => {
  timerInterval = setInterval(updateTimer, 100)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function sendPing() {
  audio.sfx.ping()
  game.sendChat('📣 جاوبني يا شريكي!')
}
</script>
