<template>
  <div>
    <!-- Subtle Red Ambient Vignette on screen edges during Ambush Window -->
    <div
      v-if="game.phase === 'stop' && game.pending"
      class="fixed inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(225,29,72,0.2)_100%)] animate-pulse transition-opacity duration-300"
    />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const game = useGameStore()
</script>