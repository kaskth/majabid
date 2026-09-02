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
        class="absolute -top-14 z-50 px-3 py-1.5 bg-black/95 text-amber-200 rounded-2xl shadow-2xl border border-amber-400/60 text-xs font-black max-w-[210px] text-center whitespace-normal break-words after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-amber-400"
      >
        {{ seat?.bubble?.text }}
      </div>
    </Transition>

    <!-- Floating Live Reaction Emoji -->
    <Transition
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="scale-0 opacity-0 translate-y-2"
      enter-to-class="scale-125 opacity-100 -translate-y-2"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="scale-125 opacity-100"
      leave-to-class="scale-0 opacity-0 -translate-y-5"
    >
      <div
        v-if="hasReaction"
        class="absolute -top-10 -right-2 z-50 text-3xl filter drop-shadow animate-bounce select-none pointer-events-none"
      >
        {{ seat?.reaction?.emoji }}
      </div>
    </Transition>

    <!-- Player Card / Avatar Container with Team Color Styling -->
    <div
      class="relative flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md transition-all duration-300 border shadow-lg select-none"
      :class="[
        teamPodClass,
        isMe ? 'ring-1 ring-amber-300/40' : '',
        !seat?.connected && !seat?.isBot ? 'opacity-50 grayscale' : '',
      ]"
    >
      <!-- Turn Timer Ring (SVG circle) -->
      <div v-if="isCurrentTurn && game.phase === 'acting'" class="absolute -inset-1 pointer-events-none z-10">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" class="stroke-white/10 fill-none" stroke-width="3" />
          <circle
            cx="50"
            cy="50"
            r="46"
            class="fill-none transition-all duration-200"
            :class="seatIndex % 2 === 0 ? 'stroke-blue-400' : 'stroke-rose-400'"
            stroke-width="4.5"
            stroke-linecap="round"
            :stroke-dasharray="289"
            :stroke-dashoffset="ringOffset"
          />
        </svg>
      </div>

      <!-- Avatar & 3D Dealer Chip -->
      <div class="relative">
        <UiAvatarImg
          :avatar="seat?.avatar || 'a1'"
          :size="isCurrentTurn ? 'md' : 'sm'"
          :border="isCurrentTurn ? 'gold' : 'white'"
        />
        <!-- 3D Rotating Dealer Chip -->
        <span
          v-if="isDealer"
          class="absolute -top-2 -right-1 text-sm select-none animate-bounce"
          title="موزّع الجولة"
        >
          🪙
        </span>
        <!-- Bot Thinking indicator -->
        <div
          v-if="isBotThinking"
          class="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/90 border border-gold/40 text-[9px] text-gold-light animate-pulse"
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
          <span v-if="isMe" class="px-1.5 py-0.2 text-[9px] rounded bg-gold/20 text-gold font-black">أنت</span>
          <span
            v-if="game.mode === 'teams'"
            class="text-[9px] font-black px-1 rounded"
            :class="seatIndex % 2 === 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300'"
          >
            {{ seatIndex % 2 === 0 ? 'أزرق' : 'أحمر' }}
          </span>
        </div>
      </div>

      <!-- Quick Reaction Trigger (For Me) -->
      <div v-if="isMe" class="flex items-center gap-1 ml-1">
        <button
          v-for="em in quickEmojis"
          :key="em"
          class="text-xs hover:scale-130 active:scale-95 transition-transform p-0.5"
          :title="`تفاعل ${em}`"
          @click="game.sendReaction(em)"
        >
          {{ em }}
        </button>
      </div>
    </div>

    <!-- 3D Card Piles (Madfoon & Chain) -->
    <div class="mt-2 flex items-center justify-center gap-2 min-h-[52px]">
      <!-- Buried Stack (المدفون) with 3D Depth -->
      <div v-if="pile.buriedCount > 0" class="flex flex-col items-center select-none">
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
        <span class="text-[9px] font-bold text-gray-300 mt-0.5 font-mono">مدفون {{ pile.buriedCount }}</span>
      </div>

      <!-- Chain Top (الجبيد) with Click-to-Steal -->
      <div
        v-if="pile.chain"
        class="flex flex-col items-center transition-transform"
        :class="[
          canEatChain
            ? 'cursor-pointer hover:scale-115 p-0.5 rounded-xl border border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)] animate-pulse'
            : ''
        ]"
        :title="canEatChain ? 'اسرق جبيد الخصم!' : `جبيد ${pile.chain.rank}`"
        @click="onChainClick"
      >
        <div class="relative w-9 sm:w-10 h-13 sm:h-14">
          <div
            v-for="k in Math.min(pile.chain.count, 3)"
            :key="k"
            class="absolute inset-0 rounded overflow-hidden shadow-md"
            :style="{ transform: `translateY(${-k * 2}px) rotate(${k * 1.5}deg)` }"
          >
            <GameCard :rank="pile.chain.rank" :suit="pile.chain.suit || '♠'" />
          </div>
        </div>
        <span class="text-[9px] font-bold text-amber-300 mt-0.5 select-none">
          👑 {{ pile.chain.rank }} ×{{ pile.chain.count }}
        </span>
      </div>

      <!-- Pending Stop Capture Stack (الأكلة المعلقة في الهواء) -->
      <div v-if="isPendingOwner" class="flex flex-col items-center animate-bounce select-none">
        <div class="relative w-9 sm:w-10 h-13 sm:h-14 shadow-[0_0_20px_rgba(245,158,11,0.8)]">
          <GameCard
            :rank="game.pending!.rank"
            :suit="game.pending!.suit || '♥'"
            :joker="game.pending!.hasJoker"
          />
        </div>
        <span class="text-[9px] font-bold text-amber-300 bg-black/85 border border-amber-400/50 px-1.5 py-0.2 rounded-full mt-0.5 shadow">
          🍽️ {{ game.pending!.count }} ورقة
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore, type SeatData, type PileData, type CardData } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

