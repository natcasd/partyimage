'use client'
import { useProcessNewPrompts } from '@/lib/supabase/hooks/useProcessNewPrompts'

interface Props {
  sessionId: string
}

export function ProcessPromptsClient({ sessionId }: Props) {
  console.log("process prompts client rerendering")
  const { error } = useProcessNewPrompts(sessionId)

  if (error) console.error('Error processing prompts:', error)

  return null
} 