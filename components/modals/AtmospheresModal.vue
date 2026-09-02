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
      <div
        class="relative max-w-3xl mx-auto w-full bg-black/92 rounded-3xl backdrop-blur-xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar text-right"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-gold-light flex items-center gap-2">
              <span>🏛️</span>
              <span>بيئات المجالس الحية</span>
            </h2>
            <p class="text-xs text-emerald-300/80 mt-0.5">اختر بيئة الجلسة التي تناسب مزاجك وطاولتك</p>
          </div>
          <button
            class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <!-- Environments Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="env in environments"
            :key="env.id"
            class="group relative rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px]"
            :class="[
              ui.theme === env.id
                ? 'border-amber-400 bg-black/80 shadow-gold-glow ring-2 ring-amber-400/50 scale-102'
                : 'border-white/15 bg-black/40 hover:border-white/30 hover:scale-101'
            ]"
            :style="{ background: env.gradient }"
            @click="selectEnvironment(env.id)"
          >
            <!-- Top Row -->
            <div class="flex items-center justify-between">
              <span class="text-3xl">{{ env.icon }}</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="ui.theme === env.id ? 'bg-amber-500 text-black' : 'bg-black/60 text-gray-300 border border-white/10'"
              >
                {{ ui.theme === env.id ? 'المجلس الحالي ✅' : 'تفعيل' }}
              </span>
            </div>

            <!-- Content -->
            <div class="mt-4">
              <h3 class="text-base font-black text-white">{{ env.name }}</h3>
              <p class="text-xs text-gray-300 mt-1 leading-relaxed">{{ env.description }}</p>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <div class="mt-6 text-center">
          <button
            class="px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
            @click="closeModal"
          >
            تأكيد واختيار
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

const environments = [
  {
    id: 1,
    name: 'مجلس نجد الملكي',
    icon: '🏛️',
    gradient: 'linear-gradient(135deg, rgba(13,40,26,0.85) 0%, rgba(4,12,7,0.95) 100%)',
    description: 'سجاد زمردي بتطريزات السدو النجدية، فوانيس ذهبية متأرجحة، وهدوء الملوك.',
  },
  {
    id: 2,
    name: 'مخيم الصمان الليلي',
    icon: '⛺',
    gradient: 'linear-gradient(135deg, rgba(10,31,56,0.85) 0%, rgba(3,8,18,0.95) 100%)',
    description: 'سماء صحراوية مرصعة بالشهب والنجوم، جمر ونار دافئة في أطراف المجلس.',
  },
  {
    id: 3,
    name: 'سكاي روف دبي VIP',
    icon: '🌃',
    gradient: 'linear-gradient(135deg, rgba(19,34,68,0.85) 0%, rgba(5,10,24,0.95) 100%)',
    description: 'إضاءة نيون نبضية عصرية، طاولة زجاجية راقية، وأفق المدينة المضيء.',
  },
  {
    id: 4,
    name: 'قهوة البلد الحجازية',
    icon: '☕',
    gradient: 'linear-gradient(135deg, rgba(46,16,21,0.85) 0%, rgba(14,3,5,0.95) 100%)',
    description: 'خشب الرواشين التراثي الدافئ، فناجين الشاي والقهوة، وأصالة الحجاز.',
  },
]

function selectEnvironment(id: number) {
  ui.setTheme(id)
  ui.showToast('تم تغيير بيئة المجلس بنجاح ✨')
}

function closeModal() {
  ui.closeModal()
}
</script>