<template>
  <div class="relative w-full max-w-4xl mx-auto h-26 sm:h-36 landscape:h-20 flex items-end justify-center select-none px-2 sm:px-4">
    <!-- Cards Hand Fan Container -->
    <div
      ref="containerRef"
      class="relative w-full h-full flex items-end justify-center overflow-visible"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div
        v-for="(card, index) in cards"
        :key="card.id || index"
        class="absolute bottom-0 w-11 sm:w-16 md:w-20 landscape:w-9 landscape:sm:w-12 transition-all duration-300 transform-gpu origin-bottom cursor-pointer touch-manipulation"
        :style="getCardStyle(index, cards.length, card.id)"
        @click="onCardClick(card.id!)"
      >
        <GameCard
          :rank="card.r"
          :suit="card.s"
          :joker="card.j"
          :is-selected="game.selectedCardId === card.id"
          :is-playable="isCardPlayable(card.id!)"
          :is-dimmed="isCardDimmed(card.id!)"
        />

        <!-- Visual Eat Callout Badge on Card -->
        <span
          v-if="game.isMyTurn && hasEats(card.id!)"
          class="absolute -top-2.5 right-0 px-1 py-0.2 rounded-full text-[8px] font-black bg-emerald-500 text-black shadow-lg z-30 animate-pulse flex items-center gap-0.5"
          title="هذه الورقة يمكنها الأكل!"
        >
          <span>🍽️</span>
          <span class="hidden sm:inline">أكل</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

const game = useGameStore()
const audio = useAudioStore()
const containerRef = ref<HTMLElement | null>(null)
const flyingCardId = ref<string | null>(null)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 400)

function updateDimensions() {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}

const cards = computed(() => game.myHand)

function hasEats(cardId: string): boolean {
  const o = game.myOptions.cards[cardId]
  return !!(o && o.eats && o.eats.length > 0)
}

function isCardPlayable(cardId: string) {
  if (!game.isMyTurn) return false
  const o = game.myOptions.cards[cardId]
  return o && ((o.eats && o.eats.length > 0) || o.discard)
}

function isCardDimmed(cardId: string) {
  if (!game.isMyTurn) return false
  const o = game.myOptions.cards[cardId]
  return o && !o.eats?.length && !o.discard
}

function selectCard(cardId: string) {
  audio.sfx.pick()
  game.selectedCardId = cardId
}

function onCardClick(cardId: string) {
  if (game.selectedCardId === cardId && game.isMyTurn) {
    quickPlayCard(cardId)
  } else {
    selectCard(cardId)
  }
}

function quickPlayCard(cardId: string) {
  if (!game.isMyTurn) return
  const o = game.myOptions.cards[cardId]
  if (!o) return

  flyingCardId.value = cardId
  setTimeout(() => { flyingCardId.value = null }, 350)

  if (o.eats && o.eats.length > 0) {
    audio.sfx.eat()
    audio.sfx.slide()
    game.playCard('eat', cardId, o.eats[0])
  } else if (o.discard) {
    audio.sfx.discard()
    audio.sfx.slide()
    game.playCard('discard', cardId)
  }
}

function getCardStyle(index: number, total: number, cardId?: string) {
  if (total === 0) return {}
  const mid = (total - 1) / 2
  const offset = index - mid
  const isMobile = windowWidth.value < 640

  // Dynamically bound total span so cards NEVER exceed screen edges
  const maxSpan = isMobile ? Math.max(220, windowWidth.value - 64) : Math.min(windowWidth.value * 0.8, 520)
  const maxSingleStep = isMobile ? 24 : 36
  const spacing = total > 1 ? Math.min(maxSingleStep, maxSpan / (total - 1)) : 0

  const x = offset * spacing
  const rot = offset * (isMobile ? (total > 8 ? 1.8 : 2.5) : (total > 8 ? 2.8 : 4))
  const y = Math.pow(Math.abs(offset), 1.4) * (isMobile ? 1.2 : 2.2)
  const isSel = game.selectedCardId === cardId
  const isFlying = flyingCardId.value === cardId

  if (isFlying) {
    return {
      transform: `translateX(${x}px) translateY(-140px) rotate(0deg) scale(0.85)`,
      opacity: '0',
      transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
      zIndex: 60,
    }
  }

  return {
    transform: `translateX(${x}px) translateY(${isSel ? y - 18 : y}px) rotate(${rot}deg) scale(${isSel ? 1.12 : 1})`,
    zIndex: isSel ? 45 : 10 + index,
  }
}

const isWarning = computed(() => {
  return game.myOptions.mustEat || (game.phase === 'stop' && game.canStop)
})

const hintText = computed(() => {
  if (game.phase === 'end') return 'انتهت الجولة — تفقد النتائج 🏆'
  if (game.isSpec) return ''
  if (game.phase === 'stop') {
    if (game.canStop) return '⛔ عندك الورقة — اضغط «وقّف!» للكمين!'
    if (game.pending?.owner === game.mySeat) return '🍽️ أكلتك في الهواء... ترقّب ثواني الكمين'
    return '⏳ نافذة «وقّف!» — من يملك الرقم أو الجوكر يخطفها'
  }
  if (!game.isMyTurn) {
    const turnSeat = game.seats[game.turn]
    return `⏳ دور: ${turnSeat?.name || `لاعب ${game.turn + 1}`}`
  }
  if (game.myOptions.mustEat) return '⚠️ الأكل إجباري في هذا الدور!'
  const sel = game.myHand.find((c) => c.id === game.selectedCardId)
  if (!sel) return 'اختر ورقة من يدك (أو انقر نقرتين للعب المباشر)'
  if (sel.j) return '🃏 جوكر مذهّب — يكسر أي رقم!'
  return `الورقة المحددة: ${sel.r} ${sel.s}`
})

// Mobile Swipe-Up Gesture Support
let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const deltaY = touchStartY - e.changedTouches[0].clientY
  if (deltaY > 40 && game.selectedCardId && game.isMyTurn) {
    quickPlayCard(game.selectedCardId)
  }
}

// Keyboard Shortcuts Listener
function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

  // Space for Pass
  if (e.code === 'Space') {
    e.preventDefault()
    if (game.isMyTurn && !game.myOptions.mustEat) {
      game.playCard('pass')
    }
  }

  // Enter for Stop Ambush
  if (e.code === 'Enter') {
    if (game.phase === 'stop' && game.canStop) {
      const match = game.myHand.find((c) => c.j || c.r === game.pending?.rank)
      if (match) {
        audio.sfx.stop()
        game.playCard('stop', match.id)
      }
    }
  }

  // Numbers 1-9 for card selection
  const num = parseInt(e.key, 10)
  if (!isNaN(num) && num >= 1 && num <= cards.value.length) {
    selectCard(cards.value[num - 1].id!)
  }

  // Arrow Keys Navigation
  if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
    const curIdx = cards.value.findIndex((c) => c.id === game.selectedCardId)
    const nextIdx = e.code === 'ArrowLeft'
      ? Math.min(cards.value.length - 1, (curIdx >= 0 ? curIdx + 1 : 0))
      : Math.max(0, (curIdx >= 0 ? curIdx - 1 : cards.value.length - 1))
    if (cards.value[nextIdx]) {
      selectCard(cards.value[nextIdx].id!)
    }
  }

  // ArrowUp for Play
  if (e.code === 'ArrowUp' && game.selectedCardId && game.isMyTurn) {
    e.preventDefault()
    quickPlayCard(game.selectedCardId)
  }
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
  window.removeEventListener('keydown', onKeyDown)
})
</script>
