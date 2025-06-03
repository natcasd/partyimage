import { createClient } from '@/lib/supabase/client'
import type { Prompt } from '../types'

// ==================== PROMPT FUNCTIONS ====================

// Submit prompt from partygoer
export async function submitPrompt(sessionId: string, promptText: string): Promise<Prompt> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      session_id: sessionId,
      prompt_text: promptText,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Prompt
}

// Get prompts for a session (for queue management)
export async function getSessionPrompts(sessionId: string, status?: string): Promise<Prompt[]> {
  const supabase = createClient()
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Prompt[]
}

// Get pending prompts (for processing queue)
export async function getPendingPrompts(sessionId?: string): Promise<Prompt[]> {
  const supabase = createClient()
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  
  if (sessionId) {
    query = query.eq('session_id', sessionId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Prompt[]
}

// Get next pending prompt (for queue processing)
export async function getNextPendingPrompt(sessionId?: string): Promise<Prompt | null> {
  const supabase = createClient()
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
  
  if (sessionId) {
    query = query.eq('session_id', sessionId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data?.[0] as Prompt || null
}

// Update prompt status
export async function updatePromptStatus(promptId: string, status: Prompt['status']): Promise<Prompt> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('prompts')
    .update({ status })
    .eq('id', promptId)
    .select()
    .single()
  
  if (error) throw error
  return data as Prompt
}

// Mark prompt as processing
export async function markPromptAsProcessing(promptId: string): Promise<Prompt> {
  return updatePromptStatus(promptId, 'processing')
}

// Mark prompt as completed
export async function markPromptAsCompleted(promptId: string): Promise<Prompt> {
  return updatePromptStatus(promptId, 'completed')
}

// Mark prompt as failed
export async function markPromptAsFailed(promptId: string): Promise<Prompt> {
  return updatePromptStatus(promptId, 'failed')
}

// Get prompt by ID
export async function getPromptById(promptId: string): Promise<Prompt | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as Prompt | null
}

// Delete prompt
export async function deletePrompt(promptId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)
  
  if (error) throw error
}