<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
    <div class="relative w-full max-w-xl p-6 rounded-3xl bg-[#0e2319] border border-amber-500/40 shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto no-scrollbar text-center">
      <h2 class="text-2xl sm:text-3xl font-black text-gold-light mb-1 flex items-center gap-2">
        <span>🛍️</span>
        <span>متجر مجابيد الملكي</span>
      </h2>
      <p class="text-xs text-emerald-300/80 mb-4">
        خصّص بيئة مجلسك، طقم الورق، وشخصيتك الملكية
      </p>

      <!-- Category Tabs -->
      <div class="w-full grid grid-cols-2 gap-2 mb-4 p-1 rounded-2xl bg-black/50 border border-white/10">
        <button
          class="py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeCategory === 'atmospheres' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-gray-300 hover:text-white'"
          @click="activeCategory = 'atmospheres'"
        >
          🏛️ بيئات المجالس
        </button>
        <button
          class="py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeCategory === 'decks' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-gray-300 hover:text-white'"
          @click="activeCategory = 'decks'"
        >
          ✨ أطقم الورق
        </button>
      </div>

      <!-- Tab 1: Atmospheres -->
      <div v-if="activeCategory === 'atmospheres'" class="grid grid-cols-2 gap-3 w-full my-2">
        <div
          v-for="th in atmospheres"
          :key="th.id"
          class="p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200"
          :class="[
            ui.theme === th.id
              ? 'border-amber-400 bg-black/70 shadow-gold-glow scale-102 ring-2 ring-amber-400/50'
              : 'border-white/10 bg-black/30 hover:border-white/30'
          ]"
          @click="ui.setTheme(th.id)"
        >
          <span class="text-3xl">{{ th.icon }}</span>
          <b class="text-sm text-white font-black">{{ th.name }}</b>
          <span class="text-[11px] text-gray-300">{{ th.desc }}</span>
          <span
            class="text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold"
            :class="ui.theme === th.id ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'"
          >
            {{ ui.theme === th.id ? 'مُفعّل ✅' : 'اختيار' }}
          </span>
        </div>
      </div>

      <!-- Tab 2: Luxury Decks -->
      <div v-else class="grid grid-cols-2 gap-3 w-full my-2">
        <div
          v-for="deck in decks"
          :key="deck.id"
          class="p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200"
          :class="[
            selectedDeck === deck.id
              ? 'border-amber-400 bg-black/70 shadow-gold-glow scale-102 ring-2 ring-amber-400/50'
              : 'border-white/10 bg-black/30 hover:border-white/30'
          ]"
          @click="selectDeck(deck.id)"
        >
          <!-- Mini Card Back Preview -->
          <div class="w-12 h-16 rounded-lg overflow-hidden shadow-md my-1">
            <GameCard :back="true" />
          </div>
          <b class="text-sm text-white font-black">{{ deck.name }}</b>
          <span class="text-[11px] text-gray-300">{{ deck.desc }}</span>
          <span
            class="text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold"
            :class="selectedDeck === deck.id ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'"
          >
            {{ selectedDeck === deck.id ? 'مُفعّل ✅' : 'اختيار' }}
          </span>
        </div>
      </div>

      <!-- Close / Confirm Button -->
      <button
        class="mt-6 px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
        @click="ui.closeModal"
      >
        حفظ وإغلاق
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
const activeCategory = ref<'atmospheres' | 'decks'>('atmospheres')
const selectedDeck = ref(typeof window !== 'undefined' ? localStorage.getItem('majabid.deck') || 'gold' : 'gold')

const atmospheres = [
  {
    id: 1,
    name: 'مجلس نجد الملكي',
    desc: 'سجاد زمردي وفوانيس ذهبية متأرجحة',
    icon: '🏛️',
  },
  {
    id: 2,
    name: 'مخيم الصمان الليلي',
    desc: 'سماء مرصعة بالشهب ونار المخيم الدافئة',
    icon: '⛺',
  },
  {
    id: 3,
    name: 'سكاي روف دبي VIP',
    desc: 'أضواء نيون عصرية وطاولة زجاجية شفافة',
    icon: '🌃',
  },
  {
    id: 4,
    name: 'قهوة البلد الحجازية',
    desc: 'رواشين خشبية تراثية وفناجين شاي ساخنة',
    icon: '☕',
  },
]

const decks = [
  {
    id: 'gold',
    name: 'طقم الذهب الخالص',
    desc: 'زخرفة إسلامية مذهبة مع إطار ملكي',
  },
  {
    id: 'emerald',
    name: 'الزمرد والفيروز',
    desc: 'ألوان ملكية عتيقة ونقوش دقيقة',
  },
  {
    id: 'saif',
    name: 'سيف ونخلة',
    desc: 'طراز تراثي وطني فخم للأرينا',
  },
  {
    id: 'classic',
    name: 'الكلاسيكي الفاخر',
    desc: 'جوكر الكازينو وأوراق البطولات',
  },
]

function selectDeck(id: string) {
  selectedDeck.value = id
  if (typeof window !== 'undefined') {
    localStorage.setItem('majabid.deck', id)
  }
  ui.showToast('تم تفعيل طقم الورق ✨')
}
</script>
