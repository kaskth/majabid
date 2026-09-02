<template>
  <div class="relative">
    <button
      class="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 shadow-md flex items-center justify-center text-lg"
      title="المحادثة السريعة"
      @click="isOpen = !isOpen"
    >
      💬
    </button>

    <!-- Dropdown / Popup -->
    <Transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="scale-90 opacity-0 -translate-y-2"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-90 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-12 z-50 w-64 p-2.5 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col gap-1.5"
      >
        <div class="text-xs font-bold text-gray-400 px-2 py-1 border-b border-white/10">
          عبارات سريعة
        </div>
        <button
          v-for="phrase in CHAT_PHRASES"
          :key="phrase"
          class="w-full text-right px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-white hover:bg-white/15 transition-colors"
          @click="sendPhrase(phrase)"
        >
          {{ phrase }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAudioStore } from '~/stores/audio'

const game = useGameStore()
const audio = useAudioStore()
const isOpen = ref(false)

const CHAT_PHRASES = [
  'جنب وراك! ما تاخذها وأنا موجود!',
  'أتحداك تاخذها! 😎',
  'بيّض الله وجهك يا الذيب!',
  'سرّع اللعب يا غالي!',
  'صحصح يا خوي!',
  'السلام عليكم... وعليكم السلام!',
  '😂😂😂',
  'يلا نلعب!',
  '📣 جاوبني!',
]

function sendPhrase(phrase: string) {
  audio.sfx.chat()
  game.sendChat(phrase)
  isOpen.value = false
}
</script>
