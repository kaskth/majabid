<template>
  <div class="w-full max-w-lg mx-auto p-5 sm:p-7 rounded-3xl bg-[#0b1c13]/95 backdrop-blur-md border border-amber-500/40 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 select-none">
    <h2 class="text-2xl sm:text-3xl font-black text-gold-light mb-1">
      طاولتك جاهزة 🎉
    </h2>
    <p class="text-xs text-emerald-300/80 mb-3">اختر مقعدك واضبط إعدادات المجلس</p>

    <!-- Room Code Line -->
    <div class="flex items-center gap-2 p-2 px-4 rounded-full bg-black/60 border border-white/15 my-1">
      <span class="text-xs text-gray-300">كود الطاولة:</span>
      <b class="text-lg font-mono tracking-widest text-amber-300">{{ game.roomCode }}</b>
      <button
        class="ml-2 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 font-bold border border-amber-400/40 transition-colors"
        @click="copyLink"
      >
        {{ copied ? 'تم النسخ ✅' : '📋 نسخ الرابط' }}
      </button>
    </div>

    <!-- 4 Seat Slots Grid -->
    <div class="grid grid-cols-2 gap-3 w-full my-4">
      <div
        v-for="(slot, i) in game.lobbySeats"
        :key="i"
        class="p-3 rounded-2xl border-2 flex flex-col items-center justify-center min-h-[90px] cursor-pointer transition-all duration-200"
        :class="[
          slot ? (slot.me ? 'border-gold bg-emerald-950/60 shadow-gold-glow' : 'border-white/20 bg-black/50') : 'border-dashed border-white/20 bg-black/20 hover:border-gold/50'
        ]"
        @click="game.pickSeat(i)"
      >
        <div v-if="slot" class="flex flex-col items-center">
          <UiAvatarImg :avatar="slot.avatar" size="sm" :border="slot.me ? 'gold' : 'white'" />
          <span class="font-bold text-xs text-white mt-1 max-w-[100px] truncate">{{ slot.name }}</span>
          <span class="text-[10px] text-gray-400">
            {{ isFFA ? `لاعب ${i + 1}` : (i % 2 === 0 ? 'فريق أزرق 🔵' : 'فريق أحمر 🔴') }}
            {{ slot.isBot ? '🤖' : '' }}
          </span>
          <span v-if="slot.me" class="text-[9px] px-1.5 py-0.2 rounded-full bg-gold/20 text-gold font-black mt-0.5">أنت</span>
        </div>

        <div v-else class="flex flex-col items-center text-gray-400">
          <span class="text-xl mb-0.5">➕</span>
          <span class="text-xs font-bold">مقعد شاغر</span>
          <span class="text-[10px] text-gray-500">
            {{ isFFA ? `لاعب ${i + 1}` : (i % 2 === 0 ? 'فريق أزرق 🔵' : 'فريق أحمر 🔴') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Lobby Config Controls -->
    <div class="w-full space-y-3.5 my-2 text-right">
      <!-- Mode Toggle -->
      <div>
        <label class="block text-xs font-bold text-gray-300 mb-1.5">🎮 وضع اللعب</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            class="py-2 rounded-xl text-xs font-black border transition-all"
            :class="game.lobbyConfig.mode === 'teams' ? 'bg-amber-500 text-black border-yellow-300 shadow-md' : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'"
            @click="game.updateLobbyConfig({ mode: 'teams' })"
          >
            🤝 جماعي (2 ضد 2)
          </button>
          <button
            class="py-2 rounded-xl text-xs font-black border transition-all"
            :class="game.lobbyConfig.mode === 'ffa' ? 'bg-amber-500 text-black border-yellow-300 shadow-md' : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'"
            @click="game.updateLobbyConfig({ mode: 'ffa' })"
          >
            🎯 فردي (4 لاعبين)
          </button>
        </div>
      </div>

      <!-- Atmosphere / Theme Selector -->
      <div>
        <label class="block text-xs font-bold text-gray-300 mb-1.5">🏛️ مظهر وبيئة المجلس</label>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="th in lobbyThemes"
            :key="th.id"
            class="py-2 px-1 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-1"
            :class="game.lobbyConfig.theme === th.id ? 'bg-amber-500 text-black border-yellow-300 shadow-sm font-black' : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'"
            @click="selectTheme(th.id)"
          >
            <span class="text-base">{{ th.icon }}</span>
            <span class="truncate max-w-full">{{ th.name }}</span>
          </button>
        </div>
      </div>

      <!-- Bot Difficulty Selector -->
      <div>
        <label class="block text-xs font-bold text-gray-300 mb-1.5">🧠 مستوى ذكاء البوتات</label>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="d in botDifficulties"
            :key="d.id"
            class="py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5"
            :class="(game.lobbyConfig.difficulty || 'pro') === d.id ? 'bg-amber-500 text-black border-yellow-300 shadow-sm font-black' : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'"
            @click="game.updateLobbyConfig({ difficulty: d.id })"
          >
            <span class="text-base">{{ d.icon }}</span>
            <span class="truncate">{{ d.label }}</span>
          </button>
        </div>
      </div>

      <!-- Target Score Selector -->
      <div>
        <label class="block text-xs font-bold text-gray-300 mb-1.5">🏁 هدف الجلسة</label>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="t in [0, 500, 1000, 2000]"
            :key="t"
            class="py-1.5 rounded-lg text-xs font-bold border transition-all"
            :class="game.lobbyConfig.target === t ? 'bg-amber-500 text-black border-yellow-300 shadow-sm' : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'"
            @click="game.updateLobbyConfig({ target: t })"
          >
            {{ t === 0 ? 'كل جولة' : t }}
          </button>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <button
      class="w-full py-3.5 mt-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-lg shadow-gold-glow hover:scale-102 transition-transform active:scale-98"
      @click="game.startGame"
    >
      🎬 ابدأ اللعب
    </button>
    <p class="text-[11px] text-gray-400 mt-2">البوتات تكمّل المقاعد الشاغرة تلقائياً بشخصيات ديوانية تفاعلية 🤖</p>

    <!-- Leave Lobby Button -->
    <button
      class="mt-3 text-xs text-red-300/80 hover:text-red-300 font-bold"
      @click="game.leaveRoom"
    >
      🚪 مغادرة الردهة
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '~/stores/game'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const ui = useUiStore()

const copied = ref(false)
const isFFA = computed(() => game.lobbyConfig.mode === 'ffa')

const lobbyThemes = [
  { id: 1, name: 'نجد', icon: '🏛️' },
  { id: 2, name: 'الصمان', icon: '⛺' },
  { id: 3, name: 'دبي', icon: '🌃' },
  { id: 4, name: 'البلد', icon: '☕' },
]

const botDifficulties = [
  { id: 'casual', label: 'مبتدئ', icon: '🐣' },
  { id: 'pro', label: 'محترف', icon: '⚔️' },
  { id: 'legend', label: 'الذيب', icon: '🐺' },
]

function selectTheme(themeId: number) {
  ui.setTheme(themeId)
  game.updateLobbyConfig({ theme: themeId })
}

function copyLink() {
  const url = `${window.location.origin}/?room=${game.roomCode}`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
    ui.showToast('تم نسخ رابط الدعوة 📋')
  } else {
    ui.showToast(`الكود: ${game.roomCode}`)
  }
}
</script>
