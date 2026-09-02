<template>
  <div class="w-full flex flex-col items-center select-none pt-2">
    <!-- Top Stats Bar -->
    <div class="w-full max-w-lg flex items-center justify-between px-2 mb-4">
      <!-- MMR Points Pill -->
      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-gold/40 shadow-sm">
        <span class="text-base text-amber-400">⚡</span>
        <span class="font-mono font-black text-amber-300 text-sm">{{ auth.points }}</span>
      </div>

      <!-- User Profile Pill -->
      <div
        class="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 shadow-sm cursor-pointer hover:border-gold/50 transition-colors"
        @click="scrollToAccount"
      >
        <div class="flex flex-col text-left leading-none">
          <span class="font-bold text-xs text-white truncate max-w-[100px]">{{ auth.displayName }}</span>
          <span class="text-[10px] text-amber-300/80">{{ auth.rankEmblem }} {{ auth.rankName }}</span>
        </div>
        <UiAvatarImg :avatar="auth.currentAvatar" size="sm" />
      </div>
    </div>

    <!-- 3D Floating Hero Cards -->
    <div class="relative flex items-end justify-center h-28 my-2">
      <!-- Left Card -->
      <div class="w-16 h-24 -rotate-12 translate-x-3 translate-y-1 shadow-2xl rounded-xl overflow-hidden z-10">
        <GameCard rank="K" suit="♥" />
      </div>
      <!-- Center Card -->
      <div class="w-20 h-28 shadow-2xl rounded-xl overflow-hidden z-20 -translate-y-2">
        <GameCard :joker="true" />
      </div>
      <!-- Right Card -->
      <div class="w-16 h-24 rotate-12 -translate-x-3 translate-y-1 shadow-2xl rounded-xl overflow-hidden z-10 animate-float">
        <GameCard rank="A" suit="♠" />
      </div>
    </div>

    <!-- Game Title -->
    <h1 class="text-4xl sm:text-5xl font-black tracking-wider bg-gradient-to-b from-white via-gold-light to-amber-500 bg-clip-text text-transparent drop-shadow-md mt-2">
      مجابيد
    </h1>
    <p class="text-xs sm:text-sm font-bold text-gold-light mt-1">
      ورق المجالس... كِل ولا تنكِل
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

function scrollToAccount() {
  const el = document.getElementById('account-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>
