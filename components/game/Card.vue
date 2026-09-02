<template>
  <div
    class="relative select-none aspect-[100/140] rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
    :class="[
      isSelected ? 'ring-4 ring-gold shadow-gold-glow -translate-y-3 z-30 scale-105' : '',
      isPlayable ? 'ring-2 ring-emerald-400/80 shadow-jade-glow hover:-translate-y-2' : '',
      isDimmed ? 'opacity-40 grayscale-[40%] hover:opacity-60' : '',
    ]"
    v-html="svgContent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const PIP_LAYOUT: Record<string, [number, number][]> = {
  '2': [[0.5, 0.18], [0.5, 0.82]],
  '3': [[0.5, 0.15], [0.5, 0.5], [0.5, 0.85]],
  '4': [[0.28, 0.2], [0.72, 0.2], [0.28, 0.8], [0.72, 0.8]],
  '5': [[0.28, 0.2], [0.72, 0.2], [0.5, 0.5], [0.28, 0.8], [0.72, 0.8]],
  '6': [[0.28, 0.18], [0.72, 0.18], [0.28, 0.5], [0.72, 0.5], [0.28, 0.82], [0.72, 0.82]],
  '7': [[0.28, 0.16], [0.72, 0.16], [0.28, 0.42], [0.72, 0.42], [0.28, 0.68], [0.72, 0.68], [0.5, 0.9]],
  '8': [[0.28, 0.14], [0.72, 0.14], [0.28, 0.38], [0.72, 0.38], [0.28, 0.62], [0.72, 0.62], [0.28, 0.86], [0.72, 0.86]],
  '9': [[0.28, 0.13], [0.72, 0.13], [0.5, 0.28], [0.28, 0.43], [0.72, 0.43], [0.28, 0.68], [0.72, 0.68], [0.28, 0.88], [0.72, 0.88]],
  '10': [[0.28, 0.12], [0.72, 0.12], [0.28, 0.3], [0.72, 0.3], [0.5, 0.44], [0.28, 0.58], [0.72, 0.58], [0.28, 0.76], [0.72, 0.76], [0.5, 0.9]],
}

function pipSVG(suit: string, x: number, y: number, size = 34) {
  const col = suit === '♥' || suit === '♦' ? '#c8293b' : '#1d2b4f'
  if (suit === '♥' || suit === '♦') {
    return `<g transform="translate(${x} ${y}) scale(${size / 34})">
      <path d="M17 30C6 21 0 14 0 7.5 0 3 3.4 0 7.6 0c4 0 7.6 2.7 9.4 6.6C18.8 2.7 22.4 0 26.4 0 30.6 0 34 3 34 7.5c0 6.5-6 13.5-17 22.5z"
        fill="${col}" stroke="#ffffff" stroke-width="1.2"/>
    </g>`
  }
  return `<g transform="translate(${x} ${y}) scale(${size / 34})">
    <path d="${
      suit === '♠'
        ? 'M17 0C19 13 30 13 30 24c0 5-4.2 8-8.6 7.2 1.6 1.9 3.6 2.7 6 2.8H8.6c2.4-.1 4.4-.9 6-2.8C10.2 32 6 29 6 24 6 13 15 13 17 0z'
        : 'M17 34 5 22c-7-6-5-16 4-16 3.6 0 6.4 1.9 8 4.8C18.6 7.9 21.4 6 25 6c9 0 11 10 4 16z'
    }" fill="${col}"/>
    <ellipse cx="17" cy="22" rx="7.4" ry="6" fill="#fff" opacity=".85"/>
    ${suit === '♠' ? '<circle cx="17" cy="22" r="4.6" fill="#1d2b4f"/>' : ''}
  </g>`
}

function cornerText(rank: string, suit: string, col: string, x: number, y: number, scale = 1) {
  return `<text x="${x}" y="${y}" font-size="${23 * scale}" font-weight="900" font-family="Tahoma,Arial,sans-serif" fill="${col}" text-anchor="middle">${rank}</text>
          <text x="${x}" y="${y + 20 * scale}" font-size="${17 * scale}" fill="${col}" text-anchor="middle">${suit}</text>`
}

function numberCardSVG(rank: string, suit: string) {
  const col = suit === '♥' || suit === '♦' ? '#c8293b' : '#1d2b4f'
  const pts = PIP_LAYOUT[rank] || PIP_LAYOUT['10']
  let pips = ''
  for (const [px, py] of pts) {
    pips += pipSVG(suit, px * 100, py * 140, 26)
  }
  return `<svg viewBox="0 0 100 140" class="w-full h-full drop-shadow-md">
    <rect x="2" y="2" width="96" height="136" rx="11" fill="#fbfaf6" stroke="#b9b2a2" stroke-width="2"/>
    <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#00000012" stroke-width="1.5"/>
    <defs>
      <linearGradient id="wf${rank}${suit}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#efe9da"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="136" rx="11" fill="url(#wf${rank}${suit})" opacity="1"/>
    ${pips}
    ${cornerText(rank, suit, col, 12, 26, 1)}
    ${cornerText(rank, suit, col, 88, 26, 1)}
    <g transform="rotate(180 50 70)">${cornerText(rank, suit, col, 12, 26, 0.9)}</g>
    <g transform="rotate(180 50 70)">${cornerText(rank, suit, col, 88, 26, 0.9)}</g>
  </svg>`
}

function aceSVG(suit: string) {
  const col = suit === '♥' || suit === '♦' ? '#c8293b' : '#1d2b4f'
  return `<svg viewBox="0 0 100 140" class="w-full h-full drop-shadow-md">
    <rect x="2" y="2" width="96" height="136" rx="11" fill="#fdfcf8" stroke="#b9b2a2" stroke-width="2"/>
    <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#00000010"/>
    ${pipSVG(suit, 50, 70, 64)}
    <g opacity=".92">${cornerText('A', suit, col, 12, 26, 1)}</g>
    <g transform="rotate(180 50 70)">${cornerText('A', suit, col, 12, 26, 0.9)}</g>
  </svg>`
}

function faceSVG(rank: string, suit: string) {
  const red = suit === '♥' || suit === '♦'
  const col = red ? '#c8293b' : '#1d2b4f'
  const bg = red ? '#f6e2e2' : '#e3e8f2'
  const robe = red ? '#a8333f' : '#2b3a63'
  const skin = '#e8b98a'
  const crown = '#f2b21c'
  return `<svg viewBox="0 0 100 140" class="w-full h-full drop-shadow-md">
    <defs>
      <linearGradient id="fgc${rank}${suit}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fdfbf4"/>
        <stop offset="1" stop-color="#efe8d8"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="136" rx="11" fill="url(#fgc${rank}${suit})" stroke="#b9b2a2" stroke-width="2"/>
    <rect x="7.5" y="7.5" width="85" height="125" rx="7" fill="none" stroke="#00000010"/>
    <rect x="16" y="18" width="68" height="104" rx="8" fill="${bg}" opacity=".75"/>
    <rect x="16" y="18" width="68" height="104" rx="8" fill="none" stroke="${col}" stroke-width="1.4" opacity=".5"/>
    <circle cx="50" cy="58" r="15" fill="${skin}" stroke="${col}" stroke-width="1.6"/>
    <path d="M36 56 q0 -13 14 -13 t14 13" fill="none" stroke="${col}" stroke-width="2.4"/>
    <circle cx="44" cy="57" r="1.9" fill="#20242c"/><circle cx="56" cy="57" r="1.9" fill="#20242c"/>
    <path d="M45 66 q3 3.4 5 0 M50 66 q2.4 2.6 5 0" stroke="#8a5a33" stroke-width="1.3" fill="none"/>
    <path d="M33 47 h12 l4 -9 4 9 h12 v7 h-32 z" fill="${crown}" stroke="#b8860b" stroke-width="1"/>
    <path d="M28 100 q22 14 44 0 l-2 -22 q-20 10 -40 0 z" fill="${robe}" stroke="${col}" stroke-width="1.4"/>
    <path d="M50 76 v14" stroke="${col}" stroke-width="1.6"/>
    <g opacity=".95">${cornerText(rank, suit, col, 12, 27, 1)}</g>
    <g transform="rotate(180 50 70)">${cornerText(rank, suit, col, 12, 27, 0.9)}</g>
  </svg>`
}

function jokerSVG() {
  return `<svg viewBox="0 0 100 140" class="w-full h-full drop-shadow-xl">
    <defs>
      <linearGradient id="jok" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff6cf"/>
        <stop offset=".5" stop-color="#ffd75e"/>
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
  </svg>`
}

function backSVG() {
  return `<svg viewBox="0 0 100 140" class="w-full h-full drop-shadow-md">
    <defs>
      <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8e1f2c"/>
        <stop offset=".5" stop-color="#a8273a"/>
        <stop offset="1" stop-color="#701520"/>
      </linearGradient>
      <pattern id="cp" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="16" height="16" fill="transparent"/>
        <rect width="8" height="8" fill="rgba(255,214,140,.14)"/>
        <rect x="8" y="8" width="8" height="8" fill="rgba(255,214,140,.14)"/>
      </pattern>
    </defs>
    <rect x="2" y="2" width="96" height="136" rx="11" fill="url(#cbg)" stroke="#4d0e17" stroke-width="2.4"/>
    <rect x="6" y="6" width="88" height="128" rx="8" fill="url(#cp)"/>
    <rect x="11" y="11" width="78" height="118" rx="6" fill="none" stroke="rgba(255,224,150,.6)" stroke-width="1.6"/>
    <rect x="20" y="20" width="60" height="100" rx="99" fill="none" stroke="rgba(255,224,150,.55)" stroke-width="1.4"/>
    <text x="50" y="79" font-size="30" text-anchor="middle">🂡</text>
  </svg>`
}

const svgContent = computed(() => {
  if (props.back) return backSVG()
  if (props.joker) return jokerSVG()
  if (props.rank === 'A') return aceSVG(props.suit)
  if (['J', 'Q', 'K'].includes(props.rank)) return faceSVG(props.rank, props.suit)
  return numberCardSVG(props.rank, props.suit)
})
</script>
