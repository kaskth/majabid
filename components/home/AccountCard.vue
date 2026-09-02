<template>
  <div class="w-full max-w-lg p-5 rounded-3xl bg-black/55 backdrop-blur-md border border-gold/40 shadow-gold-glow flex flex-col text-right">
    <!-- User Header -->
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div class="flex items-center gap-3">
        <UiAvatarImg :avatar="account?.avatar || 'a1'" size="lg" border="gold" />
        <div class="flex flex-col">
          <span class="font-black text-base sm:text-lg text-white">{{ account?.name }}</span>
          <span class="text-xs font-bold text-amber-300">{{ account?.rank.emblem }} {{ account?.rank.name }}</span>
        </div>
      </div>
      <button
        class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-red-300 font-bold transition-colors"
        @click="logout"
      >
        خروج
      </button>
    </div>

    <!-- Rank Progress Bar -->
    <div class="my-3">
      <div class="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
        <div
          class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
          :style="{ width: `${Math.round((account?.rank.progress || 0) * 100)}%` }"
        />
      </div>
      <div class="flex justify-between items-center text-[10px] text-gray-400 mt-1">
        <span>{{ account?.pts }} ⚡</span>
        <span>{{ account?.rank.nxt ? `الرتبة التالية: ${account.rank.nxt.name} عند ${account.rank.nxt.at}` : 'أعلى رتبة — أسطورة! 🌟' }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-4 gap-2 pt-2 text-center">
      <div class="p-2 rounded-xl bg-black/40 border border-white/10">
        <b class="block font-mono font-black text-amber-300 text-sm sm:text-base">{{ account?.pts }}</b>
        <span class="text-[10px] text-gray-400 font-bold">نقطة</span>
      </div>
      <div class="p-2 rounded-xl bg-black/40 border border-white/10">
        <b class="block font-mono font-black text-white text-sm sm:text-base">{{ account?.matches }}</b>
        <span class="text-[10px] text-gray-400 font-bold">مباراة</span>
      </div>
      <div class="p-2 rounded-xl bg-black/40 border border-white/10">
        <b class="block font-mono font-black text-emerald-400 text-sm sm:text-base">{{ account?.wins }}</b>
        <span class="text-[10px] text-gray-400 font-bold">فوز</span>
      </div>
      <div class="p-2 rounded-xl bg-black/40 border border-white/10">
        <b class="block font-mono font-black text-amber-300 text-sm sm:text-base">{{ account?.best }}</b>
        <span class="text-[10px] text-gray-400 font-bold">أفضل جولة</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useGameStore } from '~/stores/game'

const auth = useAuthStore()
const game = useGameStore()

const account = computed(() => auth.account)

function logout() {
  game.send({ type: 'logout', token: auth.token })
}
</script>
