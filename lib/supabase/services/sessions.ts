import { createClient } from '@/lib/supabase/client'
import type { Session } from '@/lib/supabase/types'

// ==================== SESSION FUNCTIONS ====================

// Create new party session
export async function createSession(userId: string, name?: string): Promise<Session> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      name: name || null,
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Session
}

// Get user's sessions (for party host dashboard)
export async function getUserSessions(userId: string, activeOnly: boolean = false): Promise<Session[]> {
  const supabase = createClient()
  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (activeOnly) {
    query = query.eq('is_active', true)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Session[]
}

// Get session by ID (for public party screen)
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as Session | null
}

// Update session
export async function updateSession(sessionId: string, updates: {
  name?: string
  is_active?: boolean
}): Promise<Session> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data as Session
}

// End party session
export async function endSession(sessionId: string): Promise<Session> {
  return updateSession(sessionId, { is_active: false })
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
  
  if (error) throw error
}

// Check if session is active and accepting prompts
export async function isSessionActive(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId)
  return session?.is_active || false
}