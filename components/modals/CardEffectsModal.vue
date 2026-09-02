<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" @click.self="closeModal">
      <div class="relative top-20 max-w-2xl mx-auto w-full bg-black/90 rounded-3xl backdrop-blur-lg border border-gold/30 shadow-gold-glow p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl sm:text-3xl font-black text-gold-light">أشجار الذهب والشiders</h2>
          <button class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 transition-transform" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Holographic Foil Section -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-amber-300 mb-3">هولوغراف foil</h3>
          <p class="text-sm text-gray-300 mb-4">
            بطاقات بأعلى معايير الشيدر الضوئي - عندما تميل الهاتف أو تحريك الماوس، تتغير زاوية انعكاس الضوء كنقود 진짜 ذهبية
          </p>

          <!-- Gold Deck Showcase -->
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="skin in goldSkins"
              :key="skin.name"
              class="relative rounded-xl overflow-hidden cursor-pointer hover:shadow-gold-glow transition"
              @click="applySkin(skin)"
            >
              <div class="aspect-square">
                <img
                  :src="skin.preview"
                  class="w-full h-full rounded-xl object-cover transition-transform duration-300"
                  :style="{
                    transform: `scale(${isSelectedSkin(skin) ? 1.05 : 1}) rotate(${isSelectedSkin(skin) ? 2 : 0}deg)`,
                    boxShadow: isSelectedSkin(skin) ? '0 0 25px rgba(245, 197, 66, 0.5)' : 'none'
                  }"
                />
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-2">
                <p class="text-[9px] font-black text-amber-200">{{ skin.name }}</p>
                <p class="text-[8px] text-amber-300/70">شider ذهبي</p>
              </div>
            </div>
          </div>

          <!-- Dynamic Shader Demo -->
          <div class="mt-4 p-3 bg-black/50 rounded-xl">
            <p class="text-[10px] text-gray-300 mb-2">معاينة الشider على الورقة:</p>
            <div
              class="relative w-24 h-36 rounded-xl overflow-hidden border border-amber-500/20"
              :style="{
                background: selectedSkin?.gradient || 'linear-gradient(135deg, #fff6cf 0%, #ffd75e 100%)',
                transform: `rotateY(${hologramRotation}deg) rotateX(${hologramTilt}deg)`
              }"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-gold/30 via-transparent to-gold/20"
              />
              <div
                class="absolute top-0 left-0 right-0 h-6 bg-amber-400/30"
                :style="{ width: `${hologramWidth}%` }"
              />
              <svg
                class="absolute bottom-0 left-0 right-0 p-1"
                viewBox="0 0 100 140"
                style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
              >
                <!-- Simple card pip -->
                <circle cx="50" cy="70" r="5" fill="currentColor"/>
                <text x="50" y="115" font-size="8" fill="currentColor" text-anchor="middle">🂡</text>
              </svg>
            </div>
            <p class="text-[9px] mt-2 text-amber-300">زاوية الدوران: {{ hologramRotation }}°</p>
            <input
              type="range"
              min="0"
              max="45"
              v-model="hologramRotation"
              class="w-full mt-2 accent-amber-500"
              @input="updateHologram"
            />
          </div>
        </div>

        <!-- Luxury Deck Skins -->
        <div>
          <h3 class="text-lg font-bold text-amber-300 mb-3">طقمdeck Skins</h3>
          <p class="text-sm text-gray-300 mb-4">اطلب تخصيص طقمك الملكي من بين الخيارات التالية:</p>

          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="deck in luxuryDecks"
              :key="deck.id"
              class="group relative rounded-xl overflow-hidden cursor-pointer hover:shadow-gold-glow transition"
              @click="selectDeck(deck)"
            >
              <div class="aspect-square">
                <img
                  :src="deck.preview"
                  class="w-full h-full rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                  :style="{
                    filter: deck.shader ? 'drop-shadow(0 0 20px ' + deck.shader.color + ')' : 'none'
                  }"
                />
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-2">
                <p class="text-[9px] font-black text-amber-200">{{ deck.name }}</p>
                <p class="text-[8px] text-gray-300/60">{{ deck.year }}</p>
              </div>
            </div>
          </div>

          <!-- Custom Deck Studio Link -->
          <div class="mt-4 p-3 bg-black/50 rounded-xl text-center">
            <p class="text-[10px] text-gray-300 mb-2">استوديو صناع المحتوى</p>
            <button
              class="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-medium hover:scale-105 transition-transform"
            >
              تصميم طقمي الخاص
            </button>
          </div>
        </div>

        <!-- Shader Physics Demo -->
        <div class="mt-6 p-4 bg-black/50 rounded-xl">
          <h3 class="text-lg font-bold text-amber-300 mb-2">فيزياء الشider</h3>
          <p class="text-[10px] text-gray-300 mb-3">التفاعل مع الورقة:</p>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="angle in [0, 30, 60, 90]"
              :key="angle"
              class="relative rounded-xl border border-amber-500/20 p-2 text-center"
              :style="{ background: `linear-gradient(${angle}deg, #1d2b4f, #0e2c1a)` }"
            >
              <span class="text-[9px] text-amber-300 font-medium">{{ angle }}°</span>
            </div>
          </div>
          <p class="text-[9px] mt-3 text-gray-400">كل درجة تنتج تأثير بريق مختلف - من الوهج الخفيف إلى الومضة الذهبية الكاملة</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

const goldSkins = ref([
  { name: 'ذهب كلاسيكي', preview: '/cards/gold-classic.jpg', gradient: 'linear-gradient(135deg, #fff6cf 0%, #ffd75e 50%, #ffd75e 100%)' },
  { name: 'ذهب حديث', preview: '/cards/gold-modern.jpg', gradient: 'linear-gradient(135deg, #ffe6b8 0%, #ffd75e 100%)' },
  { name: 'ذهب ماسي', preview: '/cards/gold-diamond.jpg', gradient: 'linear-gradient(135deg, #e0e7ff 0%, #ffd75e 100%)' }
])

const luxuryDecks = ref([
  { id: 'gold-solid', name: 'طقم الذهب الخالص', year: '2024', preview: '/decks/gold-solid.jpg', shader: { color: '#ffd75e' } },
  { id: 'emerald-turquoise', name: 'طقم الفيروز والزمرد', year: '2024', preview: '/decks/emerald-turquoise.jpg', shader: { color: '#00e5ff' } },
  { id: 'arabic-emblem', name: 'طقم السيفين والنخلة', year: '2024', preview: '/decks/arabic-emblem.jpg', shader: { color: '#b8860b' } }
])

const selectedSkin = ref(null)
const hologramRotation = ref(0)
const hologramTilt = ref(0)
const hologramWidth = ref(30)

function applySkin(skin: any) {
  selectedSkin.value = skin
  // Apply skin to game
  console.log('Applied skin:', skin)
}

function isSelectedSkin(skin: any): boolean {
  return selectedSkin.value === skin
}

function selectDeck(deck: any) {
  selectedSkin.value = deck
  closeModal()
  console.log('Selected deck:', deck)
}

function closeModal() {
  selectedSkin.value = null
  hologramRotation.value = 0
  hologramTilt.value = 0
  ui.closeModal()
}
</script>

<style scoped>
/* Shader rotation animation */
@keyframes shader-rotate {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

/* Grid item hover */
.grid-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Preview image transition */
.preview-img {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>