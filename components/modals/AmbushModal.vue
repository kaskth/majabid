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
        <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-gold-light flex items-center gap-2">
              <span>⛔</span>
              <span>مصفوفة كمين «وقّف!»</span>
            </h2>
            <p class="text-xs text-emerald-300/80 mt-0.5">لحظات الحسم والدراما في لعبة مجابيد</p>
          </div>
          <button class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- How Ambush Works -->
        <div class="space-y-3 mb-6">
          <div class="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
            <span class="text-2xl">⏳</span>
            <div>
              <b class="text-sm text-amber-300 block mb-1">نافذة الـ 5 ثوانٍ</b>
              <p class="text-xs text-gray-300 leading-relaxed">
                بعد كل أكلة ناجحة، تتوقف حركة اللعب وتفتح نافذة مدتها 5 ثوانٍ مع عداد دائري ونبض صوتي.
              </p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
            <span class="text-2xl">⚡</span>
            <div>
              <b class="text-sm text-amber-300 block mb-1">شروط صرخة «وقّف!»</b>
              <p class="text-xs text-gray-300 leading-relaxed">
                يحق لأي لاعب على الطاولة (عدا صاحب الأكلة نفسه) يملك نفس رقم الأكلة أو يملك <strong>الجوكر</strong> أن يصرخ «وقّف!» ويخطف الأكلة بالكامل!
              </p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
            <span class="text-2xl">🃏</span>
            <div>
              <b class="text-sm text-amber-300 block mb-1">قوة الجوكر في الكمين</b>
              <p class="text-xs text-gray-300 leading-relaxed">
                الجوكر يعتبر قاطعاً فيتو لأي أكلة. إذا استُخدم الجوكر في الكمين، تُحدث صدمة ذهبية وتنتقل الأكلة مع الجوكر المدفون للخاطف.
              </p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
            <span class="text-2xl">👑</span>
            <div>
              <b class="text-sm text-amber-300 block mb-1">تجدد النافذة واستمرار الدور</b>
              <p class="text-xs text-gray-300 leading-relaxed">
                كل خطفة جديدة تعيد فتح نافذة الـ 5 ثوانٍ من جديد، وآخر لاعب تستقر عنده الأكلة يواصل دوره في اللعب!
              </p>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <div class="text-center">
          <button
            class="px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
            @click="closeModal"
          >
            فهمت القانون — ارجع للعب
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

function closeModal() {
  ui.closeModal()
}
</script>