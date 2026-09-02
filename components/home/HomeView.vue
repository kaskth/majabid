<template>
  <div class="relative w-full min-h-screen flex flex-col items-center pb-24 px-4 overflow-y-auto no-scrollbar">
    <!-- Hero Header with cinematic introduction -->
    <HomeHeroHeader />

    <!-- Big CTA Buttons -->
    <div class="w-full max-w-2xl mt-6 flex flex-col items-center gap-3">
      <!-- Quick Play Button -->
      <button
        class="shimmer-btn w-full max-w-lg p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white shadow-lg shadow-orange-400/30 border-2 border-yellow-400/50 flex items-center justify-between transition-transform hover:scale-102 active:scale-98"
        @click="game.quickPlay"
      >
        <div class="flex flex-col text-right">
          <b class="text-xl sm:text-2xl font-black">لعب سريع ⚡</b>
          <span class="text-xs sm:text-sm text-yellow-100 font-medium">بحث فوري عن طاولة 2×2</span>
        </div>
        <span class="text-3xl sm:text-4xl opacity-90">🂡</span>
      </button>

      <!-- Create Private Match -->
      <button
        class="w-full max-w-lg p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-800/90 to-emerald-950 border border-emerald-400/40 text-white shadow-lg hover:scale-102 active:scale-98 transition-transform"
        @click="game.createRoom"
      >
        <div class="flex flex-col text-center gap-1">
          <span class="text-3xl">🏛️</span>
          <b class="text-sm sm:text-base font-black">أنشئ مجلساً</b>
          <span class="text-[10px] text-emerald-200/80">اجمع الأصدقاء وقم بتكوين طاولة خاصة</span>
        </div>
      </button>

      <!-- Join by Code -->
      <div class="w-full max-w-lg flex items-center gap-2">
        <input
          v-model="joinCode"
          type="text"
          dir="ltr"
          maxlength="6"
          placeholder="🔑 كود الطاولة"
          class="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-gray-500 font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-gold"
          @keydown.enter="handleJoin"
        />
        <button
          class="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
          @click="handleJoin"
        >
          انضم
        </button>
      </div>
    </div>

    <!-- Feature Tiles - New Generation Features -->
    <div class="w-full max-w-3xl grid grid-cols-2 gap-4 mt-6">
      <!-- Atmosphere Tile -->
      <div
        class="group p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-gold/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer transform hover:scale-103"
        @click="ui.openModal('atmospheres')"
      >
        <div class="text-3xl mb-2">🏛️</div>
        <b class="text-sm sm:text-base font-black text-left">بيئات المجالس الحية</b>
        <p class="text-[10px] text-gray-300 mt-1 line-clamp-2">
          4 مجالس ثلاثية الأبعاد بأ lighting ديناميكي وتفاصيل متحركة: مجلس نجد، مخيم الصمان، سكاي روف دبي، مئذنة البلد الحجازية
        </p>
      </div>

      <!-- Card Effects Tile -->
      <div
        class="group p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-gold/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer transform hover:scale-103"
        @click="ui.openModal('cardEffects')"
      >
        <div class="text-3xl mb-2">✨</div>
        <b class="text-sm sm:text-base font-black text-left">أشجار الذهب والشiders</b>
        <p class="text-[10px] text-gray-300 mt-1 line-clamp-2">
          بطاقات بألوان ذهبية مذهبة وانعكاسات ضوئية حقيقية تتغير بزاوية الإمالة، وأطقم ملكية: ذهب خالص، فيروز وزمرذ، سيف ونخلة
        </p>
      </div>

      <!-- Ambush Tile -->
      <div
        class="group p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-gold/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer transform hover:scale-103"
        @click="ui.openModal('ambush')"
      >
        <div class="text-3xl mb-2">⛔</div>
        <b class="text-sm sm:text-base font-black text-left">مصفوفة كمين سينمائية</b>
        <p class="text-[10px] text-gray-300 mt-1 line-clamp-2">
          تباطؤ الزمن عند صرخة «وقّف!»، بقعة ضوء درامية، وموجة صدمة ذهبية عند استخدام الجوكر - أعلى لحظات الدراما في ألعاب الورق
        </p>
      </div>

      <!-- AI Persons Tile -->
      <div
        class="group p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-gold/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer transform hover:scale-103"
        @click="ui.openModal('aiPersons')"
      >
        <div class="text-3xl mb-2">🧠</div>
        <b class="text-sm sm:text-base font-black text-left">شخصيات الديوانية بالذكاء الاصطناعي</b>
        <p class="text-[10px] text-gray-300 mt-1 line-clamp-2">
          personalities: الشيخ رمضان (الحكيم)، صقر الدواسر (المندفع)، خالتي حصة (المريحة) - معلق صوتي تحليلي لحظي أثناء البطولات
        </p>
      </div>
    </div>

    <!-- Active Sessions Strip -->
    <div
      class="w-full max-w-lg mt-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-gold/40 cursor-pointer flex items-center justify-between transition-colors"
      @click="ui.openModal('sessionsSheet')"
    >
      <div class="flex items-center gap-2.5">
        <span class="text-xl">👥</span>
        <span class="font-bold text-sm text-white">الجلسات المباشرة</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="game.activeSessions.length > 0" class="px-2 py-0.5 rounded-full bg-emerald-500/80 text-white font-mono font-bold text-xs">
          {{ game.activeSessions.length }} نشطة
        </span>
        <span class="text-gray-400 text-sm">▶</span>
      </div>
    </div>

    <!-- Action Tiles -->
    <div class="grid grid-cols-2 gap-3 w-full max-w-lg mt-3">
      <!-- Create Group -->
      <button
        class="p-4 rounded-2xl bg-gradient-to-br from-emerald-800/90 to-emerald-950 border border-emerald-400/40 text-white flex flex-col items-center text-center shadow-lg hover:scale-102 active:scale-98 transition-transform"
        @click="game.createRoom"
      >
        <span class="text-3xl mb-1">🂡</span>
        <b class="text-sm sm:text-base font-black">أنشئ مجموعة</b>
        <span class="text-[11px] text-emerald-200/80">العب مع أصدقائك</span>
      </button>

      <!-- Custom Match -->
      <button
        class="p-4 rounded-2xl bg-gradient-to-br from-purple-800/90 to-purple-950 border border-purple-400/40 text-white flex flex-col items-center text-center shadow-lg hover:scale-102 active:scale-98 transition-transform"
        @click="game.createRoom"
      >
        <span class="text-3xl mb-1">♥</span>
        <b class="text-sm sm:text-base font-black">جلسة كاملة</b>
        <span class="text-[11px] text-purple-200/80">حتى يخلص الورق</span>
      </button>
    </div>

    <!-- Join Room by Code Row -->
    <div class="w-full max-w-lg mt-3 flex items-center gap-2">
      <input
        v-model="joinCode"
        type="text"
        dir="ltr"
        maxlength="6"
        placeholder="🔑 كود الطاولة"
        class="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-gray-500 font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-gold"
        @keydown.enter="handleJoin"
      />
      <button
        class="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
        @click="handleJoin"
      >
        انضمام
      </button>
    </div>

    <!-- Account / Auth Section -->
    <div id="account-section" class="w-full max-w-lg mt-5 flex flex-col items-center">
      <HomeAccountCard v-if="auth.account" />
      <HomeAuthBox v-else />

      <!-- Guest Fields & Avatar Picker -->
      <div v-if="!auth.account" class="w-full mt-4 p-4 rounded-3xl bg-black/35 border border-white/10 flex flex-col gap-3 text-right">
        <label class="text-xs font-bold text-gray-300">اسمك وشخصيتك كضيف:</label>
        <input
          :value="auth.guestName"
          type="text"
          maxlength="16"
          placeholder="اكتب اسمك على الطاولة..."
          class="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-gold"
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
    <div class="mt-6 text-center">
      <button
        class="text-xs font-bold text-gold-light hover:underline mb-2"
        @click="ui.openModal('rules')"
      >
        📜 قوانين وتعليمات اللعبة
      </button>
      <div class="text-[11px] text-gray-400">
        النسخة 1.5 المجددة · فيزياء كروت متقدمة · 4 بيئات مجلس حية · شخصيات AI · سوق المظاهر
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <nav class="fixed bottom-0 inset-x-0 z-40 h-16 bg-black/85 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-2 max-w-lg mx-auto">
      <button
        v-for="nav in navItems"
        :key="nav.id"
        class="flex flex-col items-center justify-center flex-1 py-1 transition-colors"
        :class="ui.activeTab === nav.id ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-white'"
        @click="handleNav(nav.id)"
      >
        <span class="text-xl mb-0.5">{{ nav.icon }}</span>
        <span class="text-[10px]">{{ nav.label }}</span>
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

const navItems = [
  { id: 'home', label: 'الرئيسية', icon: '🏠' },
  { id: 'sessions', label: 'الجلسات', icon: '👥' },
  { id: 'leaderboard', label: 'الصدارة', icon: '🏆' },
  { id: 'store', label: 'المظهر', icon: '🛍️' },
  { id: 'rules', label: 'القوانين', icon: '📜' },
  { id: 'atmospheres', label: 'البيئات', icon: '🌌' },
  { id: 'effects', label: 'التأثيرات', icon: '✨' },
  { id: 'ambush', label: 'الكمائن', icon: '🎬' },
  { id: 'ai', label: 'الذكاء', icon: '🧠' },
]

function onNameInput(e: Event) {
  const target = e.target as HTMLInputElement
  auth.setGuestName(target.value)
}

function handleJoin() {
  if (!joinCode.value.trim()) {
    ui.showToast('اكتب كود الطاولة أولاً', true)
    return
  }
  game.joinRoom(joinCode.value)
}

function handleNav(id: string) {
  ui.activeTab = id as ActiveTab
  if (id === 'sessions') ui.openModal('sessionsSheet')
  else if (id === 'leaderboard') ui.openModal('leaderboard')
  else if (id === 'store') ui.openModal('store')
  else if (id === 'rules') ui.openModal('rules')
  else if (id === 'atmospheres') ui.openModal('atmospheres')
  else if (id === 'effects') ui.openModal('cardEffects')
  else if (id === 'ambush') ui.openModal('ambush')
  else if (id === 'ai') ui.openModal('aiPersons')
  else if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<!-- Animation shimmer effect -->
<style>
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-15deg);
  animation: shimmer 3s infinite;
}

@keyframes fade-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-up {
  animation: fade-slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>