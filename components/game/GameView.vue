<template>
  <div
    class="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none touch-none transition-colors duration-500"
    :class="tableBackgroundClass"
  >
    <!-- ============================================================ -->
    <!-- PHOTOREALISTIC AI THEME BACKGROUND LAYER                    -->
    <!-- ============================================================ -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <!-- AI Atmosphere Photo with Smooth Crossfade -->
      <Transition
        enter-active-class="transition-opacity duration-700 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-500 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <img
          :key="ui.theme"
          :src="currentThemeImage"
          alt="Atmosphere Background"
          class="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.1] saturate-[1.15] transform-gpu scale-105"
        />
      </Transition>

      <!-- Atmospheric Ambient Color Gradient & Vignette for Readability -->
      <div class="absolute inset-0 transition-colors duration-700" :class="themeVignetteClass" />

      <!-- Center Depth Shadow for 3D Table Pop -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
    </div>

    <!-- ============================================================ -->
    <!-- TOP HEADER BAR (Ultra Mobile Friendly)                       -->
    <!-- ============================================================ -->
    <header class="w-full flex items-center justify-between px-2 sm:px-4 py-1 landscape:py-0.5 bg-black/80 backdrop-blur-md border-b border-white/10 z-40">
      <div class="flex items-center gap-1 sm:gap-2 flex-wrap text-xs">
        <b class="font-black text-xs sm:text-base text-gold-light">🂡 مجابيد</b>
        <span class="px-2 py-0.5 rounded-full bg-black/60 border border-white/15 font-mono text-amber-200 text-[10px] sm:text-xs">
          {{ game.roomCode }}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-black/60 border border-white/15 font-bold text-gray-200 text-[10px] sm:text-xs">
          ج {{ game.round }}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-black/60 border border-gold/40 font-mono text-amber-300 text-[10px] sm:text-xs">
          🂠 {{ game.deckCount }}
        </span>
        <span v-if="game.isFinal" class="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold text-[9px] animate-pulse">
          ختامي
        </span>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-1 sm:gap-1.5">
        <!-- Quick Theme Switcher Button -->
        <button
          class="px-2 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-400/40 text-[11px] font-bold transition-transform active:scale-95 flex items-center gap-1"
          title="تبديل البيئة"
          @click="onCycleTheme"
        >
          <span>🎨</span>
          <span class="hidden md:inline">{{ currentThemeName }}</span>
        </button>

        <!-- Live Scorecard -->
        <button
          class="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-400/40 transition-transform active:scale-95 text-xs sm:text-sm"
          title="الإحصائيات"
          @click="ui.openModal('liveStats')"
        >
          📊
        </button>

        <!-- Chat -->
        <GameChatPicker />

        <!-- Sound Toggle -->
        <button
          class="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 text-xs sm:text-sm"
          :title="audio.isMuted ? 'تشغيل' : 'كتم'"
          @click="audio.toggleMute"
        >
          {{ audio.isMuted ? '🔇' : '🔊' }}
        </button>

        <!-- Leave Room -->
        <button
          class="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-transform active:scale-95 text-xs sm:text-sm"
          title="مغادرة"
          @click="game.leaveRoom"
        >
          🚪
        </button>
      </div>
    </header>

    <!-- Spectator Banner -->
    <div v-if="game.isSpec" class="w-full bg-amber-500/20 text-amber-300 text-center py-0.5 text-[11px] font-bold border-b border-amber-400/30 z-30">
      👁️ تشاهد الجلسة المباشرة كمتفرج
    </div>

    <!-- Live Event Log -->
    <div class="w-full max-w-lg mx-auto px-2 py-0.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-30 pointer-events-none">
      <div
        v-for="log in game.logs.slice(0, 3)"
        :key="log.id"
        class="shrink-0 px-2 py-0.2 rounded-full bg-black/75 border border-white/10 text-[9px] sm:text-xs text-gray-200 backdrop-blur-sm shadow-sm"
      >
        {{ log.text }}
      </div>
    </div>

    <!-- Turn Spotlight -->
    <div
      v-if="game.phase === 'acting' && !game.isSpec"
      class="absolute pointer-events-none transition-all duration-700 ease-out z-10"
      :class="turnSpotlightClass"
    >
      <div class="w-72 h-72 rounded-full bg-gradient-to-r from-amber-400/15 via-yellow-300/20 to-transparent blur-3xl animate-pulse" />
    </div>

    <!-- ============================================================ -->
    <!-- CENTRAL PLAYING ARENA (Top Seat, Left/Right Seats, 3D Table) -->
    <!-- ============================================================ -->
    <div class="relative flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between landscape:justify-center items-center px-1 sm:px-3 pt-0.5 z-20 overflow-hidden">
      <!-- 1. MOBILE PORTRAIT VIEW: ALL 3 OTHER PLAYERS IN A SINGLE TOP BAR -->
      <div class="flex sm:hidden w-full items-center justify-between gap-1 px-1 mb-1 z-20">
        <!-- Left Opponent (Seat 1) -->
        <div class="w-[32%] max-w-[115px]">
          <GameSeatZone :seat-index="leftSeatIndex" :seat="game.seats[leftSeatIndex]" :pile="game.piles[leftSeatIndex]" :compact="true" />
        </div>
        <!-- Center Partner (Seat 2) - 4TH PLAYER PROMINENTLY IN CENTER! -->
        <div class="w-[34%] max-w-[125px]">
          <GameSeatZone :seat-index="topSeatIndex" :seat="game.seats[topSeatIndex]" :pile="game.piles[topSeatIndex]" :compact="true" />
        </div>
        <!-- Right Opponent (Seat 3) -->
        <div class="w-[32%] max-w-[115px]">
          <GameSeatZone :seat-index="rightSeatIndex" :seat="game.seats[rightSeatIndex]" :pile="game.piles[rightSeatIndex]" :compact="true" />
        </div>
      </div>

      <!-- 2. DESKTOP / TABLET VIEW: Top Partner Centered -->
      <div class="hidden sm:flex z-20 mb-1">
        <GameSeatZone :seat-index="topSeatIndex" :seat="game.seats[topSeatIndex]" :pile="game.piles[topSeatIndex]" :compact="false" />
      </div>

      <!-- Middle Arena Row (Desktop: Left Seat, 3D Table, Right Seat / Mobile: 100% Wide Table) -->
      <div class="relative w-full flex items-center justify-between gap-1 z-10 flex-1">
        <!-- Left Seat (Desktop Only) -->
        <div class="hidden sm:block shrink-0 z-20">
          <GameSeatZone :seat-index="leftSeatIndex" :seat="game.seats[leftSeatIndex]" :pile="game.piles[leftSeatIndex]" :compact="false" />
        </div>

        <!-- 3D Center Table Board (Full width on Mobile Portrait!) -->
        <div class="flex-1 flex justify-center w-full max-w-full px-0.5">
          <GameTableBoard />
        </div>

        <!-- Right Seat (Desktop Only) -->
        <div class="hidden sm:block shrink-0 z-20">
          <GameSeatZone :seat-index="rightSeatIndex" :seat="game.seats[rightSeatIndex]" :pile="game.piles[rightSeatIndex]" :compact="false" />
        </div>
      </div>

      <!-- 3. FIXED TACTICAL STATUS RIBBON (Guarantees ZERO Layout Shift - Table never moves!) -->
      <div class="w-full max-w-md mx-auto h-7 sm:h-8 shrink-0 flex items-center justify-center px-1 my-0.5 z-20 overflow-hidden pointer-events-none select-none">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          mode="out-in"
        >
          <!-- State A: It's My Turn -->
          <div
            v-if="game.isMyTurn && game.phase === 'acting'"
            key="my-turn"
            class="px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-[11px] sm:text-xs shadow-gold-glow flex items-center gap-1.5 animate-bounce"
          >
            <span>⚡</span>
            <span>{{ game.myOptions.mustEat ? '⚠️ لديك أكلة إجبارية! اختر ورقة للأكل' : 'دورك الآن! اختر ورقة أو انقر عليها مرتين للعب' }}</span>
          </div>

          <!-- State B: Recent Action Announcement -->
          <div
            v-else-if="game.lastActionAnnouncement"
            :key="game.lastActionAnnouncement.time"
            class="px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-black/90 border border-amber-400/50 text-amber-200 text-[11px] sm:text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-1.5"
          >
            <span>📢</span>
            <span class="truncate max-w-[280px] sm:max-w-xs">{{ game.lastActionAnnouncement.text }}</span>
          </div>

          <!-- State C: Ambient Round Status (Maintains Exact Reserved Height) -->
          <div
            v-else
            key="idle"
            class="px-3 py-0.5 rounded-full bg-black/40 border border-white/10 text-gray-400 text-[10px] font-medium flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>طاولة مجابيد • الجولة {{ game.round }} جارية</span>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Stop Ambush Banner (Centered at top of arena, never blocking hand cards!) -->
    <GameStopBanner />

    <!-- ============================================================ -->
    <!-- BOTTOM PLAYER CONTROL DOCK (Clean, Mobile First, No Overlap) -->
    <!-- ============================================================ -->
    <div class="relative w-full flex flex-col items-center justify-end z-30 pb-safe">
      <!-- 1. Action Buttons Dock (Floats above player shelf) -->
      <Transition
        enter-active-class="transition duration-200 ease-out transform"
        enter-from-class="scale-90 opacity-0 translate-y-2"
        enter-to-class="scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in transform"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-90 opacity-0"
      >
        <div
          v-if="game.isMyTurn && game.phase === 'acting'"
          class="mb-1.5 landscape:mb-0.5 flex items-center justify-center gap-2 px-3 py-1.5 landscape:py-0.5 rounded-2xl bg-black/95 backdrop-blur-xl border-2 border-amber-400 shadow-2xl z-40 max-w-[96vw]"
        >
          <!-- Eat Button(s) -->
          <template v-if="selectedCardEats.length > 0">
            <button
              v-for="r in selectedCardEats"
              :key="r"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 whitespace-nowrap"
              @click="game.playCard('eat', game.selectedCardId!, r)"
            >
              <span>🍽️</span>
              <span>أكل {{ r }}</span>
            </button>
          </template>

          <!-- Discard Button -->
          <button
            v-if="canDiscardSelected"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 whitespace-nowrap"
            @click="game.playCard('discard', game.selectedCardId!)"
          >
            <span>🎯</span>
            <span>رمي في الميدان</span>
          </button>

          <!-- Pass Button -->
          <button
            v-if="!game.myOptions.mustEat"
            class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs border border-white/20 active:scale-95 transition-colors whitespace-nowrap"
            @click="game.playCard('pass')"
          >
            ⏭️ تجاوز
          </button>
        </div>
      </Transition>

      <!-- 2. Player Status & Piles Strip (Right above the Hand Fan, full width) -->
      <div class="w-full max-w-lg mx-auto px-2 sm:px-4 flex items-center justify-between gap-1 text-xs mb-0.5 select-none">
        <!-- Player Pile (Buried & Chain) -->
        <div class="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 shadow">
          <span class="text-[10px] text-gray-300 font-mono font-bold">
            📦 مدفون: {{ playerPile.buriedCount || 0 }}
          </span>
          <span v-if="playerPile.chain" class="text-[10px] text-amber-300 font-bold border-r border-white/10 pr-2">
            👑 {{ playerPile.chain.rank }} ×{{ playerPile.chain.count }}
          </span>
        </div>

        <!-- Player Profile & Emoji Picker -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border backdrop-blur-md shadow"
          :class="[
            game.mySeat % 2 === 0 ? 'bg-blue-950/70 border-blue-500/40' : 'bg-rose-950/70 border-rose-500/40',
            game.isMyTurn ? 'ring-2 ring-amber-400' : ''
          ]"
        >
          <UiAvatarImg :avatar="playerSeat?.avatar || 'a1'" size="sm" :border="game.isMyTurn ? 'gold' : 'white'" />
          <div class="flex flex-col text-right leading-none">
            <div class="flex items-center gap-1">
              <b class="text-[11px] text-white font-black max-w-[65px] truncate">{{ playerSeat?.name || 'أنت' }}</b>
              <span v-if="game.dealer === game.mySeat" class="text-[10px]" title="الموزع">🪙</span>
            </div>
            <span
              v-if="game.mode === 'teams'"
              class="text-[8px] font-black"
              :class="game.mySeat % 2 === 0 ? 'text-blue-300' : 'text-rose-300'"
            >
              {{ game.mySeat % 2 === 0 ? 'أزرق' : 'أحمر' }}
            </span>
          </div>

          <!-- Quick Emoji Triggers -->
          <div class="flex items-center gap-0.5 border-r border-white/15 pr-1 mr-0.5">
            <button
              v-for="em in ['🔥', '😎', '👏', '💔']"
              :key="em"
              class="text-[11px] hover:scale-130 active:scale-95 transition-transform p-0.5"
              :title="`تفاعل ${em}`"
              @click="game.sendReaction(em)"
            >
              {{ em }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Hand Fan (Unobstructed full width!) -->
      <div v-if="!game.isSpec" class="w-full">
        <GameHandFan />
      </div>
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

// Relative seat positions for other players (top, left, right)
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

// Player's seat & pile data
const playerSeat = computed(() => {
  return game.seats[bottomSeatIndex.value]
})

const playerPile = computed(() => {
  return game.piles[bottomSeatIndex.value] || { chain: null, buriedCount: 0 }
})

const currentThemeName = computed(() => {
  switch (ui.theme) {
    case 2: return 'الصمان ⛺'
    case 3: return 'دبي 🌃'
    case 4: return 'البلد ☕'
    case 1:
    default: return 'نجد 🏛️'
  }
})

function onCycleTheme() {
  const next = ui.cycleTheme()
  if (game.roomCode) {
    game.updateLobbyConfig({ theme: next })
  }
}

const turnSpotlightClass = computed(() => {
  if (game.turn === bottomSeatIndex.value) {
    return 'bottom-16 left-1/2 -translate-x-1/2'
  }
  if (game.turn === topSeatIndex.value) {
    return 'top-10 left-1/2 -translate-x-1/2'
  }
  if (game.turn === leftSeatIndex.value) {
    return 'top-1/3 left-4 -translate-y-1/2'
  }
  return 'top-1/3 right-4 -translate-y-1/2'
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
    case 2: // Samman Night Sky
      return 'bg-[#020617]'
    case 3: // Dubai Sky-Lounge
      return 'bg-[#060a1e]'
    case 4: // Balad Heritage
      return 'bg-[#180905]'
    case 1: // Najd Royal
    default:
      return 'bg-[#04150c]'
  }
})

