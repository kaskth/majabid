<template>
  <Transition
    enter-active-class "transition duration-500 ease-out"
    enter-from-class "opacity-0 scale-95"
    enter-to-class "opacity-100 scale-100"
    leave-active-class "transition duration-300 ease-in"
    leave-from-class "opacity-100 scale-100"
    leave-to-class "opacity-0 scale-95"
  >
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" @click.self="closeModal">
      <div class="relative top-20 max-w-4xl mx-auto w-full bg-black/90 rounded-3xl backdrop-blur-lg border border-gold/30 shadow-gold-glow p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl sm:text-3xl font-black text-gold-light">شخصيات الديوانية بالذكاء الاصطناعي</h2>
          <button class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 transition-transform" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Characters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <!-- Sheikh Ramadan -->
          <div
            v-for="person in characters"
            :key="person.id"
            class="group relative rounded-2xl p-4 bg-black/60 backdrop-blur border border-gold/30 hover:border-amber-500/50 hover:shadow-gold-glow transition-all duration-300 cursor-pointer"
            @click="selectPerson(person)"
          >
            <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h1v4h1v4a2 2 0 002 2h1a2 2 0 002-2v-4h1v4H15a2 2 0 00-2-2V4a2 2 0 00-2 2h1v4H8a2 2 0 00-2 2v4H5a2 2 0 00-2 2v4H4a2 2 0 00-2 2v1a2 2 0 002 2h1a2 2 0 002-2v-4h-1m1-4h1v4H8a2 2 0 00-2-2V4a2 2 0 00-2-2h1v4H3a2 2 0 00-2 2v4H2a2 2 0 00-2 2v4H2a2 2 0 00-2 2v1a2 2 0 002 2h1a2 2 0 002-2v-4z"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="text-sm font-black text-white text-center mb-1">{{ person.title }}</h3>
            <p class="text-[9px] text-gray-300 text-center line-clamp-2">{{ person.description }}</p>
          </div>

          <!-- Qais al-Dawsari -->
          <!-- Aunt Hessa -->
        </div>

        <!-- Character Details -->
        <div v-if="selectedPerson" class="mt-6 p-4 bg-black/50 rounded-xl backdrop-blur">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <svg class="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h1v4h1v4a2 2 0 002 2h1a2 2 0 002-2v-4h1v4a2 2 0 002 2v4H15a2 2 0 00-2-2V4a2 2 0 00-2 2h1v4H8a2 2 0 00-2-2V4a2 2 0 00-2-2h1v4H3a2 2 0 00-2-2v4H2a2 2 0 00-2-2v4H2a2 2 0 00-2-2v4H2a2 2 0 00-2-2v1a2 2 0 002 2h1a2 2 0 002-2v-4zm14 6v4a2 2 0 01-2 2h-1m-4 4v4a2 2 0 01-2-2h-1m4-4v-4a2 2 0 012-2h1m-4-4v-4a2 2 0 012-2h1m4 4v4a2 2 0 012-2h1m-4 4v4a2 2 0 01-2 2h-1"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-black text-gold-light">{{ selectedPerson.title }}</h3>
              <p class="text-sm text-gray-300">{{ selectedPerson.titleSub }}</p>
            </div>
          </div>

          <!-- Character Sayings -->
          <div>
            <h4 class="text-[10px] font-bold text-amber-300 mb-3">أقوال مشهورة:</h4>
            <div v-for="(saying, index) in selectedPerson.sayings" :key="index" class="p-3 bg-black/50 rounded-xl mb-2">
              <p class="text-[11px] text-white font-medium line-clamp-2">{{ saying }}</p>
              <p class="text-[9px] text-amber-300 text-right mt-1">— {{ selectedPerson.name }}</p>
            </div>
          </div>

          <!-- Role Description -->
          <p class="text-[10px] text-gray-300 mt-4 line-clamp-3">
            {{ selectedPerson.role }}
          </p>

          <!-- Close Button -->
          <div class="mt-4 pt-4 border-t border-white/10">
            <button
              class="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-medium hover:scale-105 transition-transform"
              @click="closeModal"
            >
             _close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const characters = ref([
  {
    id: 'sheikh-ramadan',
    name: 'الشيخ رمضان',
    title: 'الشيخ رمضان',
    titleSub: 'حكيم الطاولة',
    role: 'يقدم المشورة والأمثال الشعبية الحكيمة durante اللعب، ولا يرمي الجوكر إلا في أضخم صيدة، صوته الهادئ يهدئ العواطف',
    sayings: [
      '"والله إن الورقة دي كيلة .. كِل ولا تنكِل"',
      '"اللهم إني استودعتكDeck، فاحفظه كما حفظتني في المجالس"',
      '"لا ترمِ إلا وأنا صقر، وإلاintegerن عليك الطعن"'
    ]
  },
  {
    id: 'qais-dawsari',
    name: 'صقر الدواسر',
    title: 'صقر الدواسر',
    titleSub: 'الشاب المندفع',
    role: 'يهاجم بكمائن مباغتة، يضحك بصوت عالٍ ويستفز الخصوم بثقة عالية ("والله ماعدي وأنا صقر!")، يضاعف من وتيرة اللعب',
    sayings: [
      '"والله ما أصدق ما أرى، أنا صقر هذا المساء!"',
      '"رقمك دهMine .. ياريس، retracted ترميهاش!"',
      '"أنا ما أخافش الورق، أنا أخاف القرش لكنك!"'
    ]
  },
  {
    id: 'aunt-hessa',
    title: 'خالتي حصة',
    title: 'خالتي حصة',
    titleSub: 'مريحة الجلسة',
    role: 'تعاتب الشريك إذا كشف جبيده بفكاهة ("وين رايح بورقتك يا ولدي؟)، تضيف جوًا حميميًا وتخفف التوتر',
    sayings: [
      '"وين رايح بورقتك يا ولدي؟ الحديقة مش عندها غيرك!"',
      '"الجوكر مش gioc يهبل، احترسه كويس!"',
      '"جلسه حلوة كحلّك، ما تنكِلش'"'
    ]
  }
])

const selectedPerson = ref(null)

function selectPerson(person: any) {
  selectedPerson.value = person
  // In full implementation, this person's AI would interact during gameplay
  console.log('Selected person:', person)
  closeModal()
}

function closeModal() {
  selectedPerson.value = null
}
</script>

<style scoped>
/* Character card hover */
.character-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.character-card:hover {
  transform: translateY(-2px);
  border-color: #ffb933;
  box-shadow: 0 8px 25px rgba(255, 185, 51, 0.2);
}
</style>