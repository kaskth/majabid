<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none" @click.self="closeModal">
      <div class="relative max-w-2xl mx-auto w-full bg-black/92 rounded-3xl backdrop-blur-xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar text-right">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-gold-light flex items-center gap-2">
              <span>✨</span>
              <span>أطقم الورق والمؤثرات الملكية</span>
            </h2>
            <p class="text-xs text-emerald-300/80 mt-0.5">اختر طقم ورق اللعب المفضل لجلساتك</p>
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
              activeDeckId === deck.id
                ? 'border-amber-400 bg-emerald-950/40 shadow-gold-glow scale-102 ring-2 ring-amber-400/50'
                : 'border-white/15 hover:border-amber-400/50 hover:scale-101'
            ]"
            @click="selectDeck(deck.id)"
          >
            <!-- Card Back Visual -->
            <div class="w-16 h-22 rounded-xl overflow-hidden shadow-lg my-2">
              <GameCard :back="true" />
            </div>
            <h3 class="text-base font-black text-white mt-1">{{ deck.name }}</h3>
            <p class="text-[11px] text-gray-300 mt-1 leading-relaxed">{{ deck.description }}</p>
            <span
              class="text-[10px] px-3 py-0.5 rounded-full mt-3 font-bold"
              :class="activeDeckId === deck.id ? 'bg-amber-500 text-black font-black' : 'bg-white/10 text-gray-400'"
            >
              {{ activeDeckId === deck.id ? 'الطقم المفعّل ✅' : 'تفعيل الطقم' }}
            </span>
          </div>
        </div>

        <!-- Features Note -->
        <div class="p-4 bg-black/50 rounded-2xl border border-white/10 text-xs text-gray-300 leading-relaxed mb-6">
          <b class="text-amber-400 block mb-1">💡 ميزات أطقم مجابيد:</b>
          كافة البطاقات مرسومة بمتجهات SVG فائقة الدقة لتضمن سرعة استجابة فائقة وخفة تامة دون تحميل ملفات ثقيلة، مع توهج ملكي وحركة سلسة أثناء اللعب.
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
import { ref } from 'vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

const activeDeckId = ref(
  typeof window !== 'undefined' ? localStorage.getItem('majabid.deck') || 'gold-solid' : 'gold-solid'
)

const luxuryDecks = [
  {
    id: 'gold-solid',
    name: 'طقم الذهب الخالص',
    description: 'زخرفة إسلامية مذهبة مع إطار ملكي وهالة ذهبية براقة.',
  },
  {
    id: 'emerald-royal',
    name: 'الزمرد والفيروز',
    description: 'ألوان ملكية عتيقة ونقوش سدو نجدية محفورة بدقة.',
  },
  {
    id: 'saif-nakhlah',
    name: 'سيف ونخلة',
    description: 'طراز تراثي وطني أصيل يعكس فخامة المجالس العربية.',
  },
  {
    id: 'classic-pro',
    name: 'الكلاسيكي الفاخر',
    description: 'الأوراق الرسمية لبطولات مجابيد مع وضوح فائق للرموز والأرقام.',
  },
]

function selectDeck(id: string) {
  activeDeckId.value = id
  if (typeof window !== 'undefined') {
    localStorage.setItem('majabid.deck', id)
  }
  ui.showToast('تم تفعيل طقم الورق الملكي ✨')
}

function closeModal() {
  ui.closeModal()
}
</script>