<template>
  <div
    class="relative w-full h-screen flex flex-col justify-between overflow-hidden select-none transition-colors duration-500"
    :class="tableBackgroundClass"
  >
    <!-- ============================================================ -->
    <!-- 4 RICH, DISTINCT & UNMISTAKABLE ATMOSPHERE BACKGROUNDS       -->
    <!-- ============================================================ -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <!-- Ambient Gradient Base -->
      <div class="absolute inset-0" :style="getThemeBackground(ui.theme)" />

      <!-- ============================================== -->
      <!-- Theme 1: Royal Najd Majlis (مجلس نجد الملكي)    -->
      <!-- ============================================== -->
      <div v-if="ui.theme === 1" class="absolute inset-0">
        <!-- Emerald Damask Wallpaper Pattern -->
        <div class="absolute inset-0 opacity-15">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
            <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#f59e0b" stroke-width="1" />
            <circle cx="40" cy="40" r="16" fill="none" stroke="#10b981" stroke-width="1" />
            <circle cx="40" cy="40" r="6" fill="#f59e0b" opacity="0.6" />
          </svg>
        </div>

        <!-- Left & Right Sadu Tribal Carpet Runners -->
        <div class="absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-red-950/80 via-amber-900/60 to-transparent border-r-2 border-amber-500/30 flex flex-col justify-around items-center py-6 opacity-85">
          <div v-for="i in 8" :key="i" class="w-4 h-4 rotate-45 border border-amber-400/60 bg-red-800/40" />
        </div>
        <div class="absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-red-950/80 via-amber-900/60 to-transparent border-l-2 border-amber-500/30 flex flex-col justify-around items-center py-6 opacity-85">
          <div v-for="i in 8" :key="i" class="w-4 h-4 rotate-45 border border-amber-400/60 bg-red-800/40" />
        </div>

        <!-- Hanging Golden Brass Lanterns (فوانيس نجد المعلقة) -->
        <div class="absolute top-0 left-16 sm:left-28 flex flex-col items-center animate-pulse" style="animation-duration: 4s;">
          <div class="w-0.5 h-16 sm:h-24 bg-gradient-to-b from-amber-300 to-amber-600" />
          <div class="relative w-8 sm:w-10 h-12 sm:h-14 bg-gradient-to-b from-amber-400 to-amber-700 rounded-b-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center border border-amber-300">
            <span class="text-xs">🏮</span>
          </div>
        </div>
        <div class="absolute top-0 right-16 sm:right-28 flex flex-col items-center animate-pulse" style="animation-duration: 5s; animation-delay: 1.5s;">
          <div class="w-0.5 h-14 sm:h-20 bg-gradient-to-b from-amber-300 to-amber-600" />
          <div class="relative w-8 sm:w-10 h-12 sm:h-14 bg-gradient-to-b from-amber-400 to-amber-700 rounded-b-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center border border-amber-300">
            <span class="text-xs">🏮</span>
          </div>
        </div>

        <!-- Emerald Center Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-emerald-600/15 rounded-full blur-3xl" />
      </div>

      <!-- ============================================== -->
      <!-- Theme 2: Desert Starlit Camp (مخيم الصمان)      -->
      <!-- ============================================== -->
      <div v-if="ui.theme === 2" class="absolute inset-0">
        <!-- Night Sky Stars Array -->
        <div class="absolute inset-0">
          <div class="absolute top-10 left-1/4 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#fff] animate-ping" style="animation-duration: 3s;" />
          <div class="absolute top-20 right-1/4 w-2.5 h-2.5 bg-amber-200 rounded-full shadow-[0_0_10px_#fde68a] animate-pulse" style="animation-duration: 2.5s;" />
          <div class="absolute top-32 left-1/3 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-ping" style="animation-duration: 4s;" />
          <div class="absolute top-14 right-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
          <div class="absolute top-28 right-16 w-2 h-2 bg-yellow-100 rounded-full animate-pulse" style="animation-duration: 3.5s;" />
          <div class="absolute top-40 left-16 w-1 h-1 bg-white rounded-full opacity-70" />
          <div class="absolute top-8 left-1/2 w-1.5 h-1.5 bg-amber-100 rounded-full opacity-90" />
        </div>

        <!-- Golden Crescent Moon (هلال الصمان الذهبي) -->
        <div class="absolute top-6 right-8 sm:right-16 flex items-center gap-2">
          <div class="text-3xl sm:text-4xl filter drop-shadow-[0_0_15px_rgba(253,224,71,0.7)] animate-pulse">
            🌙
          </div>
          <span class="text-xs text-amber-200/60 font-bold hidden sm:inline">سماء الصمان</span>
        </div>

        <!-- Desert Sand Dunes Silhouette across Bottom -->
        <div class="absolute bottom-0 inset-x-0 h-44 sm:h-56 pointer-events-none opacity-40">
          <svg class="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,200 Q250,120 500,210 T1000,160 L1000,300 L0,300 Z" fill="#1e1308" />
            <path d="M0,240 Q350,180 700,250 T1000,220 L1000,300 L0,300 Z" fill="#0f0a04" opacity="0.7" />
          </svg>
        </div>

        <!-- Campfire Glow at Bottom Center -->
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div class="w-[500px] h-[220px] bg-gradient-to-t from-orange-600/30 via-amber-500/20 to-transparent rounded-full blur-3xl animate-pulse" style="animation-duration: 2s;" />
          <div class="text-2xl animate-bounce">🔥</div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- Theme 3: Dubai Sky-Lounge VIP (سكاي روف دبي)    -->
      <!-- ============================================== -->
      <div v-if="ui.theme === 3" class="absolute inset-0">
        <!-- Illuminated Dubai Skyline Silhouette -->
        <div class="absolute bottom-0 inset-x-0 h-48 sm:h-64 pointer-events-none opacity-30 flex items-end justify-around px-4">
          <!-- Skyscraper 1 -->
          <div class="w-12 sm:w-16 h-40 bg-gradient-to-t from-blue-900 via-indigo-900 to-cyan-800 rounded-t-md border-t border-cyan-400/50 relative">
            <div class="grid grid-cols-2 gap-1 p-1 opacity-70">
              <div v-for="w in 12" :key="w" class="w-1.5 h-2 bg-yellow-200/60 rounded-xs" />
            </div>
          </div>
          <!-- Burj Spire -->
          <div class="w-8 sm:w-12 h-56 bg-gradient-to-t from-blue-950 via-slate-900 to-blue-700 rounded-t-full border-t-2 border-cyan-300 relative shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-8 bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-ping" />
          </div>
          <!-- Skyscraper 2 -->
          <div class="w-16 sm:w-20 h-48 bg-gradient-to-t from-purple-950 via-indigo-950 to-purple-800 rounded-t-lg border-t border-purple-400/50">
            <div class="grid grid-cols-3 gap-1 p-1 opacity-70">
              <div v-for="w in 15" :key="w" class="w-1.5 h-2 bg-cyan-200/60 rounded-xs" />
            </div>
          </div>
          <!-- Skyscraper 3 -->
          <div class="w-14 sm:w-18 h-36 bg-gradient-to-t from-blue-950 to-slate-900 rounded-t-sm border-t border-blue-400/40">
            <div class="grid grid-cols-2 gap-1 p-1 opacity-60">
              <div v-for="w in 10" :key="w" class="w-1.5 h-2 bg-yellow-200/50 rounded-xs" />
            </div>
          </div>
        </div>

        <!-- Neon Grid Laser Beams -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <!-- ============================================== -->
      <!-- Theme 4: Heritage Balad Café (قهوة البلد)       -->
      <!-- ============================================== -->
      <div v-if="ui.theme === 4" class="absolute inset-0">
        <!-- Traditional Wooden Roushin (رواشين الحجاز التراثية) -->
        <div class="absolute inset-0 opacity-20">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#d97706" stroke-width="1.5" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="#d97706" stroke-width="1" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="#d97706" stroke-width="1" />
            <circle cx="27" cy="27" r="12" fill="none" stroke="#b45309" stroke-width="1" />
            <circle cx="73" cy="27" r="12" fill="none" stroke="#b45309" stroke-width="1" />
            <circle cx="27" cy="73" r="12" fill="none" stroke="#b45309" stroke-width="1" />
            <circle cx="73" cy="73" r="12" fill="none" stroke="#b45309" stroke-width="1" />
          </svg>
        </div>

        <!-- Warm Stone Architectural Arches on top -->
        <div class="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#38140d]/90 to-transparent border-b-2 border-amber-600/30 flex items-center justify-center">
          <span class="text-xs sm:text-sm font-bold text-amber-200/80 tracking-widest">قهوة البلد الحجازية العتيقة ☕</span>
        </div>

        <!-- Warm Amber Hearth Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-amber-700/20 rounded-full blur-3xl" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TOP HEADER BAR (Status, Scorecard, Quick Theme, Audio, Leave) -->
    <!-- ============================================================ -->
    <header class="w-full flex items-center justify-between px-3 sm:px-5 py-2 bg-black/75 backdrop-blur-md border-b border-white/10 z-40">
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
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Quick Theme Switcher Button (1 tap to cycle and see instant change!) -->
        <button
          class="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-400/40 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1"
          title="اضغط للتبديل الفوري بين البيئات الأربعة"
          @click="ui.cycleTheme"
        >
          <span>🎨</span>
          <span class="hidden sm:inline">{{ currentThemeName }}</span>
        </button>

        <!-- Live Stats Scorecard Button -->
        <button
          class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-400/40 transition-transform active:scale-95 text-base"
          title="إحصائيات الجولة المباشرة"
          @click="ui.openModal('liveStats')"
        >
          📊
        </button>

        <!-- Chat Picker -->
        <GameChatPicker />

        <!-- Sound Toggle -->
        <button
          class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 text-base"
          :title="audio.isMuted ? 'تشغيل الصوت' : 'كتم الصوت'"
          @click="audio.toggleMute"
        >
          {{ audio.isMuted ? '🔇' : '🔊' }}
        </button>

        <!-- Leave Room -->
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
    <div class="w-full max-w-xl mx-auto px-2 py-0.5 flex items-center gap-2 overflow-x-auto no-scrollbar z-30 pointer-events-none">
      <div
        v-for="log in game.logs.slice(0, 4)"
        :key="log.id"
        class="shrink-0 px-2.5 py-0.5 rounded-full bg-black/75 border border-white/10 text-[10px] sm:text-xs text-gray-200 backdrop-blur-sm shadow-sm"
      >
        {{ log.text }}
      </div>
    </div>

    <!-- Dynamic Turn Spotlight (Beams softly onto active player) -->
    <div
      v-if="game.phase === 'acting' && !game.isSpec"
      class="absolute pointer-events-none transition-all duration-700 ease-out z-10"
      :class="turnSpotlightClass"
    >
      <div class="w-80 h-80 rounded-full bg-gradient-to-r from-amber-400/15 via-yellow-300/20 to-transparent blur-3xl animate-pulse" />
    </div>

    <!-- ============================================================ -->
    <!-- CENTRAL ARENA (Top Seat, Left Seat, 3D Table, Right Seat)    -->
    <!-- No Bottom Seat Blocking the View! Complete Free Clearance!   -->
    <!-- ============================================================ -->
    <div class="relative flex-1 w-full max-w-5xl mx-auto flex flex-col justify-around items-center px-2 py-1 z-20">
      <!-- Top Seat Zone -->
      <div class="z-20">
        <GameSeatZone :seat-index="topSeatIndex" :seat="game.seats[topSeatIndex]" :pile="game.piles[topSeatIndex]" />
      </div>

      <!-- Middle Row: Left Seat, 3D Table Board, Right Seat -->
      <div class="w-full flex items-center justify-between gap-1 sm:gap-4 z-10">
        <!-- Left Seat -->
        <div class="shrink-0">
          <GameSeatZone :seat-index="leftSeatIndex" :seat="game.seats[leftSeatIndex]" :pile="game.piles[leftSeatIndex]" />
        </div>

        <!-- 3D Center Table Board (Unobstructed!) -->
        <div class="flex-1 flex justify-center max-w-2xl">
          <GameTableBoard />
        </div>

        <!-- Right Seat -->
        <div class="shrink-0">
          <GameSeatZone :seat-index="rightSeatIndex" :seat="game.seats[rightSeatIndex]" :pile="game.piles[rightSeatIndex]" />
        </div>
      </div>
    </div>

    <!-- Stop Ambush Banner (Positioned in upper center arena, NOT covering hand!) -->
    <GameStopBanner />

    <!-- ============================================================ -->
    <!-- ACTION BUTTONS ROW (Floats cleanly directly above Hand Fan)   -->
    <!-- ============================================================ -->
    <div
      v-if="game.isMyTurn && game.phase === 'acting'"
      class="fixed bottom-38 sm:bottom-44 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-xl border border-amber-500/40 shadow-2xl"
    >
      <!-- Eat Button(s) -->
      <template v-if="selectedCardEats.length > 0">
        <button
          v-for="r in selectedCardEats"
          :key="r"
          class="px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs sm:text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
          @click="game.playCard('eat', game.selectedCardId!, r)"
        >
          🍽️ أكل {{ r }}
        </button>
      </template>

      <!-- Discard Button -->
      <button
        v-if="canDiscardSelected"
        class="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm border border-white/20 shadow-md active:scale-95 transition-transform whitespace-nowrap"
        @click="game.playCard('discard', game.selectedCardId!)"
      >
        🎯 ارمِ للميدان
      </button>

      <!-- Pass Button -->
      <button
        v-if="!game.myOptions.mustEat"
        class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs border border-white/15 active:scale-95 transition-colors whitespace-nowrap"
        @click="game.playCard('pass')"
      >
        ⏭️ تجاوز
      </button>
    </div>

    <!-- ============================================================ -->
    <!-- DOCKED BOTTOM PLAYER CORNER PODS & HAND FAN                   -->
    <!-- ============================================================ -->
    <!-- Bottom Left: Player's Madfoon & Chain Piles -->
    <div class="fixed bottom-2 left-2 sm:bottom-3 sm:left-4 z-30">
      <div class="p-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-xl flex items-center gap-2 select-none">
        <!-- Buried Pile -->
        <div v-if="playerPile.buriedCount > 0" class="flex flex-col items-center">
          <div class="relative w-8 h-11">
            <div
              v-for="k in Math.min(playerPile.buriedCount, 3)"
              :key="k"
              class="absolute inset-0 rounded overflow-hidden shadow-sm"
              :style="{ transform: `translateY(${-k * 2}px) translateX(${k * 1}px)` }"
            >
              <GameCard :back="true" />
            </div>
          </div>
          <span class="text-[9px] font-bold text-gray-300 mt-0.5 font-mono">مدفون {{ playerPile.buriedCount }}</span>
        </div>

        <!-- Active Chain Top -->
        <div v-if="playerPile.chain" class="flex flex-col items-center">
          <div class="relative w-9 h-12">
            <GameCard :rank="playerPile.chain.rank" :suit="playerPile.chain.suit || '♠'" />
          </div>
          <span class="text-[9px] font-bold text-amber-300 mt-0.5">
            👑 {{ playerPile.chain.rank }} ×{{ playerPile.chain.count }}
          </span>
        </div>

        <div v-if="playerPile.buriedCount === 0 && !playerPile.chain" class="text-[10px] text-gray-400 px-1">
          لا توجد كومات بعد
        </div>
      </div>
    </div>

    <!-- Bottom Right: Player's Avatar, Name, Team Badge, & Live Reaction Bar -->
    <div class="fixed bottom-2 right-2 sm:bottom-3 sm:right-4 z-30">
      <div
        class="p-2 rounded-2xl backdrop-blur-md border shadow-xl flex items-center gap-2 select-none"
        :class="[
          game.mySeat % 2 === 0
            ? 'border-blue-500/40 bg-blue-950/60'
            : 'border-rose-500/40 bg-rose-950/60',
          game.isMyTurn ? 'ring-2 ring-amber-400 animate-pulse' : ''
        ]"
      >
        <UiAvatarImg :avatar="playerSeat?.avatar || 'a1'" size="sm" :border="game.isMyTurn ? 'gold' : 'white'" />
        <div class="flex flex-col text-right leading-tight">
          <div class="flex items-center gap-1">
            <b class="text-xs text-white font-black max-w-[80px] truncate">{{ playerSeat?.name || 'أنت' }}</b>
            <span v-if="game.dealer === game.mySeat" class="text-xs" title="الموزع">🪙</span>
          </div>
          <div class="flex items-center gap-1 text-[10px] text-gray-300">
            <span class="text-amber-300 font-mono font-bold">🂠 {{ game.myHand.length }}</span>
            <span
              v-if="game.mode === 'teams'"
              class="font-bold text-[9px]"
              :class="game.mySeat % 2 === 0 ? 'text-blue-300' : 'text-rose-300'"
            >
              {{ game.mySeat % 2 === 0 ? 'فريق أزرق' : 'فريق أحمر' }}
            </span>
          </div>
        </div>

        <!-- Quick Live Reaction Bar -->
        <div class="flex items-center gap-1 border-r border-white/10 pr-1.5 mr-0.5">
          <button
            v-for="em in ['🔥', '😎', '👏', '💔', '👑']"
            :key="em"
            class="text-xs hover:scale-125 active:scale-95 transition-transform"
            :title="`تفاعل ${em}`"
            @click="game.sendReaction(em)"
          >
            {{ em }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Center Hand Fan (The Hero Hand Zone) -->
    <div v-if="!game.isSpec" class="w-full z-30 pb-1">
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

const turnSpotlightClass = computed(() => {
  if (game.turn === bottomSeatIndex.value) {
    return 'bottom-20 left-1/2 -translate-x-1/2'
  }
  if (game.turn === topSeatIndex.value) {
    return 'top-14 left-1/2 -translate-x-1/2'
  }
  if (game.turn === leftSeatIndex.value) {
    return 'top-1/2 left-10 -translate-y-1/2'
  }
  return 'top-1/2 right-10 -translate-y-1/2'
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
      return { background: 'radial-gradient(ellipse at top, #0a2d1a 0%, #04150c 100%)' }
  }
}
</script>