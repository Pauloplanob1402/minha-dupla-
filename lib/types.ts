export type IntentChoice = 'jogar' | 'estudar' | 'projeto'

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
