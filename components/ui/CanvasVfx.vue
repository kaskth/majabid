<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-[80]"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import confetti from 'canvas-confetti'
import { useGameStore } from '~/stores/game'

const game = useGameStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Watch for match over or victory to shoot celebratory confetti
watch(() => game.phase, (newPhase) => {
  if (newPhase === 'end') {
    shootConfetti()
  }
})

function shootConfetti() {
  if (typeof window === 'undefined') return
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#f5c542', '#ffdf8e', '#17c26b', '#4f8cff', '#ff5a5a', '#ffffff'],
  })
}
</script>
