import { useRealtimeData } from './useRealTimeData'
import { getSessionPrompts } from '@/lib/supabase/services/prompts'
import type { Prompt } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

export function useSessionPrompts(sessionId: string, status?: string) {
  const supabase = createClient()
  const { 
    data: prompts, 
    loading, 
    error,
    refetch 
  } = useRealtimeData<Prompt>({
    tableName: 'prompts',
    fetchData: () => getSessionPrompts(supabase, sessionId, status),
    filter: `session_id=eq.${sessionId}`,
    channelName: `prompts_session_${sessionId}`,
    minRefetchInterval: 500,
    eventType: '*'
  })

  return {
    prompts,
    loading,
    error,
    refetch
  }
}