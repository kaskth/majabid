import { ref } from 'vue'

export interface CardFlightEvent {
  type: 'deal' | 'discard' | 'eat' | 'stop' | 'flip'
  seatIndex?: number
  rank?: string
  suit?: string
  joker?: boolean
  count?: number
}

const flightEvents = ref<CardFlightEvent[]>([])

export function useCardAnimation() {
  function triggerFlight(ev: CardFlightEvent) {
    flightEvents.value.push(ev)
  }

  function popFlight(): CardFlightEvent | undefined {
    return flightEvents.value.shift()
  }

  return {
    flightEvents,
    triggerFlight,
    popFlight,
  }
}
