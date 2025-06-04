import { useRealtimeData } from './useRealTimeData'
import { getSessionImages } from '@/lib/supabase/services/images'
import type { Image } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

export function useSessionImages(sessionId: string) {
  const supabase = createClient()
  const { 
    data: images, 
    loading, 
    error,
    refetch 
  } = useRealtimeData<Image>({
    tableName: 'images',
    fetchData: () => getSessionImages(supabase, sessionId),
    filter: `session_id=eq.${sessionId}`,
    channelName: `images_session_${sessionId}`,
    minRefetchInterval: 500,
    eventType: '*'
  })

  return {
    images,
    loading,
    error,
    refetch
  }
} 