<template>
  <div
    class="relative w-full h-screen overflow-hidden flex flex-col justify-between select-none"
    :class="[
      game.isFinal ? 'ring-4 ring-red-500/40' : '',
      tableBackgroundClass,
      ':has(.stop-banner) .ambush-active'
    ]"
    @mouseleave="resetAtmosphere"
  >
    <!-- ========================================== -->
    <!-- 3D LIVING MAJLIS ATMOSPHERES LAYER -->
    <!-- ========================================== -->
    <div
      class="absolute inset-0 overflow-hidden"
      :style="atmosphereStyle"
    >
      <!-- Dynamic Background Based on Selected Theme -->
      <transition name="fade-slow">
        <div
          v-if="ui.theme >= 1 && ui.theme <= 4"
          class="absolute inset-0"
          :style="getThemeBackground(ui.theme)"
        >
          <!-- ==== Theme 1: Royal Najd Majlis ==== -->
          <div v-if="ui.theme === 1"
            class="relative"
          >
            <!-- Emerald Felt Table -->
            <div class="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-900/30 rounded-full blur-xl opacity-70" />
            <!-- Hanging Lanterns that sway -->
            <div
              v-for="(lantern, i) in lanterns1"
              :key="i"
              class="absolute top-[${i * 15% + 10}%] left-[${i % 2 === 0 ? '2%' : '90%'}] w-10 h-14 bg-amber-500/20 rounded-full opacity-60 blur flex items-center justify-center"
              :style="{
                borderRadius: '0 50% 0 50%',
                animation: `floatLantern 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }"
            >
              <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 4M12 10v6-6"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <!-- Coffee Steam Effect -->
            <div
              v-if="game.phase === 'acting'"
              class="absolute bottom-1/3 left-1/4 w-20 h-20 bg-amber-400/20 rounded-full opacity-50 blur"
            >
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 4M12 10v6-6"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M8 12h8m-4-4h4m-6 8h6m4-12v12" />
              </svg>
            </div>
            <!-- Ambient Light Orbs -->
            <div
              v-for="(orb, i) in lightOrbs1"
              :key="i"
              class="absolute ${orb.pos} w-6 h-6 bg-amber-500/10 rounded-full opacity-50 blur"
              :style="{
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                animation: `floatParticle ${6 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }"
            />
          </div>

          <!-- ==== Theme 2: Desert Starlit Camp ==== -->
          <div v-if="ui.theme === 2"
            class="relative"
          >
            <!-- Night Sky with Shooting Stars -->
            <div class="absolute inset-0 overflow-hidden">
              <!-- Static star field suggestion via gradient -->
              <div class="absolute top-0 left-0 right-0 bottom-0 bg-black via-navy-900 to-navy-950 opacity-90"/>
              <!-- Shooting stars animation -->
              <div
                v-for="star in shootingStars"
                :key="star.id"
                class="absolute w-[2px] h-[2px] bg-white rounded-full opacity-100"
                :style="{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  animation: `shootStar ${star.duration}s linear`,
                  animationDelay: `${star.delay}s`
                }"
              />
              <!-- Desert Fire Brazier -->
              <div class="absolute bottom-0 left-1/2 w-20 h-20 bg-amber-500/20 rounded-full opacity-60 blur flex items-center justify-center">
                <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 4M12 10v6-6"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  <path d="M8 12h8m-4 4h4m-6 8h6m-4-4v12m0-4l4 4m0-4l-4-4m8 0l4 4m-4-4l-4 4" />
                </svg>
              </div>
              <!-- Wind-blown sand particles -->
              <div
                v-for="sand in sandParticles"
                :key="sand.id"
                class="absolute w-1 h-1 bg-amber-300 rounded-full opacity-80"
                :style="{
                  left: `${sand.x}px`,
                  top: `${sand.y}px`,
                  animation: `driftSand ${3 + Math.random() * 3}s linear infinite`,
                  animationDelay: `${sand.delay}s`
                }"
              />
            </div>
            <!-- Moon phases subtle animation -->
            <div class="absolute top-2 right-4 w-24 h-24 bg-yellow-300/10 rounded-full opacity-50 blur" />
          </div>

          <!-- ==== Theme 3: Dubai Sky-Lounge VIP ==== -->
          <div v-if="ui.theme === 3"
            class="relative"
          >
            <!-- Neon Grid Effect -->
            <div class="absolute inset-0 overflow-hidden">
              <div class="grid-grid absoute inset-0 grid grid-cols-4 grid-rows-4 gap-2">
                <div
                  v-for="(light, i) in neonLights3"
                  :key="i"
                  class="w-full h-full rounded-xl bg-amber-500/20 opacity-70 blur"
                  :style="{
                    gridColumn: light.col,
                    gridRow: light.row,
                    animation: `pulseNeon ${3 + Math.random() * 3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }"
                />
              </div>
            </div>
            <!-- Modern Glass Table -->
            <div class="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full backdrop-blur-lg opacity-60" />
            <!-- Dubai skyline silhouette -->
            <div class="absolute top-2 right-2 w-20 h-20 bg-amber-500/10 rounded-full opacity-50 blur" />
            <!-- Confetti particles for wins -->
            <div
              v-if="game.matchOver"
              v-for="(confetti, i) in matchConfetti"
              :key="i"
              class="absolute w-2 h-2 bg-amber-400 opacity-90"
              :style="{
                left: `${confetti.x}px`,
                top: `${confetti.y}px`,
                animation: `fallConfetti ${2}s ease-in infinite`,
                animationDelay: `${i * 0.1}s`
              }"
            />
          </div>

          <!-- ==== Theme 4: Heritage Café ==== -->
          <div v-if="ui.theme === 4"
            class="relative"
          >
            <!-- Warm Wood Tones -->
            <div class="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-amber-800/30 to-amber-700/20"/>
            <!-- Wooden Roushins (lattice) pattern -->
            <div class="absolute top-0 left-0 right-0 h-96 bg-amber-700/10 opacity-50 blur" />
            <!-- Tea glass glow -->
            <div
              v-if="game.phase === 'stop'"
              class="absolute bottom-1/4 left-1/4 w-16 h-16 bg-amber-500/20 rounded-full opacity-70 blur flex items-center justify-center"
            >
              <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 4M12 10v6-6"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <!-- Ambient tea steam loop -->
            <div
              v-for="steam in teaSteam"
              :key="steam.id"
              class="absolute bottom-1/3 left-1/4 w-12 h-18 bg-amber-400/20 rounded-t-full opacity-60 blur animate-steam"
            />
            <!-- Fawanis (lanterns) subtle glow -->
            <div
              v-for="fawanis in fawanisGlow"
              :key="fawanis.id"
              class="absolute inset-0 w-96 h-96 bg-amber-500/5 rounded-full opacity-30 blur"
            />
          </div>
        </div>
      </transition>
    </div>

    <!-- ========================================== -->
    <!-- REST OF GAME UI (Top Bar, Seats, etc.) -->
    <!-- ========================================== -->
    <!-- Top Bar -->
    <header class="w-full flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-md border-b border-white/10 z-40">
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

    <!-- Spectator Banner -->
    <div v-if="game.isSpec" class="w-full bg-amber-500/20 text-amber-300 text-center py-1 text-xs font-bold border-b border-amber-400/30">
      👁️ تشاهد الجلسة المباشرة كمتفرج (بلا تحكم وبلا كشف للأوراق)
    </div>

    <!-- Live Game Events Log -->
    <div class="w-full max-w-xl mx-auto px-2 py-1 flex items-center gap-2 overflow-x-auto no-scrollbar z-30 pointer-events-none">
      <div
        v-for="log in game.logs.slice(0, 4)"
        :key="log.id"
        class="shrink-0 px-2.5 py-0.5 rounded-full bg-black/65 border border-white/10 text-[10px] sm:text-xs text-gray-200 backdrop-blur-sm shadow-sm"
      >
        {{ log.text }}
      </div>
    </div>

    <!-- Table Playing Board -->
    <div class="relative flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between items-center px-3 py-1">
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

        <!-- Center Table -->
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
      class="w-full max-w-lg mx-auto flex items-center justify-center gap-2 px-3 z-30 my-1"
    >
      <!-- Eat Button(s) -->
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

// Calculate relative seat positions so current player is always at the bottom
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
      return 'bg-[#050d1a]'
    case 3:
      return 'bg-[#0d1d3a]'
    case 4:
      return 'bg-[#1f0509]'
    case 1:
    default:
      return 'bg-[#07130c]'
  }
})

const atmosphereStyle = computed(() => ({
  pointerEvents: 'none' as const
}))

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

function resetAtmosphere() {}

const lanterns1 = [1, 2, 3, 4]
const lightOrbs1 = [
  { pos: 'top-1/4 left-1/4', x: 25, y: 25 },
  { pos: 'top-1/3 right-1/4', x: 75, y: 33 },
  { pos: 'bottom-1/4 left-1/3', x: 33, y: 75 },
]
const shootingStars = [
  { id: 1, x: 20, y: 15, duration: 2.5, delay: 1 },
  { id: 2, x: 65, y: 25, duration: 3, delay: 3.5 },
]
const sandParticles = [
  { id: 1, x: 50, y: 100, delay: 0.5 },
  { id: 2, x: 150, y: 180, delay: 1.2 },
]
const neonLights3 = [
  { col: '1', row: '1' },
  { col: '4', row: '1' },
  { col: '2', row: '3' },
  { col: '3', row: '4' },
]
const matchConfetti = [
  { x: 100, y: 50 },
  { x: 250, y: 80 },
  { x: 400, y: 40 },
]
const teaSteam = [
  { id: 1 },
  { id: 2 },
]
const fawanisGlow = [
  { id: 1 },
]
</script>