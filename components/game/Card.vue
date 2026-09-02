<template>
  <div
    class="relative select-none aspect-[100/140] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 transform-gpu"
    :class="[
      isSelected ? '-translate-y-3 scale-105 ring-4 ring-amber-400 shadow-[0_12px_28px_rgba(245,197,66,0.6)] z-30' : '',
      isPlayable && !isSelected ? 'ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.5)] hover:-translate-y-1.5' : '',
      isDimmed ? 'opacity-40 grayscale-[50%] pointer-events-none' : '',
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Card Back -->
    <svg
      v-if="back"
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-xl shadow-md"
    >
      <defs>
        <linearGradient id="backBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a2a1a" />
          <stop offset="50%" stop-color="#05170e" />
          <stop offset="100%" stop-color="#020b07" />
        </linearGradient>
        <linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffe6a3" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#997a15" />
        </linearGradient>
        <pattern id="backGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 L5 0 L10 5 L5 10 Z" fill="none" stroke="#d4af37" stroke-width="0.35" opacity="0.25" />
        </pattern>
      </defs>
      <!-- Base & Outer border -->
      <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="url(#backBg)" stroke="url(#backGold)" stroke-width="2.5" />
      <rect x="5.5" y="5.5" width="89" height="129" rx="7" fill="url(#backBg)" stroke="#d4af37" stroke-width="0.8" opacity="0.6" />
      <rect x="7" y="7" width="86" height="126" rx="5" fill="url(#backGrid)" />
      
      <!-- Corner floral ornaments -->
      <g stroke="url(#backGold)" stroke-width="0.8" fill="none" opacity="0.7">
        <path d="M10 16 Q16 16 16 10" />
        <path d="M90 16 Q84 16 84 10" />
        <path d="M10 124 Q16 124 16 130" />
        <path d="M90 124 Q84 124 84 130" />
      </g>

      <!-- Center Medallion (Islamic Star & Rosette) -->
      <g transform="translate(50, 70)">
        <!-- Outer glow circle -->
        <circle cx="0" cy="0" r="22" fill="#0c3521" stroke="url(#backGold)" stroke-width="1.2" />
        <circle cx="0" cy="0" r="18" fill="none" stroke="url(#backGold)" stroke-width="0.6" stroke-dasharray="2,2" opacity="0.8" />
        <!-- 8-pointed star -->
        <path
          d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z"
          fill="url(#backGold)"
          opacity="0.9"
        />
        <path
          d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z"
          fill="url(#backGold)"
          transform="rotate(45)"
          opacity="0.7"
        />
        <circle cx="0" cy="0" r="4.5" fill="#04150b" stroke="url(#backGold)" stroke-width="0.8" />
        <circle cx="0" cy="0" r="2" fill="#ffe6a3" />
      </g>
    </svg>

    <!-- Golden Joker Card -->
    <svg
      v-else-if="joker"
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-xl shadow-md"
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
      <!-- Base -->
      <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="url(#jokerBg)" stroke="url(#jokerFrame)" stroke-width="2.6" />
      <rect x="5.5" y="5.5" width="89" height="129" rx="7" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.6" />
      <rect x="7" y="7" width="86" height="126" rx="5.5" fill="none" stroke="#8a5300" stroke-width="0.8" opacity="0.4" />

      <!-- Corner Stars & Labels -->
      <text x="11" y="19" font-size="11" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">★</text>
      <text x="11" y="30" font-size="8" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">J</text>
      
      <g transform="rotate(180 50 70)">
        <text x="11" y="19" font-size="11" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">★</text>
        <text x="11" y="30" font-size="8" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">J</text>
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
        <rect x="-34" y="-8" width="68" height="16" rx="4" fill="#8a4f00" stroke="#ffd700" stroke-width="1.2" />
        <text x="0" y="3" font-size="10" font-weight="900" font-family="sans-serif" fill="#fff3c4" text-anchor="middle" letter-spacing="1.5">JOKER</text>
      </g>
      <text x="50" y="125" font-size="8" font-weight="bold" font-family="sans-serif" fill="#7a4800" text-anchor="middle">جوكر مجابيد</text>
    </svg>

    <!-- Regular Playing Card (A, 2-10, J, Q, K) -->
    <svg
      v-else
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-xl shadow-md bg-[#faf8f5]"
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

      <!-- Card Base and Border -->
      <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.8" />
      <rect x="4.5" y="4.5" width="91" height="131" rx="7" fill="none" stroke="#f1f5f9" stroke-width="1" />

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

      <!-- Center Area by Card Type -->

      <!-- 1) ACE: Big Central Ornamental Pip -->
      <g v-if="rank === 'A'" transform="translate(50, 70)">
        <!-- Subtle back ring -->
        <circle cx="0" cy="2" r="23" fill="none" :stroke="cardColor" stroke-width="0.8" opacity="0.18" />
        <g transform="scale(2.4)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- 2) COURT CARDS (J, Q, K): Royal Portraits -->
      <g v-else-if="['J', 'Q', 'K'].includes(rank)" transform="translate(50, 70)">
        <!-- Portrait Box Frame -->
        <rect x="-27" y="-42" width="54" height="84" rx="6" fill="#fcfbf7" :stroke="cardColor" stroke-width="1.2" opacity="0.9" />
        <rect x="-24" y="-39" width="48" height="78" rx="4" fill="none" stroke="#d4af37" stroke-width="0.7" opacity="0.6" />

        <!-- Royal Silhouette & Clothing -->
        <g v-if="rank === 'K'">
          <!-- King (الشايب) -->
          <circle cx="0" cy="-12" r="14" fill="#fde68a" stroke="#d4af37" stroke-width="1" />
          <!-- Royal Crown -->
          <path d="M-11 -23 L-8 -31 L-2 -26 L0 -33 L2 -26 L8 -31 L11 -23 Z" fill="#d4af37" stroke="#854d0e" stroke-width="0.8" />
          <circle cx="0" cy="-33" r="1.5" fill="#ef4444" />
          <!-- Beard -->
          <path d="M-8 -6 C-8 6 -3 10 0 10 C3 10 8 6 8 -6 Z" fill="#475569" />
          <!-- Eyes & Moustache -->
          <circle cx="-3" cy="-14" r="1" fill="#0f172a" />
          <circle cx="3" cy="-14" r="1" fill="#0f172a" />
          <path d="M-5 -9 Q0 -7 5 -9" stroke="#0f172a" stroke-width="1" fill="none" />
          <!-- Robe / Sceptre -->
          <path d="M-20 36 L-15 10 L15 10 L20 36 Z" :fill="isRed ? '#b91c1c' : '#1e3a8a'" />
          <path d="M0 10 L0 36" stroke="#d4af37" stroke-width="2" />
          <text x="0" y="27" font-size="12" text-anchor="middle">👑</text>
        </g>

        <g v-else-if="rank === 'Q'">
          <!-- Queen (البنت) -->
          <circle cx="0" cy="-12" r="13" fill="#fef08a" stroke="#d4af37" stroke-width="1" />
          <!-- Queen Tiara -->
          <path d="M-9 -21 Q0 -28 9 -21 L0 -24 Z" fill="#d4af37" stroke="#854d0e" stroke-width="0.8" />
          <circle cx="0" cy="-26" r="1.5" fill="#3b82f6" />
          <!-- Eyes & Smile -->
          <circle cx="-3.5" cy="-13" r="1" fill="#0f172a" />
          <circle cx="3.5" cy="-13" r="1" fill="#0f172a" />
          <path d="M-3 -8 Q0 -6 3 -8" stroke="#dc2626" stroke-width="1" fill="none" />
          <!-- Hijazi / Royal Veil -->
          <path d="M-10 -18 Q-16 -5 -12 12 L12 12 Q16 -5 10 -18 Z" fill="none" stroke="#d4af37" stroke-width="1" opacity="0.6" />
          <path d="M-18 36 L-12 10 L12 10 L18 36 Z" :fill="isRed ? '#991b1b' : '#312e81'" />
          <text x="0" y="27" font-size="12" text-anchor="middle">🌹</text>
        </g>

        <g v-else>
          <!-- Jack (الشاب) -->
          <circle cx="0" cy="-12" r="13" fill="#fde047" stroke="#d4af37" stroke-width="1" />
          <!-- Headband / Hat -->
          <rect x="-10" y="-24" width="20" height="6" rx="2" fill="#b91c1c" stroke="#d4af37" stroke-width="0.8" />
          <circle cx="-3" cy="-13" r="1" fill="#0f172a" />
          <circle cx="3" cy="-13" r="1" fill="#0f172a" />
          <path d="M-3 -8 Q0 -7 3 -8" stroke="#0f172a" stroke-width="1" fill="none" />
          <!-- Robe with Sword -->
          <path d="M-19 36 L-13 10 L13 10 L19 36 Z" :fill="isRed ? '#c2410c' : '#0f766e'" />
          <path d="M-10 18 L10 32" stroke="#d4af37" stroke-width="1.8" />
          <text x="0" y="27" font-size="12" text-anchor="middle">⚔️</text>
        </g>

        <!-- Small Suit in Court Card Center -->
        <g transform="translate(18, -30) scale(0.6)">
          <use :href="suitHref" />
        </g>
        <g transform="translate(-18, 30) scale(0.6)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- 3) NUMBER CARDS (2 to 10): Geometric Pip Grid -->
      <g v-else>
        <g
          v-for="(pip, idx) in numPips"
          :key="idx"
          :transform="`translate(${pip.x}, ${pip.y}) scale(${pip.scale || 0.85}) ${pip.flip ? 'rotate(180)' : ''}`"
        >
          <use :href="suitHref" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    rank?: string
    suit?: string
    joker?: boolean
    back?: boolean
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
        { x: 50, y: 34 },
        { x: 50, y: 106, flip: true },
      ]
    case '3':
      return [
        { x: 50, y: 34 },
        { x: 50, y: 70 },
        { x: 50, y: 106, flip: true },
      ]
    case '4':
      return [
        { x: 32, y: 34 },
        { x: 68, y: 34 },
        { x: 32, y: 106, flip: true },
        { x: 68, y: 106, flip: true },
      ]
    case '5':
      return [
        { x: 32, y: 34 },
        { x: 68, y: 34 },
        { x: 50, y: 70 },
        { x: 32, y: 106, flip: true },
        { x: 68, y: 106, flip: true },
      ]
    case '6':
      return [
        { x: 32, y: 34 },
        { x: 68, y: 34 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 32, y: 106, flip: true },
        { x: 68, y: 106, flip: true },
      ]
    case '7':
      return [
        { x: 32, y: 34 },
        { x: 68, y: 34 },
        { x: 50, y: 52 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 32, y: 106, flip: true },
        { x: 68, y: 106, flip: true },
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