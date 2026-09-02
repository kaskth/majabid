<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="relative w-full max-w-lg p-6 rounded-3xl bg-[#0f241a] border border-gold/40 shadow-gold-glow flex flex-col items-center max-h-[90vh] overflow-y-auto no-scrollbar text-center">
      <!-- Title -->
      <h2 class="text-2xl font-black text-gold-light mb-1 flex items-center gap-2">
        <span>🏆</span>
        <span>الصدارة العالمية</span>
      </h2>
      <p class="text-xs text-emerald-300/80 mb-4">🎁 توزيع جوائز الأسبوع للمتصدرين قريباً</p>

      <!-- Podium Top 3 (🥈 1st in center, 2nd on left, 3rd on right) -->
      <div v-if="topThree.length > 0" class="flex items-end justify-center gap-3 w-full my-3">
        <!-- 2nd Place -->
        <div v-if="topThree[1]" class="flex-1 flex flex-col items-center p-3 rounded-2xl bg-black/40 border border-slate-300/30">
          <span class="text-xl mb-1">🥈</span>
          <UiAvatarImg :avatar="topThree[1].avatar" size="md" border="silver" />
          <span class="font-bold text-xs text-white mt-1 truncate max-w-[80px]">{{ topThree[1].name }}</span>
          <span class="text-[11px] text-amber-300 font-mono">{{ topThree[1].pts }} ⚡</span>
          <div class="w-full h-8 bg-slate-700/60 rounded-t-lg mt-2 flex items-center justify-center font-black text-sm text-slate-300">2</div>
        </div>

        <!-- 1st Place (Center & Highest) -->
        <div v-if="topThree[0]" class="flex-1 flex flex-col items-center p-3 rounded-2xl bg-black/60 border border-gold shadow-gold-glow -translate-y-2">
          <span class="text-2xl mb-1 animate-bounce">🥇</span>
          <UiAvatarImg :avatar="topThree[0].avatar" size="lg" border="gold" />
          <span class="font-black text-sm text-gold-light mt-1 truncate max-w-[90px]">{{ topThree[0].name }}</span>
          <span class="text-xs text-amber-300 font-mono font-bold">{{ topThree[0].pts }} ⚡</span>
          <div class="w-full h-12 bg-gradient-to-t from-amber-600 to-yellow-500 text-black rounded-t-lg mt-2 flex items-center justify-center font-black text-base shadow">1</div>
        </div>

        <!-- 3rd Place -->
        <div v-if="topThree[2]" class="flex-1 flex flex-col items-center p-3 rounded-2xl bg-black/40 border border-amber-700/30">
          <span class="text-xl mb-1">🥉</span>
          <UiAvatarImg :avatar="topThree[2].avatar" size="md" border="white" />
          <span class="font-bold text-xs text-white mt-1 truncate max-w-[80px]">{{ topThree[2].name }}</span>
          <span class="text-[11px] text-amber-300 font-mono">{{ topThree[2].pts }} ⚡</span>
          <div class="w-full h-6 bg-amber-900/60 rounded-t-lg mt-2 flex items-center justify-center font-black text-sm text-amber-500">3</div>
        </div>
      </div>

      <!-- Rest of list -->
      <div class="w-full flex flex-col gap-2 my-3">
        <div
          v-for="(player, idx) in restOfList"
          :key="player.username"
          class="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10"
        >
          <div class="flex items-center gap-2">
            <span class="w-6 font-bold text-gray-400 text-xs">{{ idx + 4 }}</span>
            <UiAvatarImg :avatar="player.avatar" size="sm" />
            <span class="font-bold text-sm text-white">{{ player.name }}</span>
            <span class="text-xs">{{ player.rank?.emblem }}</span>
          </div>
          <span class="font-mono font-bold text-amber-300 text-sm">{{ player.pts }} ⚡</span>
        </div>
      </div>

      <!-- Close Button -->
      <button
        class="mt-4 px-8 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-105 transition-transform"
        @click="ui.closeModal"
      >
        إغلاق
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameStore } from '~/stores/game'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const ui = useUiStore()

onMounted(() => {
  game.fetchLeaderboard()
})

const topThree = computed(() => game.leaderboardList.slice(0, 3))
const restOfList = computed(() => game.leaderboardList.slice(3))
</script>
