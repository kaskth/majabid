import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', () => {
  const isMuted = ref(false)
  let actx: AudioContext | null = null

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem('majabid.muted')
      if (saved !== null) isMuted.value = JSON.parse(saved)
    }
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (import.meta.client) {
      localStorage.setItem('majabid.muted', JSON.stringify(isMuted.value))
    }
    if (!isMuted.value) playTone(600, 0.08, 'sine', 0.05)
  }

  function getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!actx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) actx = new AudioCtx()
    }
    if (actx && actx.state === 'suspended') {
      actx.resume().catch(() => {})
    }
    return actx
  }

  function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.07, delay = 0) {
    if (isMuted.value) return
    const ctx = getContext()
    if (!ctx) return
    try {
      const t0 = ctx.currentTime + delay
      const osc = ctx.createOscillator()
      const gn = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t0)
      gn.gain.setValueAtTime(0.0001, t0)
      gn.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
      osc.connect(gn)
      gn.connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + duration + 0.05)
    } catch {
      // Fallback
    }
  }

  function playNoise(duration: number, gain = 0.1, freq = 900, delay = 0) {
    if (isMuted.value) return
    const ctx = getContext()
    if (!ctx) return
    try {
      const t0 = ctx.currentTime + delay
      const len = Math.floor(ctx.sampleRate * duration)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2)
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = freq
      const gn = ctx.createGain()
      gn.gain.value = gain
      src.connect(filter)
      filter.connect(gn)
      gn.connect(ctx.destination)
      src.start(t0)
    } catch {
      // Fallback
    }
  }

  // Sound Effects Library
  const sfx = {
    ui() { playTone(540, 0.07, 'sine', 0.04) },
    pick() { playTone(660, 0.05, 'triangle', 0.05) },
    deal() {
      playNoise(0.08, 0.06, 2200)
      playTone(500, 0.07, 'triangle', 0.04)
    },
    slide() {
      playNoise(0.09, 0.07, 1800)
      playTone(420, 0.06, 'sine', 0.03)
    },
    discard() {
      playNoise(0.12, 0.1, 1200)
      playTone(320, 0.09, 'triangle', 0.06)
    },
    eat() {
      playTone(650, 0.09, 'sine', 0.08)
      playTone(870, 0.13, 'sine', 0.07, 0.07)
      playNoise(0.12, 0.06, 800, 0.02)
    },
    tableSlap() {
      playTone(95, 0.15, 'sine', 0.18)
      playNoise(0.14, 0.12, 500)
      playTone(220, 0.1, 'triangle', 0.08, 0.03)
    },
    sweep() {
      playNoise(0.18, 0.08, 1600)
      playTone(580, 0.12, 'sine', 0.06, 0.04)
      playTone(880, 0.15, 'sine', 0.06, 0.1)
    },
    heartbeat() {
      playTone(75, 0.12, 'sine', 0.14)
      playTone(65, 0.14, 'sine', 0.12, 0.15)
    },
    chip() {
      playTone(1800, 0.05, 'triangle', 0.05)
      playTone(2400, 0.07, 'sine', 0.04, 0.04)
    },
    emoji() {
      playTone(850, 0.06, 'sine', 0.06)
      playTone(1200, 0.09, 'triangle', 0.05, 0.05)
    },
    joker() {
      ;[523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.16, 'square', 0.05, i * 0.09))
    },
    stop() {
      playTone(880, 0.12, 'square', 0.09)
      playTone(880, 0.1, 'square', 0.07, 0.16)
      playNoise(0.1, 0.07, 1500)
    },
    flip() {
      playTone(430, 0.09, 'triangle', 0.05)
      playTone(430, 0.09, 'triangle', 0.05, 0.11)
    },
    turn() {
      playTone(760, 0.08, 'sine', 0.05)
      playTone(1020, 0.1, 'sine', 0.04, 0.09)
    },
    win() {
      ;[523, 659, 784, 1047, 1319].forEach((f, i) => playTone(f, 0.22, 'sine', 0.07, i * 0.12))
    },
    lose() {
      ;[392, 330, 262, 196].forEach((f, i) => playTone(f, 0.26, 'sine', 0.07, i * 0.15))
    },
    chat() { playTone(720, 0.06, 'sine', 0.04) },
    ping() {
      playTone(980, 0.1, 'square', 0.07)
      playTone(1240, 0.14, 'square', 0.06, 0.1)
    },
  }

  return {
    isMuted,
    init,
    toggleMute,
    sfx,
  }
})
