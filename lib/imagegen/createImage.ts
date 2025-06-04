import { getPromptById, updatePromptStatus } from '@/lib/supabase/services/prompts'
import { getSessionById } from '@/lib/supabase/services/sessions'
import { getApiKeyForService } from '@/lib/supabase/services/api-keys'
import { saveImage } from '@/lib/supabase/services/images'
import { generateWithOpenAI } from '@/lib/imagegen/openai'

export async function createImage({ promptId, api = 'openai' }: { promptId: string, api?: 'openai' }) {
  try {
    await updatePromptStatus(promptId, 'processing')

    const prompt = await getPromptById(promptId)
    if (!prompt) throw new Error('Prompt not found')

    const session = await getSessionById(prompt.session_id)
    if (!session || !session.user_id) throw new Error('Session or user_id not found')

    const apiKey = await getApiKeyForService(session.user_id, api)
    if (!apiKey) {
      await updatePromptStatus(promptId, 'failed')
      throw new Error('No OpenAI API key found for user')
    }

    try {
      const buffer = await generateWithOpenAI(prompt.prompt_text, apiKey)
      await saveImage(buffer, {
        sessionId: prompt.session_id,
        promptId: prompt.id,
        userId: session.user_id,
        fileExtension: 'png',
      })
      await updatePromptStatus(promptId, 'completed')
    } catch (err) {
      await updatePromptStatus(promptId, 'failed')
      throw err
    }
  } catch (err) {
    await updatePromptStatus(promptId, 'failed')
    throw err
  }
}
