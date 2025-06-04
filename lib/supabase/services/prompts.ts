import { createClient } from '@/lib/supabase/client'
import type { Prompt } from '../types'
import { createImage } from '@/lib/imagegen/createImage'

// Define valid prompt statuses
export type PromptStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ==================== PROMPT FUNCTIONS ====================

// Submit prompt from partygoer
export async function submitPrompt(sessionId: string, promptText: string): Promise<Prompt> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      session_id: sessionId,
      prompt_text: promptText,
      status: 'pending' as PromptStatus
    })
    .select()
    .single()
  await createImage({ promptId: data.id, api: 'openai' })
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

// Update prompt status
export async function updatePromptStatus(promptId: string, status: PromptStatus): Promise<Prompt> {
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