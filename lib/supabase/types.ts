// ==================== DATABASE TYPES ====================

export interface Session {
  id: string
  name: string | null
  description: string | null
  user_id: string | null
  created_at: string
  is_active: boolean
}

export interface ApiKey {
  id: string
  user_id: string
  service_name: string
  key_value: string
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  session_id: string
  prompt_text: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface Image {
  id: string
  session_id: string
  prompt_id: string
  storage_path: string
  created_at: string
}

// ==================== UTILITY TYPES ====================

export interface SessionStats {
  totalPrompts: number
  completedImages: number
  pendingPrompts: number
  failedPrompts: number
}

export interface SessionWithData {
  session: Session | null
  recentImages: Image[]
  pendingPrompts: number
}

// ==================== CONSTANTS ====================

export const SERVICE_NAMES = {
  OPENAI: 'openai',
  MIDJOURNEY: 'midjourney',
  STABILITY_AI: 'stability_ai',
  REPLICATE: 'replicate',
  LEONARDO: 'leonardo'
} as const

export type ServiceName = typeof SERVICE_NAMES[keyof typeof SERVICE_NAMES]