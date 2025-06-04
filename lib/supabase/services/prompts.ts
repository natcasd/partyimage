import type { Prompt } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createImage } from '@/lib/imagegen/createImage'

// Define valid prompt statuses
export type PromptStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ==================== PROMPT FUNCTIONS ====================

// Submit prompt from partygoer
export async function submitPrompt(supabase: SupabaseClient, sessionId: string, promptText: string): Promise<Prompt> {
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      session_id: sessionId,
      prompt_text: promptText,
      status: 'pending' as PromptStatus
    })
    .select()
    .single()
  return data as Prompt
}

// Get prompts for a session (for queue management)
export async function getSessionPrompts(supabase: SupabaseClient, sessionId: string, status?: string): Promise<Prompt[]> {
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

// Update prompt status
export async function updatePromptStatus(supabase: SupabaseClient, promptId: string, status: PromptStatus): Promise<Prompt> {
  const { data, error } = await supabase
    .from('prompts')
    .update({ status })
    .eq('id', promptId)
    .select()
    .single()
  
  if (error) throw error
  return data as Prompt
}

// Get prompt by ID
export async function getPromptById(supabase: SupabaseClient, promptId: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as Prompt | null
}

// Delete prompt
export async function deletePrompt(supabase: SupabaseClient, promptId: string): Promise<void> {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)
  
  if (error) throw error
}