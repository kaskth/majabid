<template>
  <div class="relative min-h-[100dvh] bg-[#07130c] text-[#f2f7f3] font-arabic select-none bg-mesh overflow-x-hidden">
    <!-- Visual Canvas Layer -->
    <UiCanvasVfx />

    <!-- Global Toast Notifications -->
    <UiToastNotification />

    <!-- Global Modals -->
    <ModalsLeaderboardModal v-if="ui.activeModal === 'leaderboard'" />
    <ModalsStoreModal v-if="ui.activeModal === 'store'" />
    <ModalsRulesModal v-if="ui.activeModal === 'rules'" />
    <ModalsAtmospheresModal v-if="ui.activeModal === 'atmospheres'" />
    <ModalsCardEffectsModal v-if="ui.activeModal === 'cardEffects'" />
    <ModalsAmbushModal v-if="ui.activeModal === 'ambush'" />
    <ModalsAIPersonsModal v-if="ui.activeModal === 'aiPersons'" />
    <ModalsLiveStatsModal v-if="ui.activeModal === 'liveStats'" />
    <LobbySessionsSheet v-if="ui.activeModal === 'sessionsSheet'" />

    <!-- Main Active View -->
    <main class="relative z-10 w-full min-h-[100dvh] flex flex-col items-center">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAudioStore } from '~/stores/audio'
import { useUiStore } from '~/stores/ui'
import { useGameStore } from '~/stores/game'

const auth = useAuthStore()
const audio = useAudioStore()
const ui = useUiStore()
const game = useGameStore()

onMounted(() => {
  auth.init()
  audio.init()
  ui.init()
  game.connect()

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const themeParam = params.get('theme')
    if (themeParam) {
      ui.setTheme(parseInt(themeParam, 10))
    }
    const deckParam = params.get('deck')
    if (deckParam && ['gold', 'emerald', 'heritage', 'royal'].includes(deckParam)) {
      ui.setDeck(deckParam as any)
    }
    const roomParam = params.get('room')
    if (roomParam) {
      setTimeout(() => game.joinRoom(roomParam), 600)
    } else if (params.get('quick') === '1') {
      const checkInterval = setInterval(() => {
        if (game.currentScreen === 'home') {
          game.quickPlay()
        } else if (game.currentScreen === 'lobby') {
          clearInterval(checkInterval)
          game.startGame()
        } else if (game.currentScreen === 'game') {
          clearInterval(checkInterval)
        }
      }, 300)
    }
  }
})
</script>