const currentThemeImage = computed(() => {
  switch (ui.theme) {
    case 2: return '/images/themes/theme_2.jpg'
    case 3: return '/images/themes/theme_3.jpg'
    case 4: return '/images/themes/theme_4.jpg'
    case 1:
    default: return '/images/themes/theme_1.jpg'
  }
})

const themeVignetteClass = computed(() => {
  switch (ui.theme) {
    case 2: // Samman Night Sky
      return 'bg-gradient-to-b from-black/60 via-blue-950/30 to-black/85'
    case 3: // Dubai VIP Neon
      return 'bg-gradient-to-b from-black/60 via-indigo-950/30 to-black/85'
    case 4: // Balad Heritage Amber
      return 'bg-gradient-to-b from-black/60 via-amber-950/30 to-black/85'
    case 1: // Najd Royal Emerald
    default:
      return 'bg-gradient-to-b from-black/60 via-emerald-950/30 to-black/85'
  }
})

function getThemeBackground(t: number) {
  switch (t) {
    case 2: // Samman Desert Starlight
      return { background: 'radial-gradient(ellipse at top, #0c1c38 0%, #020617 100%)' }
    case 3: // Dubai Skyline Night
      return { background: 'radial-gradient(ellipse at top, #14224c 0%, #060a1e 100%)' }
    case 4: // Balad Heritage Stone & Wood
      return { background: 'radial-gradient(ellipse at top, #36140d 0%, #180905 100%)' }
    case 1: // Najd Emerald Luxury
    default:
      return 'radial-gradient(ellipse at top, #0a2d1a 0%, #04150c 100%)'
  }
}
</script>