<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="relative w-full max-w-xl p-6 rounded-3xl bg-[#0f241a] border border-gold/40 shadow-gold-glow flex flex-col items-center max-h-[85vh] overflow-y-auto no-scrollbar text-right">
      <h2 class="text-2xl font-black text-gold-light mb-4 flex items-center gap-2">
        <span>📜</span>
        <span>قوانين لعبة مجابيد</span>
      </h2>

      <ol class="space-y-3 text-xs sm:text-sm text-gray-200 leading-relaxed list-decimal list-inside">
        <li><strong class="text-amber-300">الهدف:</strong> اجمع أكبر نقاط في كومتك — <strong>10 نقاط</strong> للعشرة والصور والإكّة و <strong>50 نقطة</strong> للجوكر. الحسبة <strong>مخفية</strong> أثناء اللعب وتنكشف نهاية الجولة.</li>
        <li><strong class="text-amber-300">التوزيع:</strong> الموزع يبدأ بـ13 ورقة والباقي 12. الميدان يفتح بـ13 ورقة (واحدة من كل نوع بلا جوكر). اليد تتجدد لـ13 عند دورك.</li>
        <li><strong class="text-amber-300">الأكل:</strong> في دورك انزل ورقة تطابق رقماً بالميدان أو بجبيد خصم — تكنس كل المطابق دفعة واحدة. الأكل إجباري إذا كان كل ورقك يأكل.</li>
        <li><strong class="text-amber-300">وقّف! (الكمين):</strong> بعد كل أكلة نافذة <strong>5 ثوانٍ</strong> — من عنده نفس الرقم أو جوكر يخطف الأكلة. كل خطفة تعيد العدّ.</li>
        <li><strong class="text-amber-300">السرقة:</strong> طابق الجبيد بورقة بيدك → خذ كل المكشوف ومعه <strong>الجوكرات المدفونة</strong>، والمدفون المختلف يبقى لصاحبه.</li>
        <li><strong class="text-amber-300">قواعد الجوكر:</strong> يأكل أي رقم تختاره، فيتو قاطع لأي أكلة. لا يُرمى بالميدان أبداً ولا يكون جبيداً مكشوفاً بل يُدفن دائماً.</li>
        <li><strong class="text-amber-300">الطور الختامي:</strong> عند نفاد الرزمة، اللاعب التالي فقط يحق له الخطف — خطفة واحدة تحسم فوراً والخاطف لا يلعب.</li>
        <li><strong class="text-amber-300">إذا وقف الجميع:</strong> تنقلب ورقة من الرزمة للميدان — وإذا خلت الرزمة تنتهي الجولة ويُهمل الميدان.</li>
        <li><strong class="text-amber-300">المؤقتات:</strong> 20 ثانية للدور — عند انتهائها تُلعب عنك حركة قانونية تلقائياً.</li>
        <li><strong class="text-amber-300">الجماعي (2×2):</strong> شريكتك مقابلك، كومتها مفتوحة لك، وممنوع رمي ورقة تكشف جبيدها إذا كان عندك بديل.</li>
      </ol>

      <button
        class="mt-6 px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
        @click="ui.closeModal"
      >
        فهمت القوانين — يلا نلعب
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
const ui = useUiStore()
</script>
