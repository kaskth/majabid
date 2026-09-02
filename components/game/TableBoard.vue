<template>
  <div class="relative w-full max-w-2xl mx-auto flex items-center justify-center select-none py-1">
    <!-- 3D Table Outer Leather Padded Rail -->
    <div
      class="relative w-full p-2.5 sm:p-4 rounded-[36px] sm:rounded-[44px] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.15)] border-4 transition-all duration-500"
      :class="tableRimClass"
    >
      <!-- Golden Inlay Stitched Bezel -->
      <div
        class="relative w-full rounded-[28px] sm:rounded-[36px] p-2 sm:p-4 border-2 shadow-inner transition-colors duration-500 flex items-center justify-between gap-2 overflow-hidden"
        :class="tableFeltClass"
      >
        <!-- Ambient Table Watermark / Arabesque Motif -->
        <div class="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <svg class="w-64 h-64 text-amber-300" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />
          </svg>
        </div>

        <!-- Field Center Arena -->
        <div class="flex-1 flex flex-col items-center justify-center min-h-[145px] sm:min-h-[175px] px-2 z-10">
          <!-- Arena Title & Count -->
          <div class="text-[11px] sm:text-xs font-black tracking-wide mb-2 flex items-center gap-2 text-amber-200/90 drop-shadow">
            <span class="text-base">🎯</span>
            <span>ميدان اللعب</span>
            <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-amber-300 font-mono">
              {{ totalFieldCards }} ورقة
            </span>
          </div>

          <!-- Field Cards Row / Grid -->
          <div v-if="groupedField.length > 0" class="flex flex-wrap items-center justify-center gap-2.5 max-w-full">
            <div
              v-for="grp in groupedField"
              :key="grp.rank"
              class="group relative flex items-center justify-center p-1 rounded-2xl bg-black/50 border transition-all duration-200 cursor-pointer"
              :class="[
                canEatRank(grp.rank)
                  ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)] scale-105 hover:scale-115 ring-2 ring-emerald-400 animate-pulse'
                  : 'border-white/15 hover:border-amber-400/60 hover:scale-105'
              ]"
              :title="canEatRank(grp.rank) ? 'اضغط للأكل المباشر!' : `مجموعة ${grp.rank}`"
              @click="onFieldCardClick(grp.rank)"
            >
              <!-- 3D Card Stack Effect -->
              <div class="relative w-11 sm:w-13 h-15 sm:h-18">
                <div
                  v-for="k in Math.min(grp.count, 3)"
                  :key="k"
                  class="absolute inset-0"
                  :style="{ transform: `translateY(${-(k - 1) * 2.5}px) translateX(${(k - 1) * 1.5}px)` }"
                >
                  <GameCard :rank="grp.rank" :suit="grp.suit" />
                </div>
              </div>

              <!-- Multiplier Badge -->
              <span
                v-if="grp.count > 1"
                class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-black text-[10px] shadow"
              >
                ×{{ grp.count }}
              </span>

              <!-- Direct Eat Callout -->
              <span
                v-if="canEatRank(grp.rank)"
                class="absolute -top-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[9px] shadow-md select-none tracking-wide animate-bounce"
              >
                كِل 🍽️
              </span>
            </div>
          </div>

          <!-- Empty field placeholder -->
          <div v-else class="text-xs text-amber-200/50 font-medium py-6 select-none flex flex-col items-center gap-1">
            <span class="text-xl opacity-40">🂡</span>
            <span>الميدان خالي — ارمِ ورقة أو ابدأ الصيد</span>
          </div>
        </div>

        <!-- 3D Tactical Deck (الرزمة ذات السماكة الواقعية) -->
        <div class="flex flex-col items-center justify-center pl-3 border-r border-amber-400/20 shrink-0 z-10">
          <div
            class="relative w-14 sm:w-18 h-20 sm:h-24 transition-transform hover:scale-105 cursor-pointer"
            title="رزمة الأوراق المتبقية"
          >
            <!-- Deck Atmospheric Glow -->
            <div class="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-2xl blur-md pointer-events-none" />

            <!-- Realistic 3D Stack Thickness -->
            <div
              v-for="layer in deckVisualLayers"
              :key="layer"
              class="absolute inset-0 opacity-80"
              :style="{ transform: `translateY(${layer * 1.5}px) translateX(${layer * 1}px)` }"
            >
              <GameCard :back="true" />
            </div>

            <!-- Top Face Card -->
            <div class="relative w-full h-full">
              <GameCard :back="true" />
            </div>

            <!-- Real Deck Count Badge -->
            <div class="absolute -bottom-2 -left-2 px-2.5 py-0.5 rounded-full bg-black/95 border border-amber-400 text-gold-light font-mono font-black text-xs shadow-xl flex items-center gap-1">
              <span>🂠</span>
              <span>{{ game.deckCount }}</span>
            </div>
          </div>
          <span class="text-[10px] font-bold text-amber-200/90 mt-2.5 tracking-wider">الرزمة</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore, type CardData } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const audio = useAudioStore()
const ui = useUiStore()

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const totalFieldCards = computed(() => game.field.length)

// Visual layers for 3D deck thickness
const deckVisualLayers = computed(() => {
  const cnt = Math.min(3, Math.ceil(game.deckCount / 120))
  const layers: number[] = []
  for (let i = 1; i <= cnt; i++) layers.push(i)
  return layers
})

// Table Rim Styles based on Theme
const tableRimClass = computed(() => {
  switch (ui.theme) {
    case 2: // Samman Desert Night
      return 'border-[#2a4575] bg-gradient-to-b from-[#1c3259] via-[#0f1d35] to-[#060c17] shadow-[0_20px_50px_rgba(2,6,23,0.9)]'
    case 3: // Dubai Sky Lounge Neon Glass
      return 'border-[#06b6d4] bg-gradient-to-b from-[#164e63] via-[#0e2f44] to-[#081b29] shadow-[0_0_35px_rgba(6,182,212,0.4)]'
    case 4: // Balad Antique Teak Wood
      return 'border-[#78350f] bg-gradient-to-b from-[#451a03] via-[#290e02] to-[#170501] shadow-[0_20px_50px_rgba(24,9,5,0.9)]'
    case 1: // Najd Royal Gold Mahogany
    default:
      return 'border-[#b45309] bg-gradient-to-b from-[#5a3610] via-[#331e08] to-[#170c03] shadow-[0_20px_50px_rgba(4,21,12,0.9)]'
  }
})

// Table Felt Styles based on Theme
const tableFeltClass = computed(() => {
  switch (ui.theme) {
    case 2: // Midnight Navy Velvet
      return 'border-blue-400/40 bg-gradient-to-b from-[#0e2b54] via-[#081b36] to-[#030d1c]'
    case 3: // Cyber Blue Neon Glass
      return 'border-cyan-400/50 bg-gradient-to-b from-[#143c78] via-[#0b244d] to-[#05132b]'
    case 4: // Cordovan Crimson Leather
      return 'border-amber-600/40 bg-gradient-to-b from-[#4a180f] via-[#2c0d08] to-[#140503]'
    case 1: // Royal Emerald Baize
    default:
      return 'border-amber-400/40 bg-gradient-to-b from-[#0e4526] via-[#082916] to-[#03150b]'
  }
})

interface GroupedRank {
  rank: string
  count: number
  suit: string
}

const groupedField = computed<GroupedRank[]>(() => {
  const map = new Map<string, { count: number; topSuit: string }>()
  for (const c of game.field) {
    const existing = map.get(c.r)
    if (existing) {
      existing.count++
      existing.topSuit = c.s
    } else {
      map.set(c.r, { count: 1, topSuit: c.s })
    }
  }

  const res: GroupedRank[] = []
  for (const r of RANK_ORDER) {
    const item = map.get(r)
    if (item && item.count > 0) {
      res.push({ rank: r, count: item.count, suit: item.topSuit })
    }
  }
  return res
})

function canEatRank(rank: string): boolean {
  if (!game.isMyTurn) return false
  const sel = game.myHand.find((c) => c.id === game.selectedCardId)
  if (sel) {
    if (sel.j) return true
    if (sel.r === rank) return true
  }
  return game.myHand.some((c) => c.r === rank || c.j)
}

function onFieldCardClick(rank: string) {
  if (!game.isMyTurn) return

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
    audio.sfx.slide()
    game.playEat(cardToUse.id!, rank)
  }
}
</script>
