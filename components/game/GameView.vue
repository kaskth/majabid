<template>
  <div
    class="relative w-full min-h-screen flex flex-col justify-between overflow-hidden select-none transition-colors duration-500"
    :class="tableBackgroundClass"
  >
    <!-- Dynamic Atmosphere Layer -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <!-- Ambient Gradient Base -->
      <div class="absolute inset-0" :style="getThemeBackground(ui.theme)" />

      <!-- Theme 1: Royal Najd Majlis (مجلس نجد الملكي) -->
      <div v-if="ui.theme === 1" class="absolute inset-0">
        <!-- Emerald Table Bloom -->
        <div class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-700/20 rounded-full blur-3xl" />
        <!-- Subtle Najdi Sadu Carpet Motifs on side borders -->
        <div class="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-amber-500/10 to-transparent border-r border-amber-500/10" />
        <div class="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-amber-500/10 to-transparent border-l border-amber-500/10" />
        <!-- Hanging Lantern Glows -->
        <div class="absolute top-4 left-6 w-12 h-16 rounded-full bg-amber-400/15 blur-lg animate-pulse" />
        <div class="absolute top-4 right-6 w-12 h-16 rounded-full bg-amber-400/15 blur-lg animate-pulse" style="animation-delay: 1.5s;" />
      </div>

      <!-- Theme 2: Desert Starlit Camp (مخيم الصمان الليلي) -->
      <div v-if="ui.theme === 2" class="absolute inset-0">
        <!-- Deep Night Gradient & Stars -->
        <div class="absolute top-8 left-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-80 animate-ping" style="animation-duration: 3s;" />
        <div class="absolute top-16 right-1/3 w-2 h-2 bg-amber-200 rounded-full opacity-70 animate-pulse" style="animation-duration: 4s;" />
        <div class="absolute top-24 left-2/3 w-1 h-1 bg-white rounded-full opacity-90" />
        <div class="absolute top-12 right-16 w-1.5 h-1.5 bg-yellow-100 rounded-full opacity-75" />
        <!-- Desert Camp Fire Glow at bottom center -->
        <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[480px] h-[220px] bg-amber-600/20 rounded-full blur-3xl animate-pulse" style="animation-duration: 2.5s;" />
      </div>

      <!-- Theme 3: Dubai Sky-Lounge VIP (سكاي روف دبي) -->
      <div v-if="ui.theme === 3" class="absolute inset-0">
        <!-- Modern VIP Neon Aura -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-blue-600/15 rounded-full blur-3xl" />
        <div class="absolute top-1/4 right-10 w-44 h-44 bg-purple-600/10 rounded-full blur-2xl" />
      </div>

      <!-- Theme 4: Heritage Café (قهوة البلد الحجازية) -->
      <div v-if="ui.theme === 4" class="absolute inset-0">
        <!-- Warm Wood & Roushin Glow -->
        <div class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-900/25 rounded-full blur-3xl" />
        <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-700/30 via-amber-500/20 to-amber-700/30" />
        <div class="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/10 rounded-full blur-xl" />
      </div>
    </div>

    <!-- Top Bar -->
    <header class="w-full flex items-center justify-between px-3 sm:px-5 py-2 bg-black/70 backdrop-blur-md border-b border-white/10 z-40">
      <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <b class="font-black text-sm sm:text-base text-gold-light">🂡 مجابيد</b>
        <span class="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-xs font-mono text-amber-200">
          {{ game.roomCode }}
        </span>
        <span class="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-xs font-bold text-gray-200">
          الجولة {{ game.round }}
        </span>
        <span class="px-2.5 py-0.5 rounded-full bg-black/60 border border-gold/40 text-xs font-mono text-amber-300">
          🂠 {{ game.deckCount }}
        </span>
        <span v-if="game.isFinal" class="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] sm:text-xs animate-pulse">
          ⏳ الطور الختامي
        </span>
        <span v-if="game.target > 0" class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-bold">
          🏁 حتى {{ game.target }}
        </span>
      </div>

      <!-- Right side controls -->
      <div class="flex items-center gap-2">
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

    <!-- Spectator Banner -->
    <div v-if="game.isSpec" class="w-full bg-amber-500/20 text-amber-300 text-center py-1 text-xs font-bold border-b border-amber-400/30 z-30">
      👁️ تشاهد الجلسة المباشرة كمتفرج (بلا تحكم وبلا كشف للأوراق)
    </div>

    <!-- Live Game Events Log Strip -->
    <div class="w-full max-w-xl mx-auto px-2 py-1 flex items-center gap-2 overflow-x-auto no-scrollbar z-30 pointer-events-none">
      <div
        v-for="log in game.logs.slice(0, 4)"
        :key="log.id"
        class="shrink-0 px-2.5 py-0.5 rounded-full bg-black/75 border border-white/10 text-[10px] sm:text-xs text-gray-200 backdrop-blur-sm shadow-sm"
      >
        {{ log.text }}
      </div>
    </div>

    <!-- Table Playing Board & Players -->
    <div class="relative flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between items-center px-3 py-1 z-20">
      <!-- Top Seat Zone -->
      <div class="z-20">
        <GameSeatZone :seat-index="topSeatIndex" :seat="game.seats[topSeatIndex]" :pile="game.piles[topSeatIndex]" />
      </div>

      <!-- Middle Row -->
      <div class="w-full flex items-center justify-between gap-2 z-10">
        <!-- Left Seat -->
        <div class="shrink-0">
          <GameSeatZone :seat-index="leftSeatIndex" :seat="game.seats[leftSeatIndex]" :pile="game.piles[leftSeatIndex]" />
        </div>

        <!-- Center Table Board -->
        <div class="flex-1 flex justify-center">
          <GameTableBoard />
        </div>

        <!-- Right Seat -->
        <div class="shrink-0">
          <GameSeatZone :seat-index="rightSeatIndex" :seat="game.seats[rightSeatIndex]" :pile="game.piles[rightSeatIndex]" />
        </div>
      </div>

      <!-- Bottom Player Seat Zone -->
      <div class="z-20">
        <GameSeatZone :seat-index="bottomSeatIndex" :seat="game.seats[bottomSeatIndex]" :pile="game.piles[bottomSeatIndex]" />
      </div>
    </div>

    <!-- Stop Ambush Banner -->
    <GameStopBanner />

    <!-- Action Buttons Row -->
    <div
      v-if="game.isMyTurn && game.phase === 'acting'"
      class="w-full max-w-lg mx-auto flex items-center justify-center gap-2.5 px-3 z-30 my-1"
    >
      <!-- Eat Button(s) -->
      <template v-if="selectedCardEats.length > 0">
        <button
          v-for="r in selectedCardEats"
          :key="r"
          class="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs sm:text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-transform"
          @click="game.playCard('eat', game.selectedCardId!, r)"
        >
          🍽️ أكل {{ r }}
        </button>
      </template>

      <!-- Discard Button -->
      <button
        v-if="canDiscardSelected"
        class="px-4 py-2 rounded-2xl bg-slate-800/95 hover:bg-slate-700 text-white font-black text-xs sm:text-sm border border-white/20 shadow-md active:scale-95 transition-transform"
        @click="game.playCard('discard', game.selectedCardId!)"
      >
        🎯 ارمِ للميدان
      </button>

      <!-- Pass Button -->
      <button
        v-if="!game.myOptions.mustEat"
        class="px-4 py-2 rounded-2xl bg-black/70 hover:bg-black/90 text-gray-300 font-bold text-xs border border-white/15 active:scale-95 transition-colors"
        @click="game.playCard('pass')"
      >
        ⏭️ تجاوز
      </button>
    </div>

    <!-- Bottom Hand Fan Zone -->
    <div class="w-full z-30 pb-2">
      <GameHandFan />
    </div>

    <!-- Round End Modal -->
    <ModalsRoundEndModal v-if="game.phase === 'end'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const audio = useAudioStore()
const ui = useUiStore()

// Relative seat positions so player is always at the bottom
const bottomSeatIndex = computed(() => {
  return game.mySeat >= 0 ? game.mySeat : 0
})

const leftSeatIndex = computed(() => {
  return game.mySeat >= 0 ? (game.mySeat + 1) % 4 : 1
})

const topSeatIndex = computed(() => {
  return game.mySeat >= 0 ? (game.mySeat + 2) % 4 : 2
})

const rightSeatIndex = computed(() => {
  return game.mySeat >= 0 ? (game.mySeat + 3) % 4 : 3
})

const selectedCardEats = computed(() => {
  if (!game.selectedCardId) return []
  const opt = game.myOptions.cards[game.selectedCardId]
  return opt?.eats || []
})

const canDiscardSelected = computed(() => {
  if (!game.selectedCardId) return false
  const opt = game.myOptions.cards[game.selectedCardId]
  return !!opt?.discard
})

const tableBackgroundClass = computed(() => {
  switch (ui.theme) {
    case 2:
      return 'bg-[#030812]'
    case 3:
      return 'bg-[#050a18]'
    case 4:
      return 'bg-[#0e0305]'
    case 1:
    default:
      return 'bg-[#040c07]'
  }
})

function getThemeBackground(t: number) {
  switch (t) {
    case 2:
      return { background: 'radial-gradient(ellipse at center, #0a1f38 0%, #030812 100%)' }
    case 3:
      return { background: 'radial-gradient(ellipse at center, #132244 0%, #050a18 100%)' }
    case 4:
      return { background: 'radial-gradient(ellipse at center, #2e1015 0%, #0e0305 100%)' }
    case 1:
    default:
      return { background: 'radial-gradient(ellipse at center, #0d281a 0%, #040c07 100%)' }
  }
}
</script>