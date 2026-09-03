import { defineStore } from 'pinia'

export type ActiveModal =
  | 'leaderboard'
  | 'store'
  | 'rules'
  | 'roundEnd'
  | 'sessionsSheet'
  | 'atmospheres'
  | 'cardEffects'
  | 'ambush'
  | 'aiPersons'
  | 'liveStats'
  | null

export type ActiveTab = 'home' | 'sessions' | 'leaderboard' | 'store' | 'rules'
export type DeckType = 'gold' | 'emerald' | 'heritage' | 'royal'

export const useUiStore = defineStore('ui', () => {
  const activeModal = ref<ActiveModal>(null)
  const activeTab = ref<ActiveTab>('home')
  const theme = ref<number>(1) // 1: Najd, 2: Samman, 3: Dubai, 4: Balad
  const activeDeck = ref<DeckType>('gold')
  const toastMessage = ref<string>('')
  const toastIsGold = ref<boolean>(false)
  const isToastVisible = ref<boolean>(false)
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  function init() {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('majabid.themePref')
      if (savedTheme) {
        const val = parseInt(savedTheme, 10)
        if (val >= 1 && val <= 4) theme.value = val
      }

      const savedDeck = localStorage.getItem('majabid.activeDeck') as DeckType
      if (savedDeck && ['gold', 'emerald', 'heritage', 'royal'].includes(savedDeck)) {
        activeDeck.value = savedDeck
      }
    }
  }

  function setTheme(t: number) {
    if (t < 1 || t > 4) t = 1
    theme.value = t
    if (import.meta.client) {
      localStorage.setItem('majabid.themePref', t.toString())
    }
    const names = ['', 'نجد الملكي 🏛️', 'الصمان الليلي ⛺', 'دبي VIP 🌃', 'قهوة البلد ☕']
    showToast(`🎨 البيئة: ${names[t] || t}`)
  }

  function cycleTheme() {
    const next = theme.value >= 4 ? 1 : theme.value + 1
    setTheme(next)
    return next
  }

  function setDeck(d: DeckType) {
    activeDeck.value = d
    if (import.meta.client) {
      localStorage.setItem('majabid.activeDeck', d)
    }
    const names: Record<DeckType, string> = {
      gold: 'طقم الذهب الخالص ✨',
      emerald: 'طقم الزمرد والسدو 🌿',
      heritage: 'طقم التراث الأصيل 🗡️',
      royal: 'طقم الكحلي الملكي 👑',
    }
    showToast(`🃏 طقم الورق: ${names[d] || d}`)
  }

  function openModal(modal: ActiveModal) {
    activeModal.value = modal
  }

  function closeModal() {
    activeModal.value = null
  }

  function setActiveTab(tab: ActiveTab) {
    activeTab.value = tab
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
    activeDeck,
    toastMessage,
    toastIsGold,
    isToastVisible,
    init,
    setTheme,
    cycleTheme,
    setDeck,
    openModal,
    closeModal,
    setActiveTab,
    showToast,
  }
})
