<template>
  <Transition
    enter-active-class "transition duration-500 ease-out"
    enter-from-class "opacity-0 scale-95"
    enter-to-class "opacity-100 scale-100"
    leave-active-class "transition duration-300 ease-in"
    leave-from-class "opacity-100 scale-100"
    leave-to-class "opacity-0 scale-95"
  >
    <div
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
      @click.self="closeModal"
    >
      <div
        class="relative top-20 max-w-4xl mx-auto w-full bg-black/90 rounded-3xl backdrop-blur-lg border border-gold/30 shadow-gold-glow p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl sm:text-3xl font-black text-gold-light">بيئات المجالس الحية</h2>
          <button
            class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 transition-transform"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <!-- Environment Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Royal Najd Majlis -->
          <div
            v-for="env in environments"
            :key="env.id"
            class="group relative rounded-2xl overflow-hidden hover:shadow-gold-glow transition-all duration-500 cursor-pointer"
            @click="selectEnvironment(env)"
          >
            <!-- Environment Background -->
            <div
              class="relative h-48 sm:h-56 bg-cover bg-center rounded-t-xl"
              :style="{
                backgroundImage: `url('${env.background}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }"
            >
              <!-- Theme badge -->
              <div
                class="absolute top-2 left-2 px-3 py-1 rounded text-[10px] font-bold"
                :class="env.themeBadge"
              >
                {{ env.name }}
              </div>
            </div>

            <!-- Environment Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-lg font-bold text-white">{{ env.caption }}</h3>
              <p class="text-sm text-gray-300 mt-1 line-clamp-2">
                {{ env.description }}
              </p>
            </div>

            <!-- Holographic accent -->
            <div
              class="absolute top-0 right-0 w-10 h-10 rounded-bl-xl bg-amber-500/20 backdrop-blur"
            />
          </div>

          <!-- Always show create button -->
          <div
            class="group relative rounded-2xl bg-black/60 border border-gold/30 hover:border-amber-500/50 cursor-pointer"
            @click="selectEnvironment({ id: 'custom', name: 'مجلسك', caption: 'صمم مجلسك', description: 'اختر التفاصيل لتكون مجالك الخاص', background: '#0e2c1a', themeBadge: 'bg-amber-500/20 text-amber-300' })"
          >
            <div class="p-6 text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 4" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6-6" />
                </svg>
              </div>
              <p class="text-[10px] text-gray-400 mt-2">صمم مجلسك</p>
            </div>
          </div>
        </div>

        <!-- Environment Details -->
        <div v-if="selectedEnv" class="mt-6 p-4 bg-black/50 rounded-xl backdrop-blur">
          <h3 class="text-xl font-black text-gold-light mb-3">تفاصيل {{ selectedEnv?.name }}</h3>
          <div>
            <p class="text-sm text-gray-300 mb-2">الخلفية: {{ selectedEnv.backgroundColor }}</p>
            <p class="text-sm text-gray-300 mb-2">الإضاءة: {{ selectedEnv.lighting }}</p>
            <p class="text-sm text-gray-300 mb-2">الأصوات: {{ selectedEnv.sounds.join(', ') }}</p>
          </div>
          <button
            class="mt-4 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-medium hover:scale-105 transition-transform"
            @closeModal
          >
            ادخل إلى المجلس
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const environments = ref([
  {
    id: 'najd',
    name: 'مجلس نجد الملكي',
    caption: 'Royal Najd Majlis',
    description: 'لباد طاولة من المخمل الزمردي بنقوش ذهبية معتقة، فوانيس عربية تتدلى وتتأرجح بفيزياء خفيفة، دلة قهوة عربية يتصاعد منها بخار حقيقي، ومبخرة ينبعث منها دخان عود يؤثر بحركة رمي البطاقات',
    background: 'linear-gradient(180deg, #0a1f14 0%, #07190f 100%)',
    backgroundColor: 'زمردي عميق مع ذهبي',
    lighting: 'فوانيس دافئة وتأثير بخار متحرك',
    sounds: ['قهوة تتفح', 'فوانين تتأرجح', 'بخار'],
    themeBadge: 'bg-amber-500/20 text-amber-300'
  },
  {
    id: 'camp',
    name: 'مخيم الصمان الليلي',
    caption: 'Desert Starlit Camp',
    description: 'سماء صحراوية ثلاثية الأبعاد بمليارات النجوم ومذنبات تعبر الأفق، شبّة نار خافتة تعكس ألسنة اللهب الدافئة على أوراق اللعب، وأصوات رياح ليلية هادئة',
    background: 'linear-gradient(180deg, #050d1a 0%, #020a15 100%)',
    backgroundColor: 'سماء ليلية مع نيران دافئة',
    lighting: 'شبّة نار والنجوم المتحركة',
    sounds: ['رياح ليلية', 'نيران متقطعة', 'همس الصحراء'],
    themeBadge: 'bg-amber-500/20 text-amber-300'
  },
  {
    id: 'dubai',
    name: 'سكاي روف دبي VIP',
    caption: 'Dubai Sky-Lounge VIP',
    description: 'طاولة من الزجاج الداكن والرخام الأسود محاطة بأفق ناطحات السحاب المضاءة، مع إضاءات نيون ذهبية تتفاعل مع مجريات المباراة (تتوهج بالأزرق أو الأحمر حسب الفريق المسيطر)',
    background: 'linear-gradient(180deg, #0d1d3a 0%, #060e1f 100%)',
    backgroundColor: 'رخام أسود وأفق نيو光',
    lighting: 'إضاءة نيون تفاعلية',
    sounds: ['أفقه ناطحات سحاب', 'نون نيون', 'موسيقى'],
    themeBadge: 'bg-amber-500/20 text-amber-300'
  },
  {
    id: 'heritage',
    name: 'قهوة البلد الحجازية',
    caption: 'Old Town Heritage Café',
    description: 'روشاش خشبية تراثية، إضاءة فوانين قمرية دافئة، وطاولة خشبية أصيلة تنبض بعبق التراث',
    background: 'linear-gradient(180deg, #3a0c12 0%, #1f0509 100%)',
    backgroundColor: 'خشبي تراثي ودافئ',
    lighting: 'فوانين قمرية',
    sounds: ['عبير القهوة', 'خشاش البرنج', 'همس تراثي'],
    themeBadge: 'bg-amber-500/20 text-amber-300'
  }
])

const selectedEnv = ref(null)

function selectEnvironment(env: any) {
  selectedEnv.value = env
  // Apply environment to game
  // In a full implementation, this would update the game's theme and atmosphere
  console.log('Selected environment:', env)
  closeModal()
}

function closeModal() {
  selectedEnv.value = null
  // Emit close event or navigate back
}
</script>

<style scoped>
/* Environment hover effects */
.environment-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.environment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

/• Badge styling */
.theme-badge {
  background: rgba(255, 185, 51, 0.3);
  color: #ffb933;
  border: 1px solid rgba(255, 185, 51, 0.5);
}
</style>