<template>
  <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
    <div
      v-for="card in activeCards"
      :id="`flight-${card.id}`"
      :key="card.id"
      class="absolute top-0 left-0 pointer-events-none transform-gpu will-change-transform"
      :style="{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        filter: card.glow ? `drop-shadow(0 0 16px ${card.glow})` : 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))',
      }"
    >
      <GameCard
        :rank="card.rank"
        :suit="card.suit"
        :joker="card.joker"
        :back="card.back"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import gsap from 'gsap'
import { useCardAnimation, type CardFlightEvent } from '~/composables/useCardAnimation'
import { useGameStore } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

interface FlightItem {
  id: string
  rank?: string
  suit?: string
  joker?: boolean
  back?: boolean
  glow?: string
}

const game = useGameStore()
const audio = useAudioStore()
const { flightEvents, popFlight } = useCardAnimation()

const activeCards = ref<FlightItem[]>([])
let nextFlightId = 1

const cardWidth = computed(() => {
  if (typeof window === 'undefined') return 44
  return window.innerWidth < 640 ? 42 : 58
})

const cardHeight = computed(() => Math.round(cardWidth.value * 1.4))

function getElementCenter(id: string): { x: number; y: number } {
  if (typeof document === 'undefined') {
    return { x: 200, y: 300 }
  }
  const el = document.getElementById(id)
  if (!el) {
    // Graceful fallback to screen sections
    if (id.includes('deck')) return { x: window.innerWidth * 0.35, y: window.innerHeight * 0.4 }
    if (id.includes('field')) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 }
    if (id.includes('seat-zone-1')) return { x: window.innerWidth * 0.2, y: window.innerHeight * 0.2 }
    if (id.includes('seat-zone-2')) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.15 }
    if (id.includes('seat-zone-3')) return { x: window.innerWidth * 0.8, y: window.innerHeight * 0.2 }
    return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.85 }
  }
  const r = el.getBoundingClientRect()
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
  }
}

function getSeatAnchorId(seatIndex?: number): string {
  if (seatIndex === undefined || seatIndex === null) return 'hand-fan-container'
  // If local player
  if (seatIndex === game.mySeat) {
    return 'hand-fan-container'
  }
  return `seat-zone-${seatIndex}`
}

// Watch for flight event triggers
watch(
  () => flightEvents.value.length,
  (len) => {
    if (len > 0) {
      const ev = popFlight()
      if (ev) processFlightEvent(ev)
    }
  }
)

function processFlightEvent(ev: CardFlightEvent) {
  switch (ev.type) {
    case 'deal':
      animateDeal()
      break
    case 'discard':
      animateDiscard(ev)
      break
    case 'eat':
      animateEat(ev)
      break
    case 'stop':
      animateStop(ev)
      break
    case 'flip':
      animateFlip(ev)
      break
  }
}

// 1. DEALING ANIMATION (Deck -> All 4 Players)
function animateDeal() {
  const deckPos = getElementCenter('table-deck-source')
  const seats = [0, 1, 2, 3]

  seats.forEach((s, idx) => {
    const targetPos = getElementCenter(getSeatAnchorId(s))
    const item: FlightItem = {
      id: `deal-${nextFlightId++}`,
      back: true,
      glow: 'rgba(245, 197, 66, 0.4)',
    }
    activeCards.value.push(item)

    setTimeout(() => {
      audio.sfx.deal()
      const el = document.getElementById(`flight-${item.id}`)
      if (!el) return

      gsap.fromTo(
        el,
        {
          x: deckPos.x - cardWidth.value / 2,
          y: deckPos.y - cardHeight.value / 2,
          rotation: (Math.random() - 0.5) * 20,
          scale: 0.8,
          opacity: 0,
        },
        {
          x: targetPos.x - cardWidth.value / 2,
          y: targetPos.y - cardHeight.value / 2,
          rotation: (Math.random() - 0.5) * 30,
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(el, {
              opacity: 0,
              duration: 0.15,
              onComplete: () => {
                activeCards.value = activeCards.value.filter((c) => c.id !== item.id)
              },
            })
          },
        }
      )
    }, idx * 90)
  })
}

// 2. DISCARD ANIMATION (Player Seat -> Field)
function animateDiscard(ev: CardFlightEvent) {
  const fromPos = getElementCenter(getSeatAnchorId(ev.seatIndex))
  const fieldPos = getElementCenter('table-field-target')

  const item: FlightItem = {
    id: `discard-${nextFlightId++}`,
    rank: ev.rank,
    suit: ev.suit || '♠',
    joker: ev.joker,
    glow: 'rgba(255, 255, 255, 0.3)',
  }
  activeCards.value.push(item)

  setTimeout(() => {
    const el = document.getElementById(`flight-${item.id}`)
    if (!el) return

    const targetX = fieldPos.x - cardWidth.value / 2 + (Math.random() - 0.5) * 40
    const targetY = fieldPos.y - cardHeight.value / 2 + (Math.random() - 0.5) * 20
    const randomRot = (Math.random() - 0.5) * 24

    gsap.fromTo(
      el,
      {
        x: fromPos.x - cardWidth.value / 2,
        y: fromPos.y - cardHeight.value / 2,
        rotation: 0,
        scale: 1.15,
        opacity: 0.9,
      },
      {
        x: targetX,
        y: targetY,
        rotation: randomRot,
        scale: 0.95,
        opacity: 1,
        duration: 0.42,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(el, {
            scale: 0.9,
            opacity: 0,
            duration: 0.25,
            delay: 0.05,
            onComplete: () => {
              activeCards.value = activeCards.value.filter((c) => c.id !== item.id)
            },
          })
        },
      }
    )
  }, 10)
}

// 3. EAT / SWEEP ANIMATION (Target Cards -> Eating Player Pile)
function animateEat(ev: CardFlightEvent) {
  const eaterPos = getElementCenter(getSeatAnchorId(ev.seatIndex))
  const fieldPos = getElementCenter('table-field-target')

  // Create flying cluster representing swept cards
  const count = Math.min(ev.count || 2, 4)
  for (let i = 0; i < count; i++) {
    const item: FlightItem = {
      id: `eat-${nextFlightId++}`,
      rank: ev.rank,
      suit: ev.suit || '♥',
      joker: ev.joker,
      glow: 'rgba(52, 211, 153, 0.6)',
    }
    activeCards.value.push(item)

    setTimeout(() => {
      const el = document.getElementById(`flight-${item.id}`)
      if (!el) return

      const startX = fieldPos.x - cardWidth.value / 2 + (i - 1) * 8
      const startY = fieldPos.y - cardHeight.value / 2 + (i - 1) * 4

      gsap.fromTo(
        el,
        {
          x: startX,
          y: startY,
          rotation: (i - 1) * 6,
          scale: 1.05,
          opacity: 1,
        },
        {
          x: eaterPos.x - cardWidth.value / 2,
          y: eaterPos.y - cardHeight.value / 2,
          rotation: (Math.random() - 0.5) * 15,
          scale: 0.6,
          opacity: 0,
          duration: 0.52,
          delay: i * 0.05,
          ease: 'back.in(1.1)',
          onComplete: () => {
            activeCards.value = activeCards.value.filter((c) => c.id !== item.id)
          },
        }
      )
    }, 15)
  }
}

// 4. STOP AMBUSH SLAM ANIMATION (Ambusher Seat -> Prize Pile)
function animateStop(ev: CardFlightEvent) {
  const fromPos = getElementCenter(getSeatAnchorId(ev.seatIndex))
  const centerPos = getElementCenter('table-field-target')

  const item: FlightItem = {
    id: `stop-${nextFlightId++}`,
    rank: ev.rank,
    suit: ev.suit || '♠',
    joker: ev.joker,
    glow: 'rgba(225, 29, 72, 0.85)',
  }
  activeCards.value.push(item)

  setTimeout(() => {
    const el = document.getElementById(`flight-${item.id}`)
    if (!el) return

    gsap.fromTo(
      el,
      {
        x: fromPos.x - cardWidth.value / 2,
        y: fromPos.y - cardHeight.value / 2,
        rotation: -25,
        scale: 1.3,
        opacity: 0.9,
      },
      {
        x: centerPos.x - cardWidth.value / 2,
        y: centerPos.y - cardHeight.value / 2,
        rotation: 0,
        scale: 1.05,
        opacity: 1,
        duration: 0.3,
        ease: 'power4.in',
        onComplete: () => {
          gsap.to(el, {
            scale: 0.95,
            opacity: 0,
            duration: 0.35,
            delay: 0.1,
            onComplete: () => {
              activeCards.value = activeCards.value.filter((c) => c.id !== item.id)
            },
          })
        },
      }
    )
  }, 10)
}

// 5. FLIP CARD FROM DECK
function animateFlip(ev: CardFlightEvent) {
  const deckPos = getElementCenter('table-deck-source')
  const fieldPos = getElementCenter('table-field-target')

  const item: FlightItem = {
    id: `flip-${nextFlightId++}`,
    rank: ev.rank,
    suit: ev.suit || '♠',
    back: true,
    glow: 'rgba(245, 197, 66, 0.5)',
  }
  activeCards.value.push(item)

  setTimeout(() => {
    const el = document.getElementById(`flight-${item.id}`)
    if (!el) return

    gsap.fromTo(
      el,
      {
        x: deckPos.x - cardWidth.value / 2,
        y: deckPos.y - cardHeight.value / 2,
        rotationY: 0,
        scale: 0.9,
        opacity: 1,
      },
      {
        x: fieldPos.x - cardWidth.value / 2 + (Math.random() - 0.5) * 30,
        y: fieldPos.y - cardHeight.value / 2 + (Math.random() - 0.5) * 20,
        rotationY: 180,
        scale: 1,
        duration: 0.48,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(el, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
              activeCards.value = activeCards.value.filter((c) => c.id !== item.id)
            },
          })
        },
      }
    )
  }, 10)
}
</script>
