import { useRealtimeData } from './useRealTimeData'
import { getSessionPrompts } from '@/lib/supabase/services/prompts'
import type { Prompt } from '@/lib/supabase/types'

export function useSessionPrompts(
  sessionId: string, 
  status?: string, 
  minRefetchInterval?: number
) {
  return useRealtimeData<Prompt>({
    tableName: 'prompts',
    fetchData: () => getSessionPrompts(sessionId, status),
    filter: `session_id=eq.${sessionId}`,
    channelName: `prompts_session_${sessionId}${status ? `_${status}` : ''}`,
    minRefetchInterval
  })
}