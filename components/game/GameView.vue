<template>
  <div
    class="relative w-full h-screen overflow-hidden flex flex-col justify-between select-none"
    :class="[
      game.isFinal ? 'ring-4 ring-red-500/40' : '',
      tableBackgroundClass
    ]"
  >
    <!-- Top Bar -->
    <header class="w-full flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-md border-b border-white/10 z-40">
      <!-- Left side info -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <b class="font-black text-sm sm:text-base text-gold-light">🂡 مجابيد</b>
        <span class="px-2 py-0.5 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono text-gray-300">
          {{ game.roomCode }}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-black/60 border border-white/15 text-[11px] font-bold text-gray-200">
          الجولة {{ game.round }}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-black/60 border border-gold/40 text-[11px] font-mono text-amber-300">
          🂠 {{ game.deckCount }}
        </span>
        <span v-if="game.isFinal" class="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] animate-pulse">
          ⏳ الطور الختامي
        </span>
        <span v-if="game.target > 0" class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
          🏁 حتى {{ game.target }}
        </span>
      </div>

      <!-- Right side controls -->
      <div class="flex items-center gap-1.5">
        <GameChatPicker />
        <button
          class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 text-base"
          :title="audio.isMuted ? 'تشغيل الصوت' : 'كتم الصوت'"
          @click="audio.toggleMute"
        >
          {{ audio.isMuted ? '🔇' : '🔊' }}
        </button>
        <button
          class="p-2 rounded-full bg-black/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-transform active:scale-95 text-base"
          title="مغادرة الطاولة"
          @click="game.leaveRoom"
        >
          🚪
        </button>
      </div>
    </header>

    <!-- Spectator Banner (If spectating) -->
    <div v-if="game.isSpec" class="w-full bg-amber-500/20 text-amber-300 text-center py-1 text-xs font-bold border-b border-amber-400/30">
      👁️ تشاهد الجلسة المباشرة كمتفرج (بلا تحكم وبلا كشف للأوراق)
    </div>

    <!-- Live Game Events Log Ticker -->
    <div class="w-full max-w-xl mx-auto px-2 py-1 flex items-center gap-2 overflow-x-auto no-scrollbar z-30 pointer-events-none">
      <div
        v-for="log in game.logs.slice(0, 3)"
        :key="log.id"
        class="shrink-0 px-2.5 py-0.5 rounded-full bg-black/65 border border-white/10 text-[10px] sm:text-xs text-gray-200 backdrop-blur-sm shadow-sm"
      >
        {{ log.text }}
      </div>
    </div>

    <!-- Table Playing Board (Seat zones + Center Tray) -->
    <div class="relative flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between items-center px-3 py-1">
      <!-- Top Seat Zone (Seat 2 / Partner or Opponent 2) -->
      <div class="z-20">
        <GameSeatZone
          :seat-index="topSeatIndex"
          :seat="game.seats[topSeatIndex]"
          :pile="game.piles[topSeatIndex]"
        />
      </div>

      <!-- Middle Row: Left Seat, Center Board, Right Seat -->
      <div class="w-full flex items-center justify-between gap-2 z-10">
        <!-- Left Seat (Seat 3) -->
        <div class="shrink-0">
          <GameSeatZone
            :seat-index="leftSeatIndex"
            :seat="game.seats[leftSeatIndex]"
            :pile="game.piles[leftSeatIndex]"
          />
        </div>

        <!-- Center Table (Field & Deck) -->
        <div class="flex-1 flex justify-center">
          <GameTableBoard />
        </div>

        <!-- Right Seat (Seat 1) -->
        <div class="shrink-0">
          <GameSeatZone
            :seat-index="rightSeatIndex"
            :seat="game.seats[rightSeatIndex]"
            :pile="game.piles[rightSeatIndex]"
          />
        </div>
      </div>

      <!-- Bottom Player Seat Zone (Seat 0 / Me) -->
      <div class="z-20">
        <GameSeatZone
          :seat-index="bottomSeatIndex"
          :seat="game.seats[bottomSeatIndex]"
          :pile="game.piles[bottomSeatIndex]"
        />
      </div>
    </div>

    <!-- Stop Ambush Banner -->
    <GameStopBanner />

    <!-- Action Buttons Row (Eat / Discard / Pass) -->
    <div
      v-if="game.isMyTurn && game.phase === 'acting'"
      class="w-full max-w-lg mx-auto flex items-center justify-center gap-2 px-3 z-30 my-1"
    >
      <!-- Eat Button(s) for selected card -->
      <template v-if="selectedCardEats.length > 0">
        <button
          v-for="r in selectedCardEats"
          :key="r"
          class="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs sm:text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-transform"
          @click="game.playCard('eat', game.selectedCardId!, r)"
        >
          🍽️ أكل {{ r }}
        </button>
      </template>

      <!-- Discard Button -->
      <button
        v-if="canDiscardSelected"
        class="px-4 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-black text-xs sm:text-sm border border-white/20 shadow-md active:scale-95 transition-transform"
        @click="game.playCard('discard', game.selectedCardId!)"
      >
        🎯 ارمِ للميدان
      </button>

      <!-- Pass Button -->
      <button
        v-if="!game.myOptions.mustEat"
        class="px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-gray-300 font-bold text-xs border border-white/10 active:scale-95 transition-colors"
        @click="game.playCard('pass')"
      >
        ⏭️ تجاوز
      </button>
    </div>

    <!-- Player's Hand Fan -->
    <div class="w-full pb-1 z-30">
      <GameHandFan />
    </div>

    <!-- End Round Modal (When round finishes) -->
    <ModalsRoundEndModal v-if="game.phase === 'end'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import { useUiStore } from '~/stores/ui'
import { useAudioStore } from '~/stores/audio'

const game = useGameStore()
const ui = useUiStore()
const audio = useAudioStore()

// Seat placement relative to current player
const bottomSeatIndex = computed(() => (game.mySeat >= 0 ? game.mySeat : 0))
const rightSeatIndex = computed(() => (bottomSeatIndex.value + 1) % 4)
const topSeatIndex = computed(() => (bottomSeatIndex.value + 2) % 4)
const leftSeatIndex = computed(() => (bottomSeatIndex.value + 3) % 4)

const selectedCardEats = computed(() => {
  if (!game.selectedCardId) return []
  return game.myOptions.cards[game.selectedCardId]?.eats || []
})

const canDiscardSelected = computed(() => {
  if (!game.selectedCardId) return false
  return game.myOptions.cards[game.selectedCardId]?.discard || false
})

const tableBackgroundClass = computed(() => {
  switch (ui.theme) {
    case 1:
      return 'bg-gradient-to-b from-[#0e2c1a] via-[#07190f] to-[#040c07]'
    case 2:
      return 'bg-gradient-to-b from-[#3a0c12] via-[#1f0509] to-[#0d0204]'
    case 3:
      return 'bg-gradient-to-b from-[#0d1d3a] via-[#060e1f] to-[#02050d]'
    default:
      return 'bg-gradient-to-b from-[#0e2c1a] via-[#07190f] to-[#040c07]'
  }
})
</script>
