<template>
  <div class="relative w-full min-h-[100dvh] flex flex-col items-center pb-24 px-3 sm:px-4">
    <!-- Hero Header -->
    <HomeHeroHeader />

    <!-- Primary Game Action Hub (100% Real, Functional, Zero Fluff) -->
    <div class="w-full max-w-lg mt-4 flex flex-col items-center gap-3 select-none">
      <!-- Quick Play Button (Primary Hero CTA) -->
      <button
        class="shimmer-btn w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/25 border-2 border-yellow-300/60 flex items-center justify-between transition-transform hover:scale-102 active:scale-98"
        @click="game.quickPlay"
      >
        <div class="flex flex-col text-right">
          <b class="text-xl sm:text-2xl font-black">لعب سريع ⚡</b>
          <span class="text-xs sm:text-sm text-yellow-100 font-medium">ابدأ مباراة 2 ضد 2 فوراً مع البوتات أو اللاعبين</span>
        </div>
        <span class="text-3xl sm:text-4xl">🂡</span>
      </button>

      <!-- Create Room / Live Sessions Row -->
      <div class="w-full grid grid-cols-2 gap-2.5">
        <!-- Create Custom Room -->
        <button
          class="w-full p-3.5 rounded-2xl bg-gradient-to-br from-emerald-800/90 to-emerald-950 border border-emerald-400/40 text-white shadow-md hover:scale-102 active:scale-98 transition-transform flex items-center justify-center gap-2"
          @click="game.createRoom"
        >
          <span class="text-2xl">🏛️</span>
          <div class="flex flex-col text-right">
            <b class="text-sm font-black">أنشئ مجلساً</b>
            <span class="text-[10px] text-emerald-200/70">طاولة خاصة لأصدقائك</span>
          </div>
        </button>

        <!-- Live Sessions Spectator Button -->
        <button
          class="w-full p-3.5 rounded-2xl bg-black/50 border border-white/15 hover:border-amber-400/50 text-white shadow-md hover:scale-102 active:scale-98 transition-transform flex items-center justify-between px-3 sm:px-4"
          @click="ui.openModal('sessionsSheet')"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">👥</span>
            <div class="flex flex-col text-right">
              <b class="text-sm font-black">الجلسات الحية</b>
              <span class="text-[10px] text-gray-400">بث مباشر للمباريات</span>
            </div>
          </div>
          <span
            v-if="game.activeSessions.length > 0"
            class="px-2 py-0.5 rounded-full bg-emerald-500/80 text-white font-mono font-bold text-xs"
          >
            {{ game.activeSessions.length }}
          </span>
        </button>
      </div>

      <!-- Join by Code Input -->
      <div class="w-full flex items-center gap-2 mt-0.5">
        <input
          v-model="joinCode"
          type="text"
          dir="ltr"
          maxlength="6"
          placeholder="🔑 كود الطاولة (مثال: ABCD)"
          class="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-gray-500 font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-amber-400"
          @keydown.enter="handleJoin"
        />
        <button
          class="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
          @click="handleJoin"
        >
          انضمام
        </button>
      </div>
    </div>

    <!-- Quick Atmosphere / Theme Selector Bar (100% Real & Working) -->
    <div class="w-full max-w-lg mt-5 p-4 rounded-3xl bg-black/60 backdrop-blur-md border border-amber-500/30 text-right select-none">
      <div class="flex items-center justify-between mb-3">
        <b class="text-sm font-black text-gold-light flex items-center gap-1.5">
          <span>🎨</span>
          <span>بيئة المجلس وطاولة اللعب</span>
        </b>
        <span class="text-[11px] text-amber-200/80 font-bold">{{ currentThemeName }}</span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="th in themes"
          :key="th.id"
          class="relative p-2 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-1 overflow-hidden"
          :class="ui.theme === th.id ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-102' : 'border-white/10 bg-black/40 hover:border-white/30'"
          @click="selectTheme(th.id)"
        >
          <span class="text-xl">{{ th.icon }}</span>
          <span class="text-[10px] font-bold text-white">{{ th.name }}</span>
          <span v-if="ui.theme === th.id" class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </button>
      </div>
    </div>

    <!-- How to Play Quick Guide (قواعد اللعبة التفاعلية) -->
    <div class="w-full max-w-lg mt-4 p-4 sm:p-5 rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 text-right select-none">
      <h3 class="text-sm font-black text-white mb-3 flex items-center justify-between">
        <span class="flex items-center gap-2">
          <span>📜</span>
          <span>كيف تلعب «مجابيد»؟</span>
        </span>
        <button
          class="text-xs text-gold-light font-bold hover:underline"
          @click="ui.openModal('rules')"
        >
          عرض القوانين الكاملة ◂
        </button>
      </h3>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-amber-300 font-bold">
            <span>🂡</span>
            <span>12 ورقة في يدك</span>
          </div>
          <p class="text-[11px] text-gray-300 leading-relaxed">
            يوزع 12 كرت لكل لاعب و12 في الميدان. هدفك كنس الميدان وكبس كومات الخصوم.
          </p>
        </div>

        <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-emerald-300 font-bold">
            <span>🍽️</span>
            <span>الأكل والكبس</span>
          </div>
          <p class="text-[11px] text-gray-300 leading-relaxed">
            كرتك يأكل كل الكروت المطابقة لرقمه في الميدان، أو يسرق كومة الخصم المعروضة.
          </p>
        </div>

        <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-rose-300 font-bold">
            <span>⛔</span>
            <span>كمين «وقّف!»</span>
          </div>
          <p class="text-[11px] text-gray-300 leading-relaxed">
            إذا أكل خصمك ولديك نفس الرقم، تفتح نافذة 5 ثوانٍ للخطف وصقع الأكلة فوراً.
          </p>
        </div>

        <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-yellow-300 font-bold">
            <span>🃏</span>
            <span>الجوكر الذهبي</span>
          </div>
          <p class="text-[11px] text-gray-300 leading-relaxed">
            الجوكر يأكل أي رقم ويخطف أي أكلة بلا استثناء ولا يمكن لأحد صقعه بعده!
          </p>
        </div>
      </div>
    </div>

    <!-- Account / Guest Profile Section -->
    <div id="account-section" class="w-full max-w-lg mt-4 flex flex-col items-center">
      <HomeAccountCard v-if="auth.account" />
      <HomeAuthBox v-else />

      <!-- Guest Fields & Avatar Picker -->
      <div v-if="!auth.account" class="w-full mt-3 p-4 rounded-3xl bg-black/40 border border-white/10 flex flex-col gap-3 text-right">
        <label class="text-xs font-bold text-gray-300">اسمك وصورتك الرمزية كضيف:</label>
        <input
          :value="auth.guestName"
          type="text"
          maxlength="16"
          placeholder="اكتب اسمك على الطاولة..."
          class="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
          @input="onNameInput"
        />

        <!-- Avatar Selection Row -->
        <div class="flex items-center justify-between pt-1">
          <button
            v-for="av in avatarList"
            :key="av"
            class="p-1 rounded-full transition-transform"
            :class="auth.guestAvatar === av ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70 hover:opacity-100'"
            @click="auth.setGuestAvatar(av)"
          >
            <UiAvatarImg :avatar="av" size="sm" :border="auth.guestAvatar === av ? 'gold' : 'none'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Bar (3 Real, Functional Tabs) -->
    <nav class="fixed bottom-0 inset-x-0 z-40 h-15 bg-black/95 backdrop-blur-xl border-t border-white/15 flex items-center justify-around px-4 max-w-lg mx-auto shadow-2xl select-none">
      <button
        class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
        :class="ui.activeTab === 'home' ? 'text-amber-400 font-black scale-105' : 'text-gray-400 hover:text-white'"
        @click="ui.setActiveTab('home')"
      >
        <span class="text-lg">🂡</span>
        <span class="text-[11px] font-bold">الرئيسية</span>
      </button>

      <button
        class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
        :class="ui.activeTab === 'leaderboard' ? 'text-amber-400 font-black scale-105' : 'text-gray-400 hover:text-white'"
        @click="openLeaderboard"
      >
        <span class="text-lg">🏆</span>
        <span class="text-[11px] font-bold">المتصدرين</span>
      </button>

      <button
        class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
        :class="ui.activeTab === 'rules' ? 'text-amber-400 font-black scale-105' : 'text-gray-400 hover:text-white'"
        @click="ui.openModal('rules')"
      >
        <span class="text-lg">📜</span>
        <span class="text-[11px] font-bold">القوانين</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const auth = useAuthStore()
const ui = useUiStore()

const joinCode = ref('')
const avatarList = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']

const themes = [
  { id: 1, name: 'نجد', icon: '🏛️' },
  { id: 2, name: 'الصمان', icon: '⛺' },
  { id: 3, name: 'دبي', icon: '🌃' },
  { id: 4, name: 'البلد', icon: '☕' },
]

const currentThemeName = computed(() => {
  const t = themes.find(x => x.id === ui.theme)
  return t ? `${t.icon} مجلس ${t.name}` : '🏛️ مجلس نجد'
})

function selectTheme(id: number) {
  ui.setTheme(id)
}

function handleJoin() {
  if (!joinCode.value.trim()) {
    ui.showToast('أدخل كود الطاولة أولاً 🔑', true)
    return
  }
  game.joinRoom(joinCode.value.trim())
}

function onNameInput(e: Event) {
  const target = e.target as HTMLInputElement
  auth.setGuestName(target.value)
}

function openLeaderboard() {
  game.requestLeaderboard()
  ui.openModal('leaderboard')
}
</script>