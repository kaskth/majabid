<template>
  <div
    class="relative select-none aspect-[100/140] rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
    :class="[
      isSelected ? 'ring-4 ring-gold shadow-gold-glow -translate-y-3 z-30 scale-105 rotate-x-180' : '',
      isPlayable ? 'ring-2 ring-emerald-400/80 shadow-jade-glow hover:-translate-y-2 rotate-y-180' : '',
      isDimmed ? 'opacity-40 grayscale-[40%] hover:opacity-60' : '',
      // Holographic tilt effect
      'transform-gpu'
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @touchmove="onTouchMove"
  >
    <!-- Holographic foil overlay -->
    <div
      class="absolute inset-0 overflow-hidden transition-transform duration-500"
      :style="{
        transform: `perspective(800px) rotateY(${hologramRotation}deg) rotateX(${hologramTilt}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }"
    >
      <!-- Gradient foil band -->
      <div class="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-gold/30 via-transparent to-gold/20 pointer-events-none"></div>
      <!-- Center gold accent band -->
      <div class="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-gold/20 via-transparent to-gold/10 pointer-events-none"></div>
    </div>
    
    <!-- Card surface with depth -->
    <div
      class="relative w-full h-full rounded-xl p-1.5 transition-all duration-300"
      :style="{
        background: cardBackground,
        boxShadow: cardShadow,
        transform: `perspective(800px) rotateX(${cardTilt}deg) rotateY(${cardYaw}deg) scale(${cardScale})`
      }"
    >
      <!-- Card back or joker or regular card -->
      <div
        v-if="isJoker"
        class="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#ffd75e] via-[#ffecb3] to-[#ffd75e] shadow-2xl"
      >
        <svg
          viewBox="0 0 100 140"
          class="w-full h-full mx-auto my-auto"
          style="filter: drop-shadow(0 0 20px rgba(255, 215, 94, 0.8));"
        >
          <defs>
            <linearGradient id="jok" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#fff6cf"/>
              <stop offset="0.5" stop-color="#ffd75e"/>
              <stop offset="1" stop-color="#e39c12"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="136" rx="11" fill="url(#jok)" stroke="#a8740a" stroke-width="2.4"/>
          <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>
          <circle cx="50" cy="55" r="17" fill="#fff" opacity=".85" stroke="#a8740a"/>
          <circle cx="44" cy="53" r="2.2" fill="#333"/><circle cx="56" cy="53" r="2.2" fill="#333"/>
          <path d="M43 61 q7 6 14 0" stroke="#a8740a" stroke-width="2" fill="none"/>
          <path d="M35 40 l7 -11 8 8 8 -8 7 11 z" fill="#c8302e" stroke="#8f1d1c" stroke-width="1.3"/>
          <circle cx="35" cy="38" r="3" fill="#c8302e"/><circle cx="65" cy="38" r="3" fill="#c8302e"/>
          <path d="M30 88 q20 12 40 0 l-3 -12 q-17 9 -34 0 z" fill="#2b6cb0" stroke="#1d4571" stroke-width="1.3"/>
          <text x="50" y="112" font-size="12" font-weight="900" font-family="Tahoma" fill="#7a4a00" text-anchor="middle">JOKER</text>
          <text x="50" y="126" font-size="10" fill="#7a4a00" text-anchor="middle">🃏</text>
        </svg>
      </div>
      
      <div
        v-else-if="isBack"
        class="relative w-full h-full rounded-xl bg-[url('/card-back.svg')] bg-contain no-repeat"
        :style="{
          background: cardBackground,
          backgroundSize: 'contain',
          backgroundPosition: 'center'
        }"
      >
        <!-- Subtle pattern on back -->
        <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22blur%22%3E%3C%2Ffilter%3E%3Crect%20width%3D%2232%22%20height%3D%2232%22%20fill%3D%22%23000000%22%20opacity%3D%220.3%22/%3E%3C/svg%3E')"/>
      </div>
      
      <div
        v-else
        class="relative w-full h-full rounded-xl overflow-hidden"
        :style="{
          background: cardBackground,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }"
      >
        <!-- Holographic prism effect overlay -->
        <div
          class="absolute inset-0 opacity-30"
          :style="{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
            transform: 'translateY(-50%)'
          }"
        />
        
        <!-- Card content -->
        <svg
          v-if="rank === 'A'"
          viewBox="0 0 100 140"
          class="w-full h-full mx-auto my-auto"
          style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));"
        >
          <rect x="2" y="2" width="96" height="136" rx="11" fill="#fdfcf8" stroke="#b9b2a2" stroke-width="2"/>
          <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#00000010"/>
          <pip-svg-suited suit="suit" x="50" y="70" size="64"/>
          <text x="12" y="27" font-weight="900" font-family="Tahoma, Arial, sans-serif" fill="%{cardColor}" text-anchor="middle">A</text>
          <text x="12" y="47" font-size="15" fill="%{cardColor}" text-anchor="middle">%{suit}</text>
          <g transform="rotate(180 50 70)">${cornerText('A', suit, cardColor, 12, 27, 1)}</g>
          <g transform="rotate(180 50 70)">${cornerText('A', suit, cardColor, 88, 27, 0.9)}</g>
        </svg>
        
        <svg
          v-if="['J', 'Q', 'K'].includes(rank)"
          viewBox="0 0 100 140"
          class="w-full h-full mx-auto my-auto"
          style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));"
        >
          <rect x="2" y="2" width="96" height="136" rx="11" fill="%{faceBg}" stroke="%{cardColor}" stroke-width="1.4"/>
          <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#00000010"/>
          <!-- Robe -->
          <rect x="16" y="18" width="68" height="104" rx="8" fill="%{robeBg}" opacity=".75"/>
          <rect x="16" y="18" width="68" height="104" rx="8" fill="none" stroke="%{cardColor}" stroke-width="1.4" opacity=".5"/>
          <!-- Face -->
          <circle cx="50" cy="58" r="15" fill="%{skinColor}" stroke="%{cardColor}" stroke-width="1.6"/>
          <path d="M36 56 q0 -13 14 -13 t14 13" fill="none" stroke="%{cardColor}" stroke-width="2.4"/>
          <circle cx="44" cy="57" r="1.9" fill="#20242c"/><circle cx="56" cy="57" r="1.9" fill="#20242c"/>
          <!-- Eyes and details -->
          <path d="M45 66 q3 3.4 5 0 M50 66 q2.4 2.6 5 0" stroke="#8a5a33" stroke-width="1.3" fill="none"/>
          <path d="M33 47 h12 l4 -9 4 9 h12 v7 h-32 z" fill="%{crownColor}" stroke="#b8860b" stroke-width="1"/>
          <path d="M28 100 q22 14 44 0 l-2 -22 q-20 10 -40 0 z" fill="%{robeColor}" stroke="%{cardColor}" stroke-width="1.4"/>
          <path d="M50 76 v14" stroke="%{cardColor}" stroke-width="1.6"/>
          <!-- Corner text -->
          <g opacity=".95">${cornerText(rank, suit, cardColor, 12, 27, 1)}</g>
          <g transform="rotate(180 50 70)">${cornerText(rank, suit, cardColor, 12, 27, 0.9)}</g>
        </svg>
        
        <svg
          v-else
          viewBox="0 0 100 140"
          class="w-full h-full mx-auto my-auto"
          style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));"
        >
          <rect x="2" y="2" width="96" height="136" rx="11" fill="#fbfaf6" stroke="#b9b2a2" stroke-width="2"/>
          <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#00000012" stroke-width="1.5"/>
          <!-- Pips layout -->
          <defs>
            <linearGradient id="wf${rank}${suit}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ffffff"/>
              <stop offset="1" stop-color="#efe9da"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="136" rx="11" fill="url(#wf${rank}${suit})" opacity="1"/>
          <!-- Pips -->
          <g v-for="( [px, py], i ) in pips" :key="i">
            <g transform="translate(${px * 100} ${py * 140}) scale(0.66)">
              <pip-svg-suited suit="suit" x="0" y="0" size="26"/>
            </g>
          </g>
          <!-- Corner text -->
          <corner-text-comp rank="rank" suit="suit" color="cardColor" small="1"/>
          <corner-text-comp rank="rank" suit="suit" color="cardColor" small="0.9" transform="rotate(180 50 70)"/>
        </svg>
      </div>
    </div>
    
    <!-- Selection ring -->
    <div
      v-if="isSelected"
      class="absolute inset-0 rounded-xl ring-4 ring-gold shadow-gold-glow pointer-events-none opacity-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, type ComputedRef } from 'vue'

const props = withDefaults(
  defineProps<{
    rank?: string
    suit?: string
    joker?: boolean
    back?: boolean
    isSelected?: boolean
    isPlayable?: boolean
    isDimmed?: boolean
    // Table position info
    position?: 'left' | 'center' | 'right'
    isFaceUp?: boolean
  }>(),
  {
    rank: 'A',
    suit: '♥',
    joker: false,
    back: false,
    isSelected: false,
    isPlayable: false,
    isDimmed: false,
    position: 'center',
    isFaceUp: true,
  }
)

// Card color based on suit
const cardColor = computed(() => {
  const isRedSuit = props.suit === '♥' || props.suit === '♦'
  return isRedSuit ? '#c8293b' : '#1d2b4f'
})

// Face background for J/Q/K
const faceBg = computed(() => {
  const isRedSuit = props.suit === '♥' || props.suit === '♦'
  return isRedSuit ? '#f6e2e2' : '#e3e8f2'
})

// Robe color for face cards
const robeBg = computed(() => {
  const isRedSuit = props.suit === '♥' || props.suit === '♦'
  return isRedSuit ? '#a8333f' : '#2b3a63'
})

// Skin color for face cards
const skinColor = computed(() => {
  const isRedSuit = props.suit === '♥' || props.suit === '♦'
  return isRedSuit ? '#e8b98a' : '#2b3a63'
})

// Crown color for face cards
const crownColor = computed(() => {
  const isRedSuit = props.suit === '♥' || props.suit === '♦'
  return isRedSuit ? '#f2b21c' : '#f2b21c'
})

// Pips color for number cards
const pipsColor = computed(() => {
  const isRedSuit = props.suit === '♥' || props.suit === '♦'
  return isRedSuit ? '#c8293b' : '#1d2b4f'
})

// Card background based on state
const cardBackground = computed(() => {
  if (props.isDimmed) return 'rgba(0, 0, 0, 0.3)'
  if (props.isPlayable && !props.isDimmed) return 'rgba(255, 245, 230, 0.8)'
  return 'rgba(255, 255, 255, 0.9)'
})

// Shadow based on state
const cardShadow = computed(() => {
  if (props.isSelected) return '0 0 30px rgba(245, 197, 66, 0.6)'
  if (props.isPlayable) return '0 10px 20px rgba(0, 0, 0, 0.3)'
  return '0 4px 12px rgba(0, 0, 0, 0.15)'
})

// Holographic rotation state
const hologramRotation = ref(0)
const hologramTilt = ref(0)
let mouseX = 0
let mouseY = 0
let touchX = 0
let touchY = 0

// Card tilt/transform state
const cardTilt = ref(0)
const cardYaw = ref(0)
const cardScale = computed(() => props.isSelected ? 1.05 : 1)

// Animation frame request
let animationId: number | null = null

function onMouseEnter(e: MouseEvent) {
  if (!props.isFaceUp || props.isDimmed) return
  // Store mouse position for tilt effect
  mouseX = e.clientX
  mouseY = e.clientY
  startHologramEffect()
}

function onMouseLeave() {
  stopHologramEffect()
  hologramRotation.value = 0
  hologramTilt.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (!props.isFaceUp || props.isDimmed) return
  const touch = e.touches[0]
  if (touch) {
    touchX = touch.clientX
    touchY = touch.clientY
    startHologramEffect()
  }
}

function startHologramEffect() {
  animationId = requestAnimationFrame(updateHologram)
}

function stopHologramEffect() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  hologramRotation.value = 0
  hologramTilt.value = 0
}

function updateHologram() {
  if (!animationId) return
  
  // Calculate rotation based on mouse position
  const centerX = 400 // approximate center
  const centerY = 400
  const deltaX = mouseX - centerX
  const deltaY = mouseY - centerY
  
  // Map mouse movement to rotation (-10 to 10 degrees)
  hologramRotation.value = (deltaX / centerX) * 10
  hologramTilt.value = (deltaY / centerY) * 5
  
  // Continuous rotation for holographic effect
  hologramRotation.value = (hologramRotation.value || 0) + 0.5
  
  animationId = requestAnimationFrame(updateHologram)
}

// Helper components - inline SVG functions from original Card.vue
function pipSVG(suit: string, x: number, y: number, size = 26) {
  const col = suit === '♥' || suit === '♦' ? '#c8293b' : '#1d2b4f'
  if (suit === '♥' || suit === '♦') {
    return `<g transform="translate(${x} ${y}) scale(${size / 26})">
      <path d="M17 30C6 21 0 14 0 7.5 0 3 3.4 0 7.6 0c4 0 7.6 2.7 9.4 6.6C18.8 2.7 22.4 0 26.4 0 30.6 0 34 3 34 7.5c0 6.5-6 13.5-17 22.5z" fill="${col}" stroke="#ffffff" stroke-width="1.2"/>
    </g>`
  }
  return `<g transform="translate(${x} ${y}) scale(${size / 26})">
    <path d="M17 0C19 13 30 13 30 24c0 5-4.2 8-8.6 7.2 1.6 1.9 3.6 2.7 6 2.8H8.6c2.4-.1 4.4-.9 6-2.8C10.2 32 6 29 6 24 6 13 15 13 17 0z" fill="${col}"/>
    <ellipse cx="17" cy="22" rx="7.4" ry="6" fill="#fff" opacity=".85"/>
    ${props.suit === '♠' ? '<circle cx="17" cy="22" r="4.6" fill="#1d2b4f"/>' : ''}
  </g>`
}

function cornerText(rank: string, suit: string, col: string, x: number, y: number, scale = 1) {
  return `<text x="${x}" y="${y}" font-size="${23 * scale}" font-weight="900" font-family="Tahoma,Arial,sans-serif" fill="${col}" text-anchor="middle">${rank}</text>
          <text x="${x}" y="${y + 20 * scale}" font-size="${17 * scale}" fill="${col}" text-anchor="middle">${suit}</text>`
}

function cornerTextComp(rank: string, suit: string, color: string, small: number, transform?: string) {
  const col = suit === '♥' || suit === '♦' ? '#c8293b' : '#1d2b4f'
  return `<text x="12" y="27" font-size="${23 * small}" font-weight="900" font-family="Tahoma,Arial,sans-serif" fill="${col}" text-anchor="middle">${rank}</text>
          <text x="12" y="47" font-size="${17 * small}" fill="${col}" text-anchor="middle">${suit}</text>` + (transform || '')
}

function pipSVGSuited(suit: string, x: number, y: number, size: number) {
  const col = suit === '♥' || suit === '♦' ? '#c8293b' : '#1d2b4f'
  if (suit === '♥' || suit === '♦') {
    return `<g transform="translate(${x} ${y}) scale(${size / 26})">
      <path d="M17 30C6 21 0 14 0 7.5 0 3 3.4 0 7.6 0c4 0 7.6 2.7 9.4 6.6C18.8 2.7 22.4 0 26.4 0 30.6 0 34 3 34 7.5c0 6.5-6 13.5-17 22.5z" fill="${col}" stroke="#ffffff" stroke-width="1.2"/>
    </g>`
  }
  return `<g transform="translate(${x} ${y}) scale(${size / 26})">
    <path d="M17 0C19 13 30 13 30 24c0 5-4.2 8-8.6 7.2 1.6 1.9 3.6 2.7 6 2.8H8.6c2.4-.1 4.4-.9 6-2.8C10.2 32 6 29 6 24 6 13 15 13 17 0z" fill="${col}"/>
    <ellipse cx="17" cy="22" rx="7.4" ry="6" fill="#fff" opacity=".85"/>
    ${props.suit === '♠' ? '<circle cx="17" cy="22" r="4.6" fill="#1d2b4f"/>' : ''}
  </g>`
}

// Expose functions for template
const pipSvgRef = pipSVG
const cornerTextRef = cornerText
const cornerTextCompRef = cornerTextComp
const pipSvgSuitedRef = pipSVGSuited
</script>

<!-- Custom CSS for holographic effects -->
<style scoped>
/* Holographic foil animation */
@keyframes foilShift {
  0%, 100% { background-position: 0% 85%; }
  50% { background-position: 0% 15%; }
}

/* Gold glow for selected cards */
.gold-glow {
  box-shadow: 0 0 25px rgba(245, 197, 66, 0.45), 0 0 50px rgba(245, 197, 66, 0.2);
}

/* Card flip transition */
.card-flip {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dimmed state */
.opacity-40 {
  opacity: 0.4;
}

/* Playable ring */
.playable-ring {
  box-shadow: 0 0 0 2px rgba(23, 194, 107, 0.5);
}
</style>