export type IntentChoice = 'jogar' | 'estudar' | 'projeto' | 'silencio'

export type Intention = {
  id: string
  user_id: string
  choice: IntentChoice
  message: string
  status: 'open' | 'matched' | 'expired'
  created_at: string
  display_name: string | null
  city: string | null
}

export type Profile = {
  id: string
  display_name: string | null
  city: string | null
  vibe_points: number
  streak_count: number
  last_connection_date: string | null
  created_at: string
}

export type Room = {
  id: string
  intention_id: string | null
  user_a: string
  user_b: string
  started_at: string
  ends_at: string
  status: 'active' | 'completed' | 'cancelled'
}

export type Message = {
  id: string
  room_id: string
  user_id: string
  content: string
  message_type: 'text' | 'image' | 'video'
  created_at: string
}
