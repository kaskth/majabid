<template>
  <div class="relative w-full min-h-screen flex flex-col items-center pb-24 px-4 overflow-y-auto no-scrollbar">
    <!-- Hero Header -->
    <HomeHeroHeader />

    <!-- Primary Game Action Hub -->
    <div class="w-full max-w-lg mt-5 flex flex-col items-center gap-3 select-none">
      <!-- Quick Play Button (Primary CTA) -->
      <button
        class="shimmer-btn w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/25 border-2 border-yellow-300/60 flex items-center justify-between transition-transform hover:scale-102 active:scale-98"
        @click="game.quickPlay"
      >
        <div class="flex flex-col text-right">
          <b class="text-xl sm:text-2xl font-black">لعب سريع ⚡</b>
          <span class="text-xs sm:text-sm text-yellow-100 font-medium">بحث فوري عن طاولة 2 ضد 2</span>
        </div>
        <span class="text-3xl sm:text-4xl">🂡</span>
      </button>

      <!-- Create Room / Join Code Row -->
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Create Room -->
        <button
          class="w-full p-3.5 rounded-2xl bg-gradient-to-br from-emerald-800/90 to-emerald-950 border border-emerald-400/40 text-white shadow-md hover:scale-102 active:scale-98 transition-transform flex items-center justify-center gap-2"
          @click="game.createRoom"
        >
          <span class="text-2xl">🏛️</span>
          <div class="flex flex-col text-right">
            <b class="text-sm font-black">أنشئ مجلساً خاصاً</b>
            <span class="text-[10px] text-emerald-200/70">طاولة خاصة لأصدقائك</span>
          </div>
        </button>

        <!-- Live Sessions Button -->
        <button
          class="w-full p-3.5 rounded-2xl bg-black/50 border border-white/15 hover:border-gold/50 text-white shadow-md hover:scale-102 active:scale-98 transition-transform flex items-center justify-between px-4"
          @click="ui.openModal('sessionsSheet')"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">👥</span>
            <div class="flex flex-col text-right">
              <b class="text-sm font-black">الجلسات المباشرة</b>
              <span class="text-[10px] text-gray-400">شاهد وتعلّم من المحترفين</span>
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
      <div class="w-full flex items-center gap-2 mt-1">
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

    <!-- Feature Showcase Grid -->
    <div class="w-full max-w-lg grid grid-cols-2 gap-3 mt-6 select-none">
      <!-- Atmosphere Card -->
      <div
        class="group p-4 rounded-3xl bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 cursor-pointer transform hover:scale-103 shadow-lg"
        @click="ui.openModal('atmospheres')"
      >
        <div class="text-3xl mb-1.5">🏛️</div>
        <b class="text-sm font-black text-white block">بيئات المجالس الحية</b>
        <p class="text-[10px] text-gray-300 mt-1 leading-relaxed">
          مجلس نجد، مخيم الصمان، سكاي روف دبي، وقهوة البلد الحجازية بأجواء حية.
        </p>
      </div>

      <!-- Card Effects Card -->
      <div
        class="group p-4 rounded-3xl bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 cursor-pointer transform hover:scale-103 shadow-lg"
        @click="ui.openModal('cardEffects')"
      >
        <div class="text-3xl mb-1.5">✨</div>
        <b class="text-sm font-black text-white block">أطقم الورق الملكية</b>
        <p class="text-[10px] text-gray-300 mt-1 leading-relaxed">
          ذهب خالص، زمرد وفيروز، وسيف ونخلة مع انعكاسات ضوئية ثلاثية الأبعاد.
        </p>
      </div>

      <!-- Ambush Card -->
      <div
        class="group p-4 rounded-3xl bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 cursor-pointer transform hover:scale-103 shadow-lg"
        @click="ui.openModal('ambush')"
      >
        <div class="text-3xl mb-1.5">⛔</div>
        <b class="text-sm font-black text-white block">مصفوفة «وقّف!»</b>
        <p class="text-[10px] text-gray-300 mt-1 leading-relaxed">
          الكمين السينمائي: تباطؤ الزمن، بقعة الضوء، وموجة الصدمة عند خطف الجوكر.
        </p>
      </div>

      <!-- AI Persons Card -->
      <div
        class="group p-4 rounded-3xl bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 cursor-pointer transform hover:scale-103 shadow-lg"
        @click="ui.openModal('aiPersons')"
      >
        <div class="text-3xl mb-1.5">🧠</div>
        <b class="text-sm font-black text-white block">شخصيات الديوانية</b>
        <p class="text-[10px] text-gray-300 mt-1 leading-relaxed">
          الشيخ رمضان الحكيم، صقر الدواسر المندفع، وخالتي حصة مع حوارات تفاعلية.
        </p>
      </div>
    </div>

    <!-- Account / Auth Section -->
    <div id="account-section" class="w-full max-w-lg mt-6 flex flex-col items-center">
      <HomeAccountCard v-if="auth.account" />
      <HomeAuthBox v-else />

      <!-- Guest Fields & Avatar Picker -->
      <div v-if="!auth.account" class="w-full mt-4 p-4 rounded-3xl bg-black/40 border border-white/10 flex flex-col gap-3 text-right">
        <label class="text-xs font-bold text-gray-300">اسمك وصورتك الرمزية كضيف:</label>
        <input
          :value="auth.guestName"
          type="text"
          maxlength="16"
          placeholder="اكتب اسمك على الطاولة..."
          class="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
          @input="onNameInput"
        />

        <!-- Avatar Selection Row -->
        <div class="flex items-center justify-between pt-1">
          <button
            v-for="av in avatarList"
            :key="av"
            class="p-1 rounded-full transition-transform"
            :class="auth.guestAvatar === av ? 'ring-2 ring-gold scale-110' : 'opacity-70 hover:opacity-100'"
            @click="auth.setGuestAvatar(av)"
          >
            <UiAvatarImg :avatar="av" size="sm" :border="auth.guestAvatar === av ? 'gold' : 'none'"/>
          </button>
        </div>
      </div>
    </div>

    <!-- Rules Link & Footer -->
    <div class="mt-6 text-center select-none">
      <button
        class="text-xs font-bold text-gold-light hover:underline mb-2"
        @click="ui.openModal('rules')"
      >
        📜 قوانين وتعليمات لعبة مجابيد (10 قوانين رسمية)
      </button>
      <div class="text-[11px] text-gray-400">
        مجابيد أرينا · محرك متجهات SVG نقي · 4 بيئات مجلس حية · شخصيات ديوانية ذكية
      </div>
    </div>

    <!-- Bottom Navigation Bar (5 Core Tabs) -->
    <nav class="fixed bottom-0 inset-x-0 z-40 h-16 bg-black/90 backdrop-blur-xl border-t border-white/15 flex items-center justify-around px-3 max-w-lg mx-auto shadow-2xl select-none">
      <button
        v-for="nav in navItems"
        :key="nav.id"
        class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
        :class="ui.activeTab === nav.id ? 'text-amber-400 font-black scale-105' : 'text-gray-400 hover:text-white'"
        @click="handleNav(nav.id)"
      >
        <span class="text-xl mb-0.5">{{ nav.icon }}</span>
        <span class="text-[10px] font-bold">{{ nav.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import { useUiStore, type ActiveTab } from '~/stores/ui'

const game = useGameStore()
const auth = useAuthStore()
const ui = useUiStore()

const joinCode = ref('')
const avatarList = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']

// 5 Core navigation destinations (clean, spacious, and responsive on mobile)
const navItems = [
  { id: 'home', label: 'الرئيسية', icon: '🏠' },
  { id: 'sessions', label: 'الجلسات', icon: '👥' },
  { id: 'store', label: 'المتجر', icon: '🛍️' },
  { id: 'leaderboard', label: 'الصدارة', icon: '🏆' },
  { id: 'rules', label: 'القوانين', icon: '📜' },
]

function onNameInput(e: Event) {
  const target = e.target as HTMLInputElement
  auth.setGuestName(target.value)
}

function handleJoin() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code) return
  game.joinRoom(code)
}

function handleNav(id: string) {
  ui.activeTab = id as ActiveTab
  switch (id) {
    case 'home':
      ui.closeModal()
      break
    case 'sessions':
      ui.openModal('sessionsSheet')
      break
    case 'store':
      ui.openModal('store')
      break
    case 'leaderboard':
      ui.openModal('leaderboard')
      break
    case 'rules':
      ui.openModal('rules')
      break
  }
}
</script>