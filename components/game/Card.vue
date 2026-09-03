<template>
  <div
    class="relative select-none aspect-[100/140] rounded-[5px] sm:rounded-[7px] overflow-hidden cursor-pointer transition-all duration-200 transform-gpu"
    :class="[
      isSelected ? '-translate-y-3 scale-105 ring-3 ring-amber-400 shadow-[0_10px_25px_rgba(245,197,66,0.6)] z-30' : '',
      isPlayable && !isSelected ? 'ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)] hover:-translate-y-1.5' : '',
      isDimmed ? 'opacity-40 grayscale-[50%] pointer-events-none' : '',
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- ============================================================ -->
    <!-- 1. CARD BACK (4 REAL LUXURY DECKS BASED ON ui.activeDeck)    -->
    <!-- ============================================================ -->
    <svg
      v-if="back"
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-[5px] sm:rounded-[7px] shadow-md"
    >
      <defs>
        <!-- Deck 1: Gold Solid (Classic Majlis Emerald & Gold) -->
        <linearGradient id="backBg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a2a1a" />
          <stop offset="50%" stop-color="#05170e" />
          <stop offset="100%" stop-color="#020b07" />
        </linearGradient>
        <linearGradient id="backGold-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffe6a3" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#997a15" />
        </linearGradient>

        <!-- Deck 2: Emerald Royal (Jade & Mint Sadu) -->
        <linearGradient id="backBg-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="50%" stop-color="#022c22" />
          <stop offset="100%" stop-color="#011611" />
        </linearGradient>
        <linearGradient id="backGold-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6ee7b7" />
          <stop offset="50%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>

        <!-- Deck 3: Heritage Crimson (Najd Red Velvet & Antique Gold) -->
        <linearGradient id="backBg-heritage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="50%" stop-color="#260404" />
          <stop offset="100%" stop-color="#120202" />
        </linearGradient>
        <linearGradient id="backGold-heritage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="50%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#854d0e" />
        </linearGradient>

        <!-- Deck 4: Royal Midnight (Sapphire & Starlight) -->
        <linearGradient id="backBg-royal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <linearGradient id="backGold-royal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="50%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>

        <!-- Geometric Grid Pattern -->
        <pattern id="backGrid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0 L8 4 L4 8 Z" fill="none" :stroke="deckStrokeColor" stroke-width="0.3" opacity="0.25" />
        </pattern>
      </defs>

      <!-- Base & Outer border (Refined Casino Radius rx="4") -->
      <rect x="1.5" y="1.5" width="97" height="137" rx="4" :fill="`url(#backBg-${deckThemeKey})`" :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="2.2" />
      <rect x="4.5" y="4.5" width="91" height="131" rx="2.5" :fill="`url(#backBg-${deckThemeKey})`" :stroke="deckStrokeColor" stroke-width="0.7" opacity="0.55" />
      <rect x="6" y="6" width="88" height="128" rx="2" fill="url(#backGrid)" />
      
      <!-- Corner Ornaments -->
      <g :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="0.7" fill="none" opacity="0.7">
        <path d="M9 14 Q14 14 14 9" />
        <path d="M91 14 Q86 14 86 9" />
        <path d="M9 126 Q14 126 14 131" />
        <path d="M91 126 Q86 126 86 131" />
      </g>

      <!-- Center Medallion (Theme Specific) -->
      <g transform="translate(50, 70)">
        <circle cx="0" cy="0" r="22" :fill="deckCenterBg" :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="1.2" />
        <circle cx="0" cy="0" r="18" fill="none" :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="0.6" stroke-dasharray="2,2" opacity="0.8" />

        <!-- 1. Gold Deck: 8-pointed Islamic Star -->
        <template v-if="deckThemeKey === 'gold'">
          <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" fill="url(#backGold-gold)" opacity="0.9" />
          <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" fill="url(#backGold-gold)" transform="rotate(45)" opacity="0.7" />
          <circle cx="0" cy="0" r="4.5" fill="#04150b" stroke="url(#backGold-gold)" stroke-width="0.8" />
          <circle cx="0" cy="0" r="2" fill="#ffe6a3" />
        </template>

        <!-- 2. Emerald Deck: Sadu Diamond Crest -->
        <template v-else-if="deckThemeKey === 'emerald'">
          <polygon points="0,-16 14,0 0,16 -14,0" fill="url(#backGold-emerald)" opacity="0.85" />
          <polygon points="0,-10 9,0 0,10 -9,0" fill="#022c22" stroke="url(#backGold-emerald)" stroke-width="0.8" />
          <circle cx="0" cy="0" r="3" fill="#a7f3d0" />
        </template>

        <!-- 3. Heritage Deck: Crossed Swords & Palm Tree -->
        <template v-else-if="deckThemeKey === 'heritage'">
          <!-- Crossed Swords -->
          <line x1="-12" y1="-12" x2="12" y2="12" stroke="url(#backGold-heritage)" stroke-width="1.8" stroke-linecap="round" />
          <line x1="12" y1="-12" x2="-12" y2="12" stroke="url(#backGold-heritage)" stroke-width="1.8" stroke-linecap="round" />
          <!-- Palm Tree Center -->
          <circle cx="0" cy="0" r="6" fill="#120202" stroke="url(#backGold-heritage)" stroke-width="1" />
          <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
        </template>

        <!-- 4. Royal Deck: Royal Crown & Starlight -->
        <template v-else>
          <path d="M-10 6 L-8 -6 L-3 -1 L0 -9 L3 -1 L8 -6 L10 6 Z" fill="url(#backGold-royal)" stroke="#38bdf8" stroke-width="0.8" />
          <circle cx="0" cy="11" r="2" fill="#e0f2fe" />
        </template>
      </g>
    </svg>

    <!-- ============================================================ -->
    <!-- 2. GOLDEN JOKER CARD                                         -->
    <!-- ============================================================ -->
    <svg
      v-else-if="joker"
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-[5px] sm:rounded-[7px] shadow-md"
    >
      <defs>
        <linearGradient id="jokerBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff9e6" />
          <stop offset="35%" stop-color="#ffd56b" />
          <stop offset="70%" stop-color="#ffb833" />
          <stop offset="100%" stop-color="#c98a10" />
        </linearGradient>
        <linearGradient id="jokerFrame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8a5300" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#663b00" />
        </linearGradient>
      </defs>
      <!-- Base (Refined Casino Radius rx="4") -->
      <rect x="1.5" y="1.5" width="97" height="137" rx="4" fill="url(#jokerBg)" stroke="url(#jokerFrame)" stroke-width="2.4" />
      <rect x="4.5" y="4.5" width="91" height="131" rx="2.5" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6" />
      <rect x="6" y="6" width="88" height="128" rx="2" fill="none" stroke="#8a5300" stroke-width="0.6" opacity="0.35" />

      <!-- Corner Stars & Labels -->
      <text x="10" y="18" font-size="11" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">★</text>
      <text x="10" y="29" font-size="8" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">J</text>
      
      <g transform="rotate(180 50 70)">
        <text x="10" y="18" font-size="11" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">★</text>
        <text x="10" y="29" font-size="8" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">J</text>
      </g>

      <!-- Center Joker Crest / Crowned Falcon -->
      <g transform="translate(50, 64)">
        <!-- Aura Circle -->
        <circle cx="0" cy="0" r="26" fill="#fff9eb" opacity="0.7" stroke="#d4af37" stroke-width="1.2" />
        <circle cx="0" cy="0" r="23" fill="none" stroke="#e8a820" stroke-width="0.8" stroke-dasharray="3,2" />

        <!-- Crown -->
        <path d="M-14 -12 L-10 -22 L-3 -15 L0 -24 L3 -15 L10 -22 L14 -12 Z" fill="#b91c1c" stroke="#7a4800" stroke-width="1" />
        <circle cx="-10" cy="-22" r="1.5" fill="#ffe066" />
        <circle cx="0" cy="-24" r="2" fill="#ffe066" />
        <circle cx="10" cy="-22" r="1.5" fill="#ffe066" />

        <!-- Royal Falcon / Joker Icon -->
        <text x="0" y="10" font-size="28" text-anchor="middle" dominant-baseline="middle">🃏</text>
      </g>

      <!-- Gold Banner "JOKER" -->
      <g transform="translate(50, 108)">
        <rect x="-34" y="-8" width="68" height="16" rx="3" fill="#8a4f00" stroke="#ffd700" stroke-width="1.2" />
        <text x="0" y="3" font-size="10" font-weight="900" font-family="sans-serif" fill="#fff3c4" text-anchor="middle" letter-spacing="1.5">JOKER</text>
      </g>
      <text x="50" y="125" font-size="8" font-weight="bold" font-family="sans-serif" fill="#7a4800" text-anchor="middle">جوكر مجابيد</text>
    </svg>

    <!-- ============================================================ -->
    <!-- 3. REGULAR PLAYING CARD (A, 2-10, J, Q, K)                  -->
    <!-- ============================================================ -->
    <svg
      v-else
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-[5px] sm:rounded-[7px] shadow-md bg-[#faf8f5]"
    >
      <defs>
        <!-- Heart Path -->
        <g id="suit-heart">
          <path d="M0 3 C0 0 -4 -3 -6 -3 C-9 -3 -11 0 -11 3 C-11 7 -4 11 0 16 C4 11 11 7 11 3 C11 0 9 -3 6 -3 C4 -3 0 0 0 3 Z" fill="#d32f2f" />
        </g>
        <!-- Diamond Path -->
        <g id="suit-diamond">
          <path d="M0 -11 L8 0 L0 11 L-8 0 Z" fill="#d32f2f" />
        </g>
        <!-- Spade Path -->
        <g id="suit-spade">
          <path d="M0 -10 C-3 -4 -10 1 -10 6 C-10 10 -6 12 -2 11 C-1 11 0 12 -1 15 L2 15 C1 12 2 11 3 11 C7 12 11 10 11 6 C11 1 4 -4 0 -10 Z" fill="#1e293b" />
        </g>
        <!-- Club Path -->
        <g id="suit-club">
          <path d="M0 -3 A5 5 0 1 1 3.5 4.5 A5 5 0 1 1 -3.5 4.5 A5 5 0 1 1 0 -3 M-1 5 L-2.5 12 L2.5 12 L1 5 Z" fill="#1e293b" />
        </g>
      </defs>

      <!-- Card Base and Border (Refined Casino Radius rx="4") -->
      <rect x="1.5" y="1.5" width="97" height="137" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.6" />
      <rect x="4.5" y="4.5" width="91" height="131" rx="2.5" fill="none" stroke="#f1f5f9" stroke-width="0.8" />

      <!-- Top-Left Corner Index (Rank + Small Suit) -->
      <g transform="translate(10, 16)">
        <text
          x="0"
          y="0"
          :font-size="rank === '10' ? 10.5 : 13"
          font-weight="900"
          font-family="system-ui, -apple-system, sans-serif"
          :fill="cardColor"
          text-anchor="middle"
        >
          {{ rank }}
        </text>
        <g transform="translate(0, 7) scale(0.48)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- Bottom-Right Corner Index (Rotated 180) -->
      <g transform="translate(90, 124) rotate(180)">
        <text
          x="0"
          y="0"
          :font-size="rank === '10' ? 10.5 : 13"
          font-weight="900"
          font-family="system-ui, -apple-system, sans-serif"
          :fill="cardColor"
          text-anchor="middle"
        >
          {{ rank }}
        </text>
        <g transform="translate(0, 7) scale(0.48)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- Royal Face Card Art (J, Q, K) -->
      <g v-if="['J', 'Q', 'K'].includes(rank)" transform="translate(50, 70)">
        <!-- Outer ornate portrait frame -->
        <rect x="-30" y="-45" width="60" height="90" rx="3" fill="#faf5eb" stroke="#cbd5e1" stroke-width="1.2" />
        <rect x="-27" y="-42" width="54" height="84" rx="2" fill="none" stroke="#e2e8f0" stroke-width="0.6" stroke-dasharray="2,2" />

        <!-- Jack: The Knight/Warrior -->
        <template v-if="rank === 'J'">
          <circle cx="0" cy="-14" r="14" fill="#fed7aa" stroke="#c2410c" stroke-width="1" />
          <path d="M-14 -16 L-10 -26 L10 -26 L14 -16 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1" />
          <!-- Face features -->
          <circle cx="-4" cy="-15" r="1.5" fill="#1e293b" />
          <circle cx="4" cy="-15" r="1.5" fill="#1e293b" />
          <path d="M-5 -8 Q0 -5 5 -8" stroke="#c2410c" stroke-width="1.2" fill="none" />
          <!-- Armor and Halberd -->
          <path d="M-18 28 L-14 0 L14 0 L18 28 Z" fill="#1e3a8a" stroke="#cbd5e1" stroke-width="1" />
          <line x1="16" y1="-32" x2="16" y2="35" stroke="#78350f" stroke-width="2" />
          <polygon points="13,-32 16,-40 19,-32" fill="#94a3b8" />
        </template>

        <!-- Queen: The Monarch -->
        <template v-else-if="rank === 'Q'">
          <circle cx="0" cy="-14" r="14" fill="#fbcfe8" stroke="#be185d" stroke-width="1" />
          <!-- Royal Crown -->
          <path d="M-12 -20 L-10 -28 L-4 -22 L0 -30 L4 -22 L10 -28 L12 -20 Z" fill="#eab308" stroke="#a16207" stroke-width="1" />
          <circle cx="-10" cy="-28" r="1.2" fill="#dc2626" />
          <circle cx="0" cy="-30" r="1.5" fill="#2563eb" />
          <circle cx="10" cy="-28" r="1.2" fill="#dc2626" />
          <!-- Queen Face -->
          <circle cx="-4" cy="-15" r="1.5" fill="#1e293b" />
          <circle cx="4" cy="-15" r="1.5" fill="#1e293b" />
          <path d="M-4 -8 Q0 -6 4 -8" stroke="#be185d" stroke-width="1.2" fill="none" />
          <!-- Robe with Scepter -->
          <path d="M-18 28 L-14 0 L14 0 L18 28 Z" fill="#701a75" stroke="#f472b6" stroke-width="1" />
          <line x1="-15" y1="-10" x2="-15" y2="32" stroke="#eab308" stroke-width="1.8" />
          <circle cx="-15" cy="-12" r="3" fill="#eab308" />
        </template>

        <!-- King: The High Sovereign -->
        <template v-else-if="rank === 'K'">
          <circle cx="0" cy="-14" r="14" fill="#fde68a" stroke="#b45309" stroke-width="1" />
          <!-- Majestic High Crown -->
          <path d="M-14 -20 L-12 -31 L-4 -23 L0 -33 L4 -23 L12 -31 L14 -20 Z" fill="#eab308" stroke="#78350f" stroke-width="1.2" />
          <circle cx="-12" cy="-31" r="1.5" fill="#15803d" />
          <circle cx="0" cy="-33" r="2" fill="#b91c1c" />
          <circle cx="12" cy="-31" r="1.5" fill="#15803d" />
          <!-- King Beard & Face -->
          <circle cx="-4" cy="-16" r="1.5" fill="#1e293b" />
          <circle cx="4" cy="-16" r="1.5" fill="#1e293b" />
          <path d="M-6 -8 L0 -4 L6 -8" stroke="#78350f" stroke-width="1.4" fill="none" />
          <path d="M-8 -6 Q0 0 8 -6 L6 4 Q0 10 -6 4 Z" fill="#d97706" />
          <!-- Ermine Robe -->
          <path d="M-20 28 L-15 0 L15 0 L20 28 Z" fill="#991b1b" stroke="#fef08a" stroke-width="1" />
          <!-- Broadsword in center -->
          <line x1="0" y1="0" x2="0" y2="30" stroke="#cbd5e1" stroke-width="2.5" />
          <line x1="-6" y1="6" x2="6" y2="6" stroke="#eab308" stroke-width="2" />
        </template>

        <!-- Suit Inset on Character Frame -->
        <g transform="translate(0, 32) scale(0.65)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- Ace (Large Centered Suit) -->
      <g v-else-if="rank === 'A'" transform="translate(50, 70) scale(1.65)">
        <use :href="suitHref" />
      </g>

      <!-- Number Cards (Pip Layout) -->
      <g v-else>
        <g
          v-for="(pip, i) in numPips"
          :key="i"
          :transform="`translate(${pip.x}, ${pip.y}) ${pip.flip ? 'rotate(180)' : ''} scale(${pip.scale || 0.65})`"
        >
          <use :href="suitHref" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStore, type DeckType } from '~/stores/ui'

const props = withDefaults(
  defineProps<{
    rank?: string
    suit?: string
    joker?: boolean
    back?: boolean
    deck?: DeckType
    isSelected?: boolean
    isPlayable?: boolean
    isDimmed?: boolean
  }>(),
  {
    rank: 'A',
    suit: '♥',
    joker: false,
    back: false,
    isSelected: false,
    isPlayable: false,
    isDimmed: false,
  }
)

const ui = useUiStore()
const isHovered = ref(false)

const isRed = computed(() => props.suit === '♥' || props.suit === '♦')
const cardColor = computed(() => (isRed.value ? '#d32f2f' : '#1e293b'))

const suitHref = computed(() => {
  switch (props.suit) {
    case '♥': return '#suit-heart'
    case '♦': return '#suit-diamond'
    case '♠': return '#suit-spade'
    case '♣': return '#suit-club'
    default: return '#suit-spade'
  }
})

// Active Deck Theme Mapping
const deckThemeKey = computed<DeckType>(() => {
  if (props.deck && ['gold', 'emerald', 'heritage', 'royal'].includes(props.deck)) {
    return props.deck
  }
  const d = ui.activeDeck
  return ['gold', 'emerald', 'heritage', 'royal'].includes(d) ? d : 'gold'
})

const deckStrokeColor = computed(() => {
  switch (deckThemeKey.value) {
    case 'emerald': return '#10b981'
    case 'heritage': return '#eab308'
    case 'royal': return '#38bdf8'
    default: return '#d4af37'
  }
})

const deckCenterBg = computed(() => {
  switch (deckThemeKey.value) {
    case 'emerald': return '#022c22'
    case 'heritage': return '#1c0303'
    case 'royal': return '#0f172a'
    default: return '#0c3521'
  }
})

interface PipPos {
  x: number
  y: number
  scale?: number
  flip?: boolean
}

// Standard precise playing card pip layouts (ViewBox: 100 x 140, center at 50, 70)
const numPips = computed<PipPos[]>(() => {
  const r = props.rank
  switch (r) {
    case '2':
      return [
        { x: 50, y: 35 },
        { x: 50, y: 105, flip: true },
      ]
    case '3':
      return [
        { x: 50, y: 35 },
        { x: 50, y: 70 },
        { x: 50, y: 105, flip: true },
      ]
    case '4':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '5':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 50, y: 70 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '6':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '7':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 50, y: 52 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '8':
      return [
        { x: 32, y: 34 },
        { x: 68, y: 34 },
        { x: 50, y: 52 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 50, y: 88, flip: true },
        { x: 32, y: 106, flip: true },
        { x: 68, y: 106, flip: true },
      ]
    case '9':
      return [
        { x: 32, y: 30 },
        { x: 68, y: 30 },
        { x: 32, y: 56 },
        { x: 68, y: 56 },
        { x: 50, y: 70 },
        { x: 32, y: 84, flip: true },
        { x: 68, y: 84, flip: true },
        { x: 32, y: 110, flip: true },
        { x: 68, y: 110, flip: true },
      ]
    case '10':
      return [
        { x: 32, y: 28 },
        { x: 68, y: 28 },
        { x: 50, y: 44 },
        { x: 32, y: 56 },
        { x: 68, y: 56 },
        { x: 32, y: 84, flip: true },
        { x: 68, y: 84, flip: true },
        { x: 50, y: 96, flip: true },
        { x: 32, y: 112, flip: true },
        { x: 68, y: 112, flip: true },
      ]
    default:
      return [{ x: 50, y: 70, scale: 1.5 }]
  }
})
</script>