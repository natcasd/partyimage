import { getPromptById, updatePromptStatus } from '@/lib/supabase/services/prompts'
import { getSessionById } from '@/lib/supabase/services/sessions'
import { getApiKeyForService } from '@/lib/supabase/services/api-keys'
import { saveImage } from '@/lib/supabase/services/images'
import { generateWithOpenAI } from '@/lib/imagegen/openai'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function createImage(supabase: SupabaseClient, { promptId, api = 'openai' }: { promptId: string, api?: 'openai' }) {
  try {
    await updatePromptStatus(supabase, promptId, 'processing')

    const prompt = await getPromptById(supabase, promptId)
    if (!prompt) throw new Error('Prompt not found')

    const session = await getSessionById(supabase, prompt.session_id)
    if (!session || !session.user_id) throw new Error('Session or user_id not found')

    const apiKey = await getApiKeyForService(supabase, session.user_id, api)
    if (!apiKey) {
      await updatePromptStatus(supabase, promptId, 'failed')
      throw new Error('No OpenAI API key found for user')
    }

    try {
      const buffer = await generateWithOpenAI(prompt.prompt_text, apiKey)
      await saveImage(supabase, buffer, {
        sessionId: prompt.session_id,
        promptId: prompt.id,
        userId: session.user_id,
        fileExtension: 'png',
      })
      await updatePromptStatus(supabase, promptId, 'completed')
    } catch (err) {
      await updatePromptStatus(supabase, promptId, 'failed')
      throw err
    }
  } catch (err) {
    await updatePromptStatus(supabase, promptId, 'failed')
    throw err
  }
}
