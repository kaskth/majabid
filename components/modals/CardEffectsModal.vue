<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="closeModal"
    >
      <div class="relative max-w-2xl mx-auto w-full bg-black/92 rounded-3xl backdrop-blur-xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar text-right">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-gold-light flex items-center gap-2">
              <span>✨</span>
              <span>أطقم الورق الملكية (مفعلة 100%)</span>
            </h2>
            <p class="text-xs text-emerald-300/80 mt-0.5">اختر طقمك المفضل، يتغير شكل كافة الكروت في اللعبة فورياً</p>
          </div>
          <button class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Decks Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            v-for="deck in luxuryDecks"
            :key="deck.id"
            class="group relative rounded-2xl p-4 bg-black/60 border-2 transition-all duration-200 cursor-pointer flex flex-col items-center text-center"
            :class="[
              ui.activeDeck === deck.id
                ? 'border-amber-400 bg-emerald-950/40 shadow-gold-glow scale-102 ring-2 ring-amber-400/50'
                : 'border-white/15 hover:border-amber-400/50 hover:scale-101'
            ]"
            @click="selectDeck(deck.id)"
          >
            <!-- Live Realistic Card Back Visual -->
            <div class="w-16 h-22 rounded-[6px] overflow-hidden shadow-xl my-2">
              <GameCard :back="true" :deck="deck.id" />
            </div>
            <h3 class="text-base font-black text-white mt-1">{{ deck.name }}</h3>
            <p class="text-[11px] text-gray-300 mt-1 leading-relaxed">{{ deck.description }}</p>
            <span
              class="text-[10px] px-3 py-0.5 rounded-full mt-3 font-bold"
              :class="ui.activeDeck === deck.id ? 'bg-amber-500 text-black font-black' : 'bg-white/10 text-gray-400'"
            >
              {{ ui.activeDeck === deck.id ? 'الطقم المفعّل ✅' : 'تفعيل الطقم' }}
            </span>
          </div>
        </div>

        <!-- Features Note -->
        <div class="p-4 bg-black/50 rounded-2xl border border-white/10 text-xs text-gray-300 leading-relaxed mb-6">
          <b class="text-amber-400 block mb-1">💡 ميزات أطقم مجابيد:</b>
          كافة البطاقات مرسومة بمتجهات SVG كازينو دقيقة وفائقة الخفة مع زوايا كلاسيكية مصقولة، تنعكس فوراً على رزمة الميدان وأوراق يدك وكروت الخصوم.
        </div>

        <!-- Close Button -->
        <div class="text-center">
          <button
            class="px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
            @click="closeModal"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useUiStore, type DeckType } from '~/stores/ui'

const ui = useUiStore()

const luxuryDecks: { id: DeckType; name: string; description: string }[] = [
  {
    id: 'gold',
    name: 'طقم الذهب الخالص ✨',
    description: 'زخرفة إسلامية مذهبة مع إطار ملكي وهالة خضراء براقة.',
  },
  {
    id: 'emerald',
    name: 'الزمرد والسدو 🌿',
    description: 'نقوش سدو هندسية وألوان زمردية عتيقة تعكس أصالة البادية.',
  },
  {
    id: 'heritage',
    name: 'سيف ونخلة (التراث) 🗡️',
    description: 'مخمل أحمر قرمزي ناصع مع شعار السيفين والنخلة الذهبي الأصيل.',
  },
  {
    id: 'royal',
    name: 'الكحلي الملكي 👑',
    description: 'زرقة ليلية ملكية مع نجوم فضية مشعة وإطار بلاتيني رفيع.',
  },
]

function selectDeck(id: DeckType) {
  ui.setDeck(id)
}

function closeModal() {
  ui.closeModal()
}
</script>