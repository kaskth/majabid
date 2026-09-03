<template>
  <div :id="`seat-zone-${seatIndex}`" class="relative flex flex-col items-center justify-center transition-all duration-300">
    <!-- Speech Bubble (Smart Placement & Tail) -->
    <Transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="scale-75 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-75 opacity-0"
    >
      <div
        v-if="hasBubble"
        class="absolute z-50 px-2.5 py-1 bg-black/95 text-amber-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.8)] border border-amber-400/80 text-[11px] font-black max-w-[170px] min-w-[70px] text-center whitespace-normal break-words pointer-events-none"
        :class="[bubbleWrapperClass, bubbleTailClass]"
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
        class="absolute -top-8 -right-2 z-50 text-2xl filter drop-shadow animate-bounce select-none pointer-events-none"
      >
        {{ seat?.reaction?.emoji }}
      </div>
    </Transition>

    <!-- 1. COMPACT MODE (For Mobile Top Row & Tight Spaces) -->
    <div
      v-if="compact"
      class="relative flex items-center gap-1.5 px-2 py-1 rounded-xl backdrop-blur-md transition-all duration-300 border shadow-md select-none max-w-full"
      :class="[
        teamPodClass,
        isCurrentTurn ? 'ring-2 ring-amber-400 scale-102 bg-black/85 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-black/65',
        !seat?.connected && !seat?.isBot ? 'opacity-50 grayscale' : '',
      ]"
    >
      <!-- Mini Avatar & Dealer Chip -->
      <div class="relative shrink-0">
        <UiAvatarImg
          :avatar="seat?.avatar || 'a1'"
          size="xs"
          :border="isCurrentTurn ? 'gold' : 'none'"
        />
        <span v-if="isDealer" class="absolute -top-2 -right-1 text-[9px]">🪙</span>
        <!-- Turn indicator dot -->
        <span
          v-if="isCurrentTurn"
          class="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"
        />
      </div>

      <!-- Player Info & Hand / Buried Count -->
      <div class="flex flex-col text-right leading-none min-w-0">
        <div class="flex items-center gap-1">
          <span class="font-bold text-[10px] sm:text-[11px] text-white truncate max-w-[65px]">
            {{ seat?.name || `لاعب ${seatIndex + 1}` }}
          </span>
          <span v-if="seat?.bot || seat?.isBot" class="text-[8px] text-emerald-400">🤖</span>
        </div>
        <div class="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-300 mt-0.5 font-mono">
          <span class="text-amber-300 font-bold">🂠 {{ handCount }}</span>
          <span v-if="pile?.buriedCount" class="text-gray-400">📦 {{ pile.buriedCount }}</span>
          <span v-if="pile?.chain" class="text-amber-400 font-bold">👑 {{ pile.chain.rank }}</span>
        </div>
      </div>
    </div>

    <!-- 2. FULL STANDARD MODE (For Desktop & Tablet) -->
    <div
      v-else
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

    <!-- 3D Card Piles (Madfoon & Chain) - only in full mode -->
    <div v-if="!compact && pile" class="mt-2 flex items-center justify-center gap-2 min-h-[52px]">
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

      <!-- Pending Stop Capture Stack -->
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
  pile?: PileData
  compact?: boolean
  placement?: 'top' | 'left' | 'right' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  placement: 'top',
})

const bubbleWrapperClass = computed(() => {
  if (props.placement === 'left') {
    return 'top-1/2 -translate-y-1/2 left-full ml-2'
  }
  if (props.placement === 'right') {
    return 'top-1/2 -translate-y-1/2 right-full mr-2'
  }
  if (props.placement === 'bottom') {
    return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
  }
  // Default 'top': place BELOW the top player pod so it points UP to him and stays 100% visible on table!
  return 'top-full mt-2 left-1/2 -translate-x-1/2'
})

const bubbleTailClass = computed(() => {
  if (props.placement === 'left') {
    return "after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:right-full after:border-4 after:border-transparent after:border-r-amber-400"
  }
  if (props.placement === 'right') {
    return "after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:border-4 after:border-transparent after:border-l-amber-400"
  }
  if (props.placement === 'bottom') {
    return "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-amber-400"
  }
  // Pointing UP to the top player
  return "after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-amber-400"
})

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
  if (game.mode !== 'teams') return 'border-white/15 bg-black/60'
  return props.seatIndex % 2 === 0
    ? 'border-blue-500/40 bg-blue-950/40'
    : 'border-rose-500/40 bg-rose-950/40'
})

const canEatChain = computed(() => {
  if (!game.isMyTurn || !props.pile?.chain) return false
  if (props.seatIndex === game.mySeat) return false
  if (game.mode === 'teams' && props.seatIndex % 2 === game.mySeat % 2) return false
  return game.myHand.some((c: CardData) => c.j || c.r === props.pile.chain!.rank)
})

function onChainClick() {
  if (!canEatChain.value || !props.pile?.chain) return
  const match = game.myHand.find((c: CardData) => c.r === props.pile.chain!.rank) || game.myHand.find((c: CardData) => c.j)
  if (match) {
    audio.sfx.eat()
    game.playEat(match.id!, props.pile.chain.rank)
  }
}

// Turn countdown ring
const now = ref(Date.now())
let timerInterval: any = null

onMounted(() => {
  timerInterval = setInterval(() => { now.value = Date.now() }, 100)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const ringOffset = computed(() => {
  if (!game.deadline || game.phase !== 'acting') return 0
  const total = 20000
  const rem = Math.max(0, game.deadline - now.value)
  const frac = Math.min(1, Math.max(0, rem / total))
  return 289 * (1 - frac)
})
</script>
