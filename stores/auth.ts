import { defineStore } from 'pinia'

export interface UserRank {
  name: string
  emblem: string
  at: number
  nxt: { name: string; at: number } | null
  progress: number
}

export interface UserAccount {
  username: string
  name: string
  avatar: string
  pts: number
  matches: number
  wins: number
  best: number
  games: string[]
  rank: UserRank
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const pid = ref<string>('')
  const guestName = ref<string>('')
  const guestAvatar = ref<string>('a1')
  const account = ref<UserAccount | null>(null)

  // Initialize from LocalStorage
  function init() {
    if (import.meta.client) {
      token.value = localStorage.getItem('majabid.token') || ''
      pid.value = localStorage.getItem('majabid.pid') || ''
      guestName.value = localStorage.getItem('majabid.name') || ''
      guestAvatar.value = localStorage.getItem('majabid.avatar') || 'a1'
    }
  }

  function setGuestName(name: string) {
    guestName.value = name.trim().slice(0, 16)
    if (import.meta.client) {
      localStorage.setItem('majabid.name', guestName.value)
    }
  }

  function setGuestAvatar(av: string) {
    guestAvatar.value = av
    if (import.meta.client) {
      localStorage.setItem('majabid.avatar', av)
    }
  }

  function setAccount(acc: UserAccount | null, jwtToken?: string) {
    account.value = acc
    if (jwtToken !== undefined) {
      token.value = jwtToken
      if (import.meta.client) {
        if (jwtToken) localStorage.setItem('majabid.token', jwtToken)
        else localStorage.removeItem('majabid.token')
      }
    }
  }

  function setPid(id: string) {
    pid.value = id
    if (import.meta.client) {
      localStorage.setItem('majabid.pid', id)
    }
  }

  const displayName = computed(() => {
    if (account.value) return account.value.name
    return guestName.value || 'ضيف'
  })

  const currentAvatar = computed(() => {
    if (account.value) return account.value.avatar
    return guestAvatar.value || 'a1'
  })

  const rankEmblem = computed(() => {
    if (account.value) return account.value.rank.emblem
    return '🃏'
  })

  const rankName = computed(() => {
    if (account.value) return account.value.rank.name
    return 'مبتدئ'
  })

  const points = computed(() => {
    if (account.value) return account.value.pts
    return 0
  })

  return {
    token,
    pid,
    guestName,
    guestAvatar,
    account,
    init,
    setGuestName,
    setGuestAvatar,
    setAccount,
    setPid,
    displayName,
    currentAvatar,
    rankEmblem,
    rankName,
    points,
  }
})
