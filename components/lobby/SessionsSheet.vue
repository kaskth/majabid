<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="relative w-full max-w-lg p-5 rounded-t-3xl sm:rounded-3xl bg-[#0f241a] border border-white/20 shadow-2xl flex flex-col max-h-[80vh] overflow-y-auto no-scrollbar">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <h3 class="text-lg font-black text-gold-light flex items-center gap-2">
          <span>👥</span>
          <span>الجلسات النشطة والمباشرة</span>
        </h3>
        <button
          class="p-1 rounded-full text-gray-400 hover:text-white"
          @click="ui.closeModal"
        >
          ✕
        </button>
      </div>

      <!-- List -->
      <div v-if="sessions.length > 0" class="flex flex-col gap-2.5">
        <div
          v-for="s in sessions"
          :key="s.code"
          class="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-gold/40 transition-colors"
        >
          <div class="flex items-center gap-3">
            <!-- Avatars in session -->
            <div class="flex -space-x-2 overflow-hidden">
              <div
                v-for="(p, i) in s.players"
                :key="i"
                class="w-7 h-7 rounded-full border border-black overflow-hidden"
              >
                <UiAvatarImg :avatar="p.avatar" size="sm" border="none" />
              </div>
            </div>

            <!-- Details -->
            <div class="flex flex-col text-right">
              <span class="font-bold text-xs text-white">طاولة {{ s.code }}</span>
              <span class="text-[11px] text-gray-400">
                {{ s.mode === 'ffa' ? '🎯 فردي' : '🤝 فريقي' }} · جولة {{ s.round }} · {{ s.specs }} مشاهد
              </span>
            </div>
          </div>

          <!-- Watch Button -->
          <button
            class="px-4 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 text-xs font-bold transition-transform active:scale-95"
            @click="watch(s.code)"
          >
            👁️ شاهد
          </button>
        </div>
      </div>

      <div v-else class="py-12 text-center text-emerald-200/60 font-bold text-sm">
        لا توجد جلسات نشطة حالياً — كن أول من يبدأ طاولة! 🃏
      </div>
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
  game.fetchSessions()
})

const sessions = computed(() => game.activeSessions)

function watch(code: string) {
  game.watchRoom(code)
  ui.closeModal()
}
</script>
