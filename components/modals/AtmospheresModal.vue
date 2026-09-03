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
        class="relative max-w-3xl mx-auto w-full bg-black/92 rounded-3xl backdrop-blur-xl border border-amber-500/40 shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto no-scrollbar text-right"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-gold-light flex items-center gap-2">
              <span>🏛️</span>
              <span>بيئات وخلفيات المجالس الذكية</span>
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

        <!-- Environments Grid with Real AI Previews -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            v-for="env in environments"
            :key="env.id"
            class="group relative rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[175px]"
            :class="[
              ui.theme === env.id
                ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] ring-2 ring-amber-400 scale-102'
                : 'border-white/15 hover:border-white/40 hover:scale-101'
            ]"
            @click="selectEnvironment(env.id)"
          >
            <!-- Real Photorealistic Background Image -->
            <img
              :src="env.image"
              :alt="env.name"
              class="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.35] group-hover:brightness-[0.45] transition-all duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            <!-- Top Row -->
            <div class="relative z-10 flex items-center justify-between">
              <span class="text-3xl filter drop-shadow">{{ env.icon }}</span>
              <span
                class="text-[11px] font-black px-2.5 py-0.5 rounded-full shadow"
                :class="ui.theme === env.id ? 'bg-amber-400 text-black' : 'bg-black/70 text-gray-200 border border-white/20'"
              >
                {{ ui.theme === env.id ? 'المجلس الحالي ✅' : 'تفعيل' }}
              </span>
            </div>

            <!-- Content -->
            <div class="relative z-10 mt-4">
              <h3 class="text-base font-black text-white drop-shadow">{{ env.name }}</h3>
              <p class="text-xs text-gray-200/90 mt-1 leading-relaxed drop-shadow">{{ env.description }}</p>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <div class="mt-5 text-center">
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
    image: '/images/themes/theme_1.jpg',
    description: 'سجاد زمردي ومخمل ملكي بتطريزات السدو النجدية، فوانيس ذهبية متأرجحة، وهدوء الملوك.',
  },
  {
    id: 2,
    name: 'مخيم الصمان الليلي',
    icon: '⛺',
    image: '/images/themes/theme_2.jpg',
    description: 'سماء صحراوية مرصعة بمجرة درب التبانة والهلال والشهب، مع جمر ومشب نار دافئ.',
  },
  {
    id: 3,
    name: 'سكاي روف دبي VIP',
    icon: '🌃',
    image: '/images/themes/theme_3.jpg',
    description: 'إطلالة بانورامية ليلية على برج خليفة وأفق دبي المتلألئ مع إضاءة نيون نبضية عصرية.',
  },
  {
    id: 4,
    name: 'قهوة البلد الحجازية',
    icon: '☕',
    image: '/images/themes/theme_4.jpg',
    description: 'أصالة حواري جدة التاريخية بخشب الرواشين التراثي، فناجين القهوة، ودفء الفوانيس.',
  },
]

function selectEnvironment(id: number) {
  ui.setTheme(id)
}

function closeModal() {
  ui.closeModal()
}
</script>