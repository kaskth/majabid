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
      <div class="relative top-20 max-w-4xl mx-auto w-full bg-black/90 rounded-3xl backdrop-blur-lg border border-amber-500/40 shadow-gold-glow p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl sm:text-3xl font-black text-amber-300">مصفوفة كمين «وقّف!» السينمائية</h2>
          <button class="p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 transition-transform" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Cinematic Ambush Overview -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-amber-300 mb-3">ميزات الكمين السينمائي</h3>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="feature in features" :key="feature.id" class="p-3 bg-black/50 rounded-xl">
              <div class="text-amber-300 font-medium text-[12px] mb-1">{{ feature.title }}</div>
              <p class="text-[10px] text-gray-300 line-clamp-2">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <!-- Time Dilation Effect -->
        <div>
          <h3 class="text-lg font-bold text-amber-300 mb-3">تباطؤ الزمن (Bullet Time)</h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="group relative rounded-xl p-3 border border-amber-500/20">
              <div class="absolute top-0 left-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 4M12 10v6-6"/>
                </svg>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white">تباطؤ 80%</p>
                <p class="text-[9px] text-gray-300">تنخفض سرعة الزمن إلى 20% بعد صرخة «وقّف!»</p>
              </div>
            </div>
            <div class="group relative rounded-xl p-3 border border-amber-500/20">
              <div class="absolute top-0 left-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0"/></svg>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white">تجميد المشهد</p>
                <p class="text-[9px] text-gray-300">تتجمد البطاقة المأكوبة في الهواء بهالة ذهبية متوهجة</p>
              </div>
            </div>
          </div>

          <!-- Spotlight Effect -->
          <div>
            <p class="text-[10px] font-bold text-white mb-2">بقعة الضوء الدرامية</p>
            <p class="text-[9px] text-gray-300">تنطفئ إضاءة المجلس وتسلط بقعة ضوء عالية التباين على اللاعب الخاطف مع نبضات قلب صوتية</p>
          </div>
        </div>

        <!-- Golden Joker Shockwave -->
        <div class="mt-6 p-4 bg-black/50 rounded-xl">
          <h3 class="text-lg font-bold text-amber-300 mb-2">موجة الصدمة الذهبية</h3>
          <p class="text-[10px] text-gray-300 mb-3">إذا كان الكمين بجوكر:</p>
          <ul class="space-y-1 text-[9px] text-gray-300">
            <li>موجة صدمة ذهبية تمزق حواف الشاشة</li>
            <li>شرارات نارية احتفالية</li>
            <li>قلب موازين الجولة بالكامل</li>
            <li>صوت métallique عميق (صوت معدني)</li>
          </ul>
          <div class="mt-3 p-3 rounded-xl" :style="{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%)', border: '1px solid #ffd75e' }">
            <p class="text-[10px] font-black text-amber-300">🏆Moment of Glory: الفوز يتحول للمخيط للجوكر!</p>
          </div>
        </div>

        <!-- How It Works -->
        <div class="mt-6 p-4 bg-black/50 rounded-xl">
          <h3 class="text-lg font-bold text-amber-300 mb-3">كيف يعمل في اللعبة:</h3>
          <ol class="list-decimal list-inside space-y-2 text-[10px] text-gray-300">
            <li>بعد كل أكلة نافذة 5 ثوانٍ</li>
            <li>صرخ «وقّف!» إذا كنت تملك نفس الرقم أو جوكر</li>
            <li>يتم تفعيل المصفوفة السينمائية تلقائياً</li>
            <li>الخاطف يأخذ الأكلة ويستمر دوره</li>
            <li>آخر من استقرت عنده الأكلة يواصل اللعب</li>
          </ol>
        </div>

        <!-- Close Button -->
        <div class="mt-6 text-right">
          <button
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-medium hover:scale-105 transition-transform"
            @click="closeModal"
          >
            فهمت — ارجع للملعب
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  {
    id: 'time-dilation',
    title: 'تباطؤ الزمن',
    description: 'تنخفض سرعة اللعبة إلى 20% للجميع بعد صرخة «وقّف!»، مما يخلق لحظات قرارات حاسمة'
  },
  {
    id: 'spotlight',
    title: 'بقعة الضوء',
    description: 'تنطفئ إضاءة المجلس وتسلط ضوء dramatique على اللاعب الخاطف مع مؤثرات صوتية'
  },
  {
    id: 'shockwave',
    title: 'موجة الصدمة',
    description: 'عند استخدام الجوكر في الكمين، موجة ذهبية تعلن قلب الموازين وتعلن الحرب الدرامية'
  },
  {
    id: 'turn-reversal',
    title: 'تغيير الدور',
    description: 'آخر من استقرت عنده الأكلة يواصل دوره، والخاطف لا يلعب في الجولة الحالية'
  }
])

function closeModal() {}
</script>

<style scoped>
/* Feature grid item */
.feature-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 185, 51, 0.3);
}
</style>