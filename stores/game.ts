import { defineStore } from 'pinia'
import { useAudioStore } from './audio'
import { useUiStore } from './ui'
import { useAuthStore, type UserAccount } from './auth'

export interface CardData {
  id?: string
  r: string
  s: string
  j?: boolean
}

export interface SeatData {
  i: number
  name: string
  avatar: string
  isBot: boolean
  bot: boolean
  team: number
  bubble?: { text: string; at: number } | null
  reaction?: { emoji: string; at: number } | null
  connected: boolean
  rank?: string
}

export interface PileData {
  chain: { rank: string; count: number; jokers: number; suit?: string } | null
  buriedCount: number
}

export interface LobbySeat {
  j: number
  name: string
  avatar: string
  isBot: boolean
  me: boolean
}

export interface LobbyConfig {
  mode: 'teams' | 'ffa'
  target: number
  theme: number
  difficulty?: 'casual' | 'pro' | 'legend'
}

export interface RoundResult {
  mode: 'teams' | 'ffa'
  target: number
  matchOver: boolean
  scores: { n: number; j: number; total: number }[]
  teams?: [number, number]
  winnerTeam?: number
  winnerSeat?: number
  session: number[]
  roundsWon: number[]
  deltas?: number[]
}

export interface GameEvent {
  kind: string
  seat?: number
  rank?: string
  count?: number
  jokers?: number
  victims?: number[]
  fieldN?: number
  cardId?: string
  cardJoker?: boolean
  joker?: boolean
  prevOwner?: number
  text?: string
  seq?: number
}

export interface ActiveSession {
  code: string
  mode: 'teams' | 'ffa'
  target: number
  theme: number
  round: number
  deck: number
  players: { i: number; name: string; isBot: boolean; avatar: string }[]
  specs: number
}

export const useGameStore = defineStore('game', () => {
  const audio = useAudioStore()
  const ui = useUiStore()
  const auth = useAuthStore()

  // Screen State
  const currentScreen = ref<'home' | 'lobby' | 'game'>('home')

  // Room & Seats
  const roomCode = ref<string>('')
  const mySeat = ref<number>(-1)
  const isSpec = ref<boolean>(false)
  const lobbySeats = ref<(LobbySeat | null)[]>([null, null, null, null])
  const lobbyConfig = ref<LobbyConfig>({ mode: 'teams', target: 0, theme: 1 })

  // Active Game State
  const round = ref<number>(1)
  const dealer = ref<number>(0)
  const turn = ref<number>(0)
  const phase = ref<'acting' | 'stop' | 'end'>('acting')
  const mode = ref<'teams' | 'ffa'>('teams')
  const target = ref<number>(0)
  const isFinal = ref<boolean>(false)
  const deckCount = ref<number>(424)
  const matchOver = ref<boolean>(false)
  const difficulty = ref<'casual' | 'pro' | 'legend'>('pro')

  const seats = ref<(SeatData | null)[]>([null, null, null, null])
  const field = ref<CardData[]>([])
  const piles = ref<PileData[]>([
    { chain: null, buriedCount: 0 },
    { chain: null, buriedCount: 0 },
    { chain: null, buriedCount: 0 },
    { chain: null, buriedCount: 0 },
  ])
  const handCounts = ref<number[]>([0, 0, 0, 0])
  const myHand = ref<CardData[]>([])
  const myOptions = ref<{
    cards: Record<string, { eats: string[]; discard: boolean }>
    discard: boolean
    pass: boolean
    mustEat: boolean
  }>({ cards: {}, discard: false, pass: false, mustEat: false })

  const selectedCardId = ref<string | null>(null)
  const canStop = ref<boolean>(false)
  const pending = ref<{
    owner: number
    rank: string
    count: number
    stops: number[]
    suit?: string
    hasJoker?: boolean
  } | null>(null)

  const roundResult = ref<RoundResult | null>(null)
  const deadline = ref<number | null>(null)
  const clockSkew = ref<number>(0)
  const logs = ref<{ id: number; text: string; kind: string }[]>([])
  const activeSessions = ref<ActiveSession[]>([])
  const leaderboardList = ref<{ username: string; name: string; avatar: string; pts: number; rank: { emblem: string; name: string } }[]>([])
  const leaderboardMy = ref<{ username: string; name: string; avatar: string; pts: number; rank: { emblem: string; name: string } } | null>(null)

  // Socket reference
  let socket: WebSocket | null = null
  let nextLogId = 1

  function connect() {
    if (!import.meta.client) return
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host || '127.0.0.1:3005'
    socket = new WebSocket(`${proto}://${host}`)

    socket.onopen = () => {
      audio.init()
      send({
        type: 'identify',
        pid: auth.token || auth.pid,
        name: auth.displayName,
        avatar: auth.currentAvatar,
      })

      // If URL has ?room=CODE
      const urlParams = new URLSearchParams(window.location.search)
      const roomParam = urlParams.get('room')
      if (roomParam && !roomCode.value) {
        const code = roomParam.toUpperCase().slice(0, 6)
        setTimeout(() => joinRoom(code), 350)
      }
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleSocketMessage(data)
      } catch (err) {
        console.error('Socket message parse error:', err)
      }
    }

    socket.onclose = () => {
      if (roomCode.value) {
        ui.showToast('⚠️ انقطع الاتصال — إعادة المحاولة...', true)
        setTimeout(connect, 1800)
      }
    }
  }

  function send(msg: Record<string, unknown>) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg))
    }
  }

  function handleSocketMessage(msg: Record<string, any>) {
    switch (msg.type) {
      case 'identity': {
        auth.setPid(msg.pid)
        if (msg.account) {
          auth.setAccount(msg.account)
        }
        break
      }
      case 'auth': {
        if (msg.ok) {
          auth.setAccount(msg.user, msg.token)
          ui.showToast(`أهلاً بك ${msg.user.name} 🌟`, true)
        } else if (msg.loggedOut) {
          auth.setAccount(null, '')
          ui.showToast('تم تسجيل الخروج')
        } else {
          ui.showToast('❌ ' + (msg.err || 'حدث خطأ'), true)
        }
        break
      }
      case 'profile': {
        if (msg.account) auth.setAccount(msg.account)
        break
      }
      case 'leaderboard': {
        leaderboardList.value = msg.list || []
        leaderboardMy.value = msg.my || null
        break
      }
      case 'sessions': {
        activeSessions.value = msg.list || []
        break
      }
      case 'error': {
        ui.showToast('❌ ' + msg.msg, true)
        audio.sfx.ui()
        break
      }
      case 'joined': {
        mySeat.value = msg.seat
        roomCode.value = msg.code
        isSpec.value = false
        currentScreen.value = 'lobby'
        ui.showToast(`انضممت للطاولة ${msg.code} ✅`)
        break
      }
      case 'watched': {
        roomCode.value = msg.code
        mySeat.value = -1
        isSpec.value = true
        currentScreen.value = 'game'
        ui.showToast(`👁️ تشاهد الآن جلسة ${msg.code}`)
        break
      }
      case 'lobby': {
        roomCode.value = msg.code
        lobbyConfig.value = msg.config || lobbyConfig.value
        lobbySeats.value = msg.seats || [null, null, null, null]
        const foundMe = msg.seats?.findIndex((s: LobbySeat | null) => s && s.me)
        if (foundMe !== undefined && foundMe >= 0) mySeat.value = foundMe
        break
      }
      case 'state': {
        const s = msg.s
        if (s.now) clockSkew.value = Date.now() - s.now
        roomCode.value = s.room
        mySeat.value = s.seat
        isSpec.value = !!s.isSpec
        mode.value = s.mode
        target.value = s.target
        round.value = s.round
        dealer.value = s.dealer
        turn.value = s.turn
        phase.value = s.phase
        isFinal.value = s.isFinal
        deckCount.value = s.deckCount
        matchOver.value = s.matchOver
        deadline.value = s.deadline
        seats.value = s.seats
        field.value = s.field
        piles.value = s.piles
        handCounts.value = s.handCounts
        myHand.value = s.myHand || []
        myOptions.value = s.myOptions || { cards: {}, discard: false, pass: false, mustEat: false }
        canStop.value = s.canStop
        pending.value = s.pending
        roundResult.value = s.result

        if (s.theme && !localStorage.getItem('majabid.themePref')) {
          ui.theme = s.theme
        }
        if (s.difficulty) difficulty.value = s.difficulty
        currentScreen.value = 'game'

        // Process incoming events
        if (msg.events && msg.events.length) {
          msg.events.forEach((ev: GameEvent) => handleGameEvent(ev))
        }

        // Auto select valid card if my turn
        if (isMyTurn.value && (!selectedCardId.value || !myHand.value.some(c => c.id === selectedCardId.value))) {
          const firstEatable = myHand.value.find(c => myOptions.value.cards[c.id!]?.eats?.length > 0)
          const firstPlayable = firstEatable || myHand.value.find(c => myOptions.value.cards[c.id!]?.discard) || myHand.value[0]
          if (firstPlayable) selectedCardId.value = firstPlayable.id!
        }
        break
      }
    }
  }

  function handleGameEvent(ev: GameEvent) {
    let logText = ev.text || ''
    const seatName = (s?: number) => (s !== undefined && seats.value[s]?.name) ? seats.value[s]!.name : `لاعب ${((s || 0) + 1)}`

    if (!logText && ev.kind) {
      switch (ev.kind) {
        case 'eat':
          logText = `${seatName(ev.seat)} كنس ${ev.rank} (${ev.count} ورقات${ev.jokers ? ` + ${ev.jokers} جوكر 🃏` : ''})`
          break
        case 'jokerEat':
          logText = `🃏 ${seatName(ev.seat)} لعب جوكر وأكل ${ev.rank}!`
          break
        case 'stop':
          logText = `⛔ ${seatName(ev.seat)} صرخ «وقّف!» وخطف ${ev.rank}!`
          break
        case 'jokerStop':
          logText = `⛔ 🃏 ${seatName(ev.seat)} خطف الأكلة بجوكر!`
          break
        case 'discard':
          logText = `${seatName(ev.seat)} رمى ${ev.rank} للميدان`
          break
        case 'pass':
          logText = `${seatName(ev.seat)} تجاوز`
          break
        case 'flip':
          logText = `الكل وقف — انقلبت ${ev.rank} للميدان`
          break
        case 'skip':
          logText = `${seatName(ev.seat)} يده فاضية — انتقز`
          break
      }
    }

    if (logText) {
      logs.value.unshift({ id: nextLogId++, text: logText, kind: ev.kind })
      if (logs.value.length > 50) logs.value.pop()
    }

    // Play sounds
    switch (ev.kind) {
      case 'eat':
        audio.sfx.eat()
        break
      case 'jokerEat':
        audio.sfx.joker()
        break
      case 'stop':
      case 'jokerStop':
        audio.sfx.stop()
        break
      case 'discard':
        audio.sfx.discard()
        break
      case 'flip':
        audio.sfx.flip()
        break
      case 'chat':
        audio.sfx.chat()
        break
    }
  }

  // Actions
  function quickPlay() {
    audio.sfx.ui()
    send({ type: 'quick' })
  }

  function createRoom() {
    audio.sfx.ui()
    send({ type: 'create' })
  }

  function joinRoom(code: string) {
    audio.sfx.ui()
    send({ type: 'join', code: code.toUpperCase().trim() })
  }

  function watchRoom(code: string) {
    audio.sfx.ui()
    send({ type: 'watch', code: code.toUpperCase().trim() })
  }

  function pickSeat(idx: number) {
    audio.sfx.ui()
    send({ type: 'seat', idx })
  }

  function updateLobbyConfig(cfg: Partial<LobbyConfig>) {
    audio.sfx.ui()
    send({ type: 'config', ...cfg })
  }

  function startGame() {
    audio.sfx.ui()
    send({ type: 'start' })
  }

  function playCard(action: 'eat' | 'discard' | 'pass' | 'stop', cardId?: string, rank?: string) {
    audio.sfx.ui()
    send({
      type: 'act',
      action,
      card: cardId || selectedCardId.value,
      rank,
    })
  }

  function playEat(cardId: string, rank: string) {
    playCard('eat', cardId, rank)
  }

  function sendChat(text: string) {
    audio.sfx.chat()
    send({ type: 'chat', text })
  }

  function sendReaction(emoji: string) {
    audio.sfx.emoji()
    send({ type: 'reaction', emoji })
  }

  function leaveRoom() {
    audio.sfx.ui()
    send({ type: 'leave' })
    currentScreen.value = 'home'
    roomCode.value = ''
    mySeat.value = -1
    isSpec.value = false
  }

  function nextRound() {
    audio.sfx.ui()
    send({ type: 'nextround' })
  }

  function rematch() {
    audio.sfx.ui()
    send({ type: 'rematch' })
  }

  function fetchSessions() {
    send({ type: 'sessions' })
  }

  function fetchLeaderboard() {
    send({ type: 'leaderboard' })
  }

  function fetchProfile() {
    send({ type: 'profile' })
  }

  const isMyTurn = computed(() => {
    return phase.value === 'acting' && turn.value === mySeat.value && !isSpec.value
  })

  return {
    currentScreen,
    roomCode,
    mySeat,
    isSpec,
    lobbySeats,
    lobbyConfig,
    round,
    dealer,
    turn,
    phase,
    mode,
    target,
    difficulty,
    isFinal,
    deckCount,
    matchOver,
    seats,
    field,
    piles,
    handCounts,
    myHand,
    myOptions,
    selectedCardId,
    canStop,
    pending,
    roundResult,
    deadline,
    clockSkew,
    logs,
    activeSessions,
    leaderboardList,
    leaderboardMy,
    isMyTurn,
    connect,
    send,
    quickPlay,
    createRoom,
    joinRoom,
    watchRoom,
    pickSeat,
    updateLobbyConfig,
    startGame,
    playCard,
    playEat,
    sendChat,
    sendReaction,
    leaveRoom,
    nextRound,
    rematch,
    fetchSessions,
    fetchLeaderboard,
    fetchProfile,
  }
})
