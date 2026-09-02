<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
    <div class="relative w-full max-w-lg p-6 rounded-3xl bg-[#0e2319] border border-gold/50 shadow-gold-glow flex flex-col items-center max-h-[90vh] overflow-y-auto no-scrollbar text-center animate-in fade-in zoom-in duration-300">
      <!-- Trophy / Title -->
      <div class="text-5xl mb-2 animate-bounce">
        {{ result?.matchOver ? '👑' : (isMyTeamWinner ? '🏆' : '🥈') }}
      </div>
      <h2 class="text-2xl sm:text-3xl font-black text-gold-light mb-1">
        {{ result?.matchOver ? '🏁 انتهت المباراة!' : (isFFA ? `فاز الجولة: ${winnerName}` : `فاز فريق ${winnerTeamName}`) }}
      </h2>
      <p v-if="result?.matchOver" class="text-xs text-amber-300 font-bold mb-4">
        تُوِّج البطل بعد بلوغ هدف {{ result.target }} نقطة!
      </p>

      <!-- Scores Grid -->
      <div v-if="isFFA" class="grid grid-cols-2 gap-2.5 w-full my-4">
        <div
          v-for="(sc, i) in result?.scores"
          :key="i"
          class="p-3 rounded-2xl border flex flex-col items-center"
          :class="result?.winnerSeat === i ? 'border-gold bg-black/60 shadow-gold-glow' : 'border-white/10 bg-black/40'"
        >
          <span class="font-bold text-xs text-white">{{ game.seats[i]?.name || `لاعب ${i + 1}` }}</span>
          <span class="text-2xl font-black text-amber-300 my-1 font-mono">{{ sc.total }}</span>
          <div class="flex items-center gap-2 text-[10px] text-gray-300">
            <span>👑 {{ sc.n }}×10</span>
            <span>🃏 {{ sc.j }}×50</span>
          </div>
          <span class="text-[11px] text-gray-400 mt-1 font-mono">جلسة: {{ result?.session[i] }}</span>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 w-full my-4">
        <!-- Team Blue -->
        <div
          class="p-3.5 rounded-2xl border flex flex-col items-center"
          :class="result?.winnerTeam === 0 ? 'border-blue-400 bg-blue-950/40 shadow-lg' : 'border-white/10 bg-black/40'"
        >
          <span class="font-black text-sm text-blue-300">الفريق الأزرق 🔵</span>
          <span class="text-3xl font-black text-white my-1 font-mono">{{ result?.teams?.[0] }}</span>
          <div class="w-full mt-2 space-y-1 text-right text-[11px]">
            <div v-for="s in [0, 2]" :key="s" class="flex justify-between items-center text-gray-300">
              <span class="truncate max-w-[80px]">{{ game.seats[s]?.name || `لاعب ${s + 1}` }}</span>
              <span class="font-mono text-amber-300 font-bold">{{ result?.scores[s]?.total }}</span>
            </div>
          </div>
        </div>

        <!-- Team Red -->
        <div
          class="p-3.5 rounded-2xl border flex flex-col items-center"
          :class="result?.winnerTeam === 1 ? 'border-red-400 bg-red-950/40 shadow-lg' : 'border-white/10 bg-black/40'"
        >
          <span class="font-black text-sm text-red-300">الفريق الأحمر 🔴</span>
          <span class="text-3xl font-black text-white my-1 font-mono">{{ result?.teams?.[1] }}</span>
          <div class="w-full mt-2 space-y-1 text-right text-[11px]">
            <div v-for="s in [1, 3]" :key="s" class="flex justify-between items-center text-gray-300">
              <span class="truncate max-w-[80px]">{{ game.seats[s]?.name || `لاعب ${s + 1}` }}</span>
              <span class="font-mono text-amber-300 font-bold">{{ result?.scores[s]?.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Total Banner -->
      <div class="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-gray-300 mb-4">
        <span v-if="!isFFA">
          📊 الجلسة: أزرق {{ result?.session[0] }} · أحمر {{ result?.session[1] }}
          <span v-if="result?.target"> / {{ result.target }}</span>
          · الجولات: {{ result?.roundsWon[0] }} - {{ result?.roundsWon[1] }}
        </span>
        <span v-else>
          📊 الجلسة: {{ result?.session.map((v, i) => `${game.seats[i]?.name || i+1}: ${v}`).join(' · ') }}
        </span>
      </div>

      <!-- Delta Points -->
      <div v-if="myDelta !== null" class="mb-4 text-sm font-black" :class="myDelta >= 0 ? 'text-emerald-400' : 'text-red-400'">
        ⚡ {{ myDelta >= 0 ? `+${myDelta}` : myDelta }} نقطة تنافسية (MMR)
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full">
        <button
          v-if="!result?.matchOver"
          class="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm sm:text-base shadow-gold-glow hover:scale-105 transition-transform"
          @click="startNextRound"
        >
          ➡️ الجولة التالية
        </button>
        <button
          v-else
          class="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm sm:text-base shadow-jade-glow hover:scale-105 transition-transform"
          @click="startRematch"
        >
          🔁 مباراة جديدة
        </button>
        <button
          class="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
          @click="game.leaveRoom"
        >
          🚪 مغادرة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'

const game = useGameStore()

const result = computed(() => game.roundResult)
const isFFA = computed(() => result.value?.mode === 'ffa')

const winnerName = computed(() => {
  if (result.value?.winnerSeat === undefined || result.value.winnerSeat < 0) return 'تعادل'
  return game.seats[result.value.winnerSeat]?.name || `لاعب ${result.value.winnerSeat + 1}`
})

const winnerTeamName = computed(() => {
  if (result.value?.winnerTeam === 0) return 'الأزرق 🔵'
  if (result.value?.winnerTeam === 1) return 'الأحمر 🔴'
  return 'تعادل 🤝'
})

const isMyTeamWinner = computed(() => {
  if (game.mySeat < 0) return false
  if (isFFA.value) return result.value?.winnerSeat === game.mySeat
  return result.value?.winnerTeam === (game.mySeat % 2)
})

const myDelta = computed(() => {
  if (game.mySeat < 0 || !result.value?.deltas) return null
  return result.value.deltas[game.mySeat] ?? null
})

function startNextRound() {
  game.nextRound()
}

function startRematch() {
  game.rematch()
}
</script>
