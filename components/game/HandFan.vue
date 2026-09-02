<template>
  <div class="relative w-full max-w-4xl mx-auto h-36 sm:h-44 flex items-end justify-center select-none px-4">
    <!-- Hand Hint / Selected info -->
    <div
      v-if="hintText"
      class="absolute -top-7 px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md transition-all duration-200"
      :class="isWarning ? 'bg-red-500/90 text-white border border-red-300 animate-pulse' : 'bg-black/70 text-gold-light border border-gold/30'"
    >
      {{ hintText }}
    </div>

    <!-- Cards Container -->
    <div ref="containerRef" class="relative w-full h-full flex items-end justify-center">
      <div
        v-for="(card, index) in cards"
        :key="card.id || index"
        class="absolute bottom-0 w-16 sm:w-20 md:w-24 transition-all duration-300 transform-gpu origin-bottom cursor-pointer"
        :style="getCardStyle(index, cards.length)"
        @click="selectCard(card.id!)"
      >
        <GameCard
          :rank="card.r"
          :suit="card.s"
          :joker="card.j"
          :is-selected="game.selectedCardId === card.id"
          :is-playable="isCardPlayable(card.id!)"
          :is-dimmed="isCardDimmed(card.id!)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

const game = useGameStore()
const audio = useAudioStore()
const containerRef = ref<HTMLElement | null>(null)

const cards = computed(() => game.myHand)

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

function getCardStyle(index: number, total: number) {
  if (total === 0) return {}
  const mid = (total - 1) / 2
  const offset = index - mid
  const spacing = Math.min(38, Math.max(16, 420 / total))
  const x = offset * spacing
  const rot = offset * (total > 8 ? 2.8 : 4)
  const y = Math.pow(Math.abs(offset), 1.6) * (total > 8 ? 2.2 : 3)
  const isSel = game.selectedCardId === cards.value[index]?.id

  return {
    transform: `translateX(${x}px) translateY(${isSel ? y - 18 : y}px) rotate(${rot}deg) scale(${isSel ? 1.08 : 1})`,
    zIndex: isSel ? 40 : 10 + index,
  }
}

const isWarning = computed(() => {
  return game.myOptions.mustEat || (game.phase === 'stop' && game.canStop)
})

const hintText = computed(() => {
  if (game.phase === 'end') return 'انتهت الجولة — النتائج مكشوفة 🏆'
  if (game.isSpec) return ''
  if (game.phase === 'stop') {
    if (game.canStop) return '⛔ عندك الورقة — اضغط «وقّف!» للكمين!'
    if (game.pending?.owner === game.mySeat) return '🍽️ أكلتك في الهواء... ترقّب ثواني الكمين'
    return '⏳ نافذة «وقّف!» — من عنده نفس الرقم أو جوكر يخطفها'
  }
  if (!game.isMyTurn) {
    const turnSeat = game.seats[game.turn]
    return `⏳ دور: ${turnSeat?.name || `لاعب ${game.turn + 1}`}`
  }
  if (game.myOptions.mustEat) return '⚠️ كل أوراقك تأكل — الأكل إجباري!'
  const sel = game.myHand.find(c => c.id === game.selectedCardId)
  if (!sel) return 'اختر ورقة من يدك للعب'
  if (sel.j) return '🃏 جوكر مذهّب — يخترق أي رقم!'
  return `الورقة المحددة: ${sel.r} ${sel.s}`
})
</script>
