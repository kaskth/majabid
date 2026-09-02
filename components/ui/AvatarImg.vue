<template>
  <div
    class="relative rounded-full overflow-hidden flex items-center justify-center font-bold select-none border-2 shrink-0 transition-transform duration-200"
    :class="[
      sizeClass,
      borderClass
    ]"
  >
    <img
      v-if="isPng"
      :src="`/avatars/${avatarKey}.png`"
      :alt="avatarKey"
      class="w-full h-full object-cover rounded-full"
      @error="handleImgError"
    />
    <span v-else class="text-xl leading-none">
      {{ avatarKey || '👤' }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    avatar?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    border?: 'gold' | 'silver' | 'white' | 'none'
  }>(),
  {
    avatar: 'a1',
    size: 'md',
    border: 'gold',
  }
)

const avatarKey = ref(props.avatar)
const isPng = computed(() => /^a[1-6]$/.test(avatarKey.value))

watch(() => props.avatar, (newVal) => {
  avatarKey.value = newVal || 'a1'
})

function handleImgError() {
  avatarKey.value = '👤'
}

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-8 h-8 text-sm'
    case 'md': return 'w-10 h-10 text-base'
    case 'lg': return 'w-14 h-14 text-2xl'
    case 'xl': return 'w-20 h-20 text-4xl'
    default: return 'w-10 h-10'
  }
})

const borderClass = computed(() => {
  switch (props.border) {
    case 'gold': return 'border-gold shadow-gold-glow bg-emerald-950'
    case 'silver': return 'border-slate-300 shadow-md bg-slate-900'
    case 'white': return 'border-white/40 bg-black/40'
    case 'none': return 'border-transparent'
    default: return 'border-gold'
  }
})
</script>
