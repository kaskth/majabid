import { defineStore } from 'pinia'

export type ActiveModal = 'leaderboard' | 'store' | 'rules' | 'roundEnd' | 'sessionsSheet' | null
export type ActiveTab = 'home' | 'sessions' | 'leaderboard' | 'store' | 'rules'

export const useUiStore = defineStore('ui', () => {
  const activeModal = ref<ActiveModal>(null)
  const activeTab = ref<ActiveTab>('home')
  const theme = ref<number>(1) // 1: Classic Green, 2: Majlis Red, 3: Royal Midnight
  const toastMessage = ref<string>('')
  const toastIsGold = ref<boolean>(false)
  const isToastVisible = ref<boolean>(false)
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  function init() {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('majabid.themePref')
      if (savedTheme) theme.value = parseInt(savedTheme, 10)
    }
  }

  function setTheme(t: number) {
    theme.value = t
    if (import.meta.client) {
      localStorage.setItem('majabid.themePref', t.toString())
    }
    showToast('🎨 تم تغيير مظهر الطاولة')
  }

  function openModal(modal: ActiveModal) {
    activeModal.value = modal
  }

  function closeModal() {
    activeModal.value = null
  }

  function showToast(msg: string, gold = false) {
    toastMessage.value = msg
    toastIsGold.value = gold
    isToastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      isToastVisible.value = false
    }, 2800)
  }

  return {
    activeModal,
    activeTab,
    theme,
    toastMessage,
    toastIsGold,
    isToastVisible,
    init,
    setTheme,
    openModal,
    closeModal,
    showToast,
  }
})
