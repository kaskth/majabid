<template>
  <div class="relative min-h-screen bg-[#07130c] text-[#f2f7f3] font-arabic overflow-hidden select-none bg-mesh">
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
    <LobbySessionsSheet v-if="ui.activeModal === 'sessionsSheet'" />

    <!-- Main Active View -->
    <main class="relative z-10 w-full min-h-screen flex flex-col justify-center items-center">
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
})
</script>
