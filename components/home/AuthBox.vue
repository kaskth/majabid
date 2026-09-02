<template>
  <div class="w-full max-w-lg p-5 rounded-3xl bg-black/45 backdrop-blur-md border border-white/10 shadow-lg flex flex-col text-right">
    <!-- Tabs Header -->
    <div class="grid grid-cols-2 gap-2 mb-4 p-1 rounded-2xl bg-black/50 border border-white/10">
      <button
        class="py-2 rounded-xl text-xs font-bold transition-all"
        :class="activeTab === 'login' ? 'bg-amber-500 text-black shadow-md font-black' : 'text-gray-400 hover:text-white'"
        @click="activeTab = 'login'"
      >
        🔑 تسجيل الدخول
      </button>
      <button
        class="py-2 rounded-xl text-xs font-bold transition-all"
        :class="activeTab === 'register' ? 'bg-amber-500 text-black shadow-md font-black' : 'text-gray-400 hover:text-white'"
        @click="activeTab = 'register'"
      >
        ✨ حساب جديد
      </button>
    </div>

    <!-- Login Form -->
    <form v-if="activeTab === 'login'" class="flex flex-col gap-3" @submit.prevent="handleLogin">
      <div>
        <input
          v-model="loginUser"
          type="text"
          dir="ltr"
          maxlength="16"
          placeholder="@ اسم المستخدم"
          class="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold/80"
          required
        />
      </div>
      <div>
        <input
          v-model="loginPass"
          type="password"
          dir="ltr"
          maxlength="32"
          placeholder="كلمة المرور"
          class="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold/80"
          required
        />
      </div>
      <button
        type="submit"
        class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm shadow-md hover:scale-102 transition-transform"
      >
        دخول الحساب
      </button>
    </form>

    <!-- Register Form -->
    <form v-else class="flex flex-col gap-3" @submit.prevent="handleRegister">
      <div>
        <input
          v-model="regUser"
          type="text"
          dir="ltr"
          maxlength="16"
          placeholder="@ اسم مستخدم جديد (3-16 حرف)"
          class="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold/80"
          required
        />
      </div>
      <div>
        <input
          v-model="regPass"
          type="password"
          dir="ltr"
          maxlength="32"
          placeholder="كلمة مرور قوية (4+ أحرف)"
          class="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold/80"
          required
        />
      </div>
      <button
        type="submit"
        class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-md hover:scale-102 transition-transform"
      >
        إنشاء الحساب وحفظ النقاط
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

const game = useGameStore()
const auth = useAuthStore()
const ui = useUiStore()

const activeTab = ref<'login' | 'register'>('login')
const loginUser = ref('')
const loginPass = ref('')
const regUser = ref('')
const regPass = ref('')

function handleLogin() {
  if (!loginUser.value || !loginPass.value) {
    ui.showToast('أدخل اسم المستخدم وكلمة المرور', true)
    return
  }
  game.send({
    type: 'login',
    username: loginUser.value.trim(),
    password: loginPass.value,
  })
}

function handleRegister() {
  if (!regUser.value || !regPass.value) {
    ui.showToast('أدخل اسم المستخدم وكلمة المرور', true)
    return
  }
  game.send({
    type: 'register',
    username: regUser.value.trim(),
    password: regPass.value,
    name: auth.guestName || regUser.value.trim(),
    avatar: auth.guestAvatar,
  })
}
</script>
