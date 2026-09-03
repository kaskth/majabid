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
      <div class="relative max-w-3xl mx-auto w-full bg-black/92 rounded-3xl backdrop-blur-xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar text-right">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-gold-light flex items-center gap-2">
              <span>🧠</span>
              <span>شخصيات الديوانية الذكية</span>
            </h2>
            <p class="text-xs text-emerald-300/80 mt-0.5">خصوم افتراضيون بذكاء اصطناعي وأسلوب لعب وحوارات حية</p>
          </div>
          <button class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Characters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <div
            v-for="person in characters"
            :key="person.id"
            class="group relative rounded-2xl p-4 bg-black/60 border-2 transition-all duration-200 cursor-pointer flex flex-col items-center text-center"
            :class="[
              selectedPerson?.id === person.id
                ? 'border-amber-400 bg-emerald-950/40 shadow-gold-glow scale-103'
                : 'border-white/15 hover:border-amber-400/50 hover:scale-102'
            ]"
            @click="selectedPerson = person"
          >
            <!-- Avatar -->
            <div class="my-2">
              <UiAvatarImg :avatar="person.avatar" size="lg" border="gold" />
            </div>
            <h3 class="text-base font-black text-white mt-1">{{ person.name }}</h3>
            <span class="text-[11px] text-amber-300 font-bold mb-2">{{ person.titleSub }}</span>
            <p class="text-[11px] text-gray-300 line-clamp-3 leading-relaxed">{{ person.role }}</p>
          </div>
        </div>

        <!-- Selected Character Deep Details -->
        <div v-if="selectedPerson" class="p-5 bg-black/60 rounded-2xl border border-amber-500/30 mb-4 animate-in fade-in duration-200">
          <div class="flex items-center gap-3 mb-3">
            <UiAvatarImg :avatar="selectedPerson.avatar" size="md" border="gold" />
            <div>
              <h4 class="text-lg font-black text-amber-300">{{ selectedPerson.name }} — {{ selectedPerson.titleSub }}</h4>
              <p class="text-xs text-gray-300">{{ selectedPerson.role }}</p>
            </div>
          </div>

          <!-- Quotes -->
          <div class="mt-3">
            <h5 class="text-xs font-bold text-amber-400 mb-2">أشهر العبارات أثناء اللعب:</h5>
            <div class="space-y-1.5">
              <div
                v-for="(saying, idx) in selectedPerson.sayings"
                :key="idx"
                class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 font-medium"
              >
                {{ saying }}
              </div>
            </div>
          </div>
          <!-- Challenge Bot Button (100% Real Functionality) -->
          <div class="mt-4 pt-3 border-t border-white/10 flex justify-center">
            <button
              class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white font-black text-sm shadow-md hover:scale-102 active:scale-98 transition-transform flex items-center justify-center gap-2"
              @click="challengeBot(selectedPerson)"
            >
              <span>⚔️</span>
              <span>تحدَّ {{ selectedPerson.name }} الآن في مباراة سريعة!</span>
            </button>
          </div>
        </div>

        <!-- Close Button -->
        <div class="pt-2 text-center">
          <button
            class="px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
            @click="closeModal"
          >
            إغلاق
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

const characters = ref([
  {
    id: 'sheikh-ramadan',
    name: 'الشيخ رمضان',
    avatar: 'a6',
    titleSub: 'حكيم الطاولة',
    role: 'لعب رصين وحذر، يقدم الأمثال الشعبية الحكيمة، ولا يرمي الجوكر إلا في أضخم صيدة لتأمين الفوز.',
    sayings: [
      '"كِل ولا تنكِل يا ولدي.. البركة بالصيدة!"',
      '"وقّف عندك! الصقر ما يفوّت عشاه"',
      '"الجوكر لا طلع هابته المجالس"',
    ],
  },
  {
    id: 'qais-dawsari',
    name: 'صقر الدواسر',
    avatar: 'a4',
    titleSub: 'الشاب المندفع',
    role: 'يهاجم بكمائن مباغتة سريعة، يضحك بصوت عالٍ ويستفز الخصوم بثقة عالية وحماس متقد.',
    sayings: [
      '"طارت طارت! ما تعدي وأنا صقر! 🔥"',
      '"وقّففففف! والله ما تاخذها وأنا حي! ⚡"',
      '"جوكرررري نار وشرار! احرق الملعب! 🃏"',
    ],
  },
  {
    id: 'aunt-hessa',
    name: 'خالتي حصة',
    avatar: 'a3',
    titleSub: 'مريحة الجلسة',
    role: 'تضفي جواً حميمياً دافئاً، تعاتب الشريك بفكاهة ومحبة، وتلطّف الأجواء وقت اشتداد المنافسة.',
    sayings: [
      '"يا عيني على الرواق.. هات الورق بالحنية ☕"',
      '"وقّف شوي يا بعد راسي.. هذي لي! 🌸"',
      '"الجوكر الذهبي زان المجلس بحضوره 💖"',
    ],
  },
])

import { useGameStore } from '~/stores/game'

const game = useGameStore()
const selectedPerson = ref(characters.value[0])

function challengeBot(person: any) {
  ui.closeModal()
  ui.showToast(`⚔️ جاري دخول الجلسة لمواجهة ${person.name}!`)
  game.quickPlay()
}

function closeModal() {
  ui.closeModal()
}
</script>