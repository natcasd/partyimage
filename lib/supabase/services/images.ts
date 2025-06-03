import { createClient } from '@/lib/supabase/client'
import type { Image } from '@/lib/supabase/types'

// ==================== IMAGE FUNCTIONS ====================

// Save generated image
export async function saveGeneratedImage(sessionId: string, promptId: string, imageUrl: string): Promise<Image> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('images')
    .insert({
      session_id: sessionId,
      prompt_id: promptId,
      image_url: imageUrl
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Image
}

// Get images for session (for party screen display)
export async function getSessionImages(sessionId: string, limit?: number): Promise<Image[]> {
  const supabase = createClient()
  let query = supabase
    .from('images')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Image[]
}

// Get latest images for session (for real-time display)
export async function getLatestSessionImages(sessionId: string, count: number = 10): Promise<Image[]> {
  return getSessionImages(sessionId, count)
}

// Get image by ID
export async function getImageById(imageId: string): Promise<Image | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', imageId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as Image | null
}

// Get image by prompt ID
export async function getImageByPromptId(promptId: string): Promise<Image | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('prompt_id', promptId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as Image | null
}

// Get recent images across all sessions (for admin/stats)
export async function getRecentImages(limit: number = 50): Promise<Image[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Image[]
}

// Delete image
export async function deleteImage(imageId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId)
  
  if (error) throw error
}

// Update image URL (in case you need to update after processing)
export async function updateImageUrl(imageId: string, imageUrl: string): Promise<Image> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('images')
    .update({ image_url: imageUrl })
    .eq('id', imageId)
    .select()
    .single()
  
  if (error) throw error
  return data as Image
}

// Get images with their associated prompts (for detailed view)
export async function getSessionImagesWithPrompts(sessionId: string, limit?: number): Promise<(Image & { prompt?: { prompt_text: string } })[]> {
  const supabase = createClient()
  let query = supabase
    .from('images')
    .select(`
      *,
      prompts:prompt_id (
        prompt_text
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as (Image & { prompt?: { prompt_text: string } })[]
}

// Count images for session
export async function getSessionImageCount(sessionId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
  
  if (error) throw error
  return count || 0
}