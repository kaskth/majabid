<template>
  <div class="w-full min-h-screen flex flex-col items-center justify-center">
    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="opacity-0 scale-98"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-98"
    >
      <HomeView v-if="game.currentScreen === 'home'" key="home" />
      <LobbyView v-else-if="game.currentScreen === 'lobby'" key="lobby" />
      <GameView v-else-if="game.currentScreen === 'game'" key="game" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const game = useGameStore()
</script>