interface Props {
  seatIndex: number
  seat: SeatData | null
  pile: PileData
}

const props = defineProps<Props>()

const game = useGameStore()
const audio = useAudioStore()

const isMe = computed(() => props.seatIndex === game.mySeat)
const isDealer = computed(() => game.dealer === props.seatIndex)
const isCurrentTurn = computed(() => game.turn === props.seatIndex && game.phase !== 'end')
const handCount = computed(() => game.handCounts[props.seatIndex] || 0)
const isPendingOwner = computed(() => game.pending?.owner === props.seatIndex && game.phase === 'stop')
const isBotThinking = computed(() => {
  return (props.seat?.bot || props.seat?.isBot) && isCurrentTurn.value && game.phase === 'acting'
})

const quickEmojis = ['🔥', '😎', '👏', '💔', '👑']

const hasBubble = computed(() => {
  if (!props.seat?.bubble?.text) return false
  return Date.now() - (props.seat.bubble.at || 0) < 4500
})

const hasReaction = computed(() => {
  if (!props.seat?.reaction?.emoji) return false
  return Date.now() - (props.seat.reaction.at || 0) < 3500
})

const teamPodClass = computed(() => {
  if (game.mode === 'ffa') {
    return isCurrentTurn.value
      ? 'border-amber-400 bg-black/85 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-400 scale-105'
      : 'border-white/15 bg-black/50'
  }
  const isBlue = props.seatIndex % 2 === 0
  if (isCurrentTurn.value) {
    return isBlue
      ? 'border-blue-400 bg-blue-950/80 shadow-[0_0_25px_rgba(59,130,246,0.6)] ring-2 ring-blue-400 scale-105'
      : 'border-rose-400 bg-rose-950/80 shadow-[0_0_25px_rgba(244,63,94,0.6)] ring-2 ring-rose-400 scale-105'
  }
  return isBlue
    ? 'border-blue-500/30 bg-blue-950/45 hover:border-blue-400/50'
    : 'border-rose-500/30 bg-rose-950/45 hover:border-rose-400/50'
})

const canEatChain = computed(() => {
  if (isMe.value || !game.isMyTurn || !props.pile.chain) return false
  const r = props.pile.chain.rank
  return game.myHand.some((c) => c.r === r || c.j)
})

function onChainClick() {
  if (!canEatChain.value || !props.pile.chain) return
  const rank = props.pile.chain.rank
  let cardToUse: CardData | undefined = game.myHand.find((c) => c.id === game.selectedCardId)

  if (!cardToUse || (cardToUse.r !== rank && !cardToUse.j)) {
    cardToUse = game.myHand.find((c) => c.r === rank) || game.myHand.find((c) => c.j)
    if (cardToUse) {
      game.selectedCardId = cardToUse.id!
      audio.sfx.pick()
    }
  }

  if (cardToUse) {
    audio.sfx.eat()
    audio.sfx.sweep()
    game.playEat(cardToUse.id!, rank)
  }
}

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
</script>
