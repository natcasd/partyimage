import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient();

interface UseRealtimeDataOptions<T> {
  tableName: string
  fetchData: () => Promise<T[]>
  filter?: string
  channelName?: string
  minRefetchInterval?: number
}

interface UseRealtimeDataReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRealtimeData<T>({
  tableName,
  fetchData,
  filter,
  channelName,
  minRefetchInterval = 1000
}: UseRealtimeDataOptions<T>): UseRealtimeDataReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchTime = useRef<number>(0)
  const pendingRefetch = useRef<NodeJS.Timeout | null>(null)

  const executeRefetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchData()
      setData(result)
      lastFetchTime.current = Date.now()
    } catch (err: any) {
      setError(err.message || `Failed to load ${tableName} data`)
    } finally {
      setLoading(false)
    }
  }

  const throttledRefetch = () => {
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTime.current

    if (timeSinceLastFetch >= minRefetchInterval) {
      // Enough time has passed, fetch immediately
      executeRefetch()
    } else {
      // Too soon, schedule a fetch for later
      if (pendingRefetch.current) {
        clearTimeout(pendingRefetch.current)
      }
      const remainingTime = minRefetchInterval - timeSinceLastFetch
      console.log(`[${tableName}] Throttling refetch, waiting ${remainingTime}ms`)
      pendingRefetch.current = setTimeout(() => {
        executeRefetch()
      }, remainingTime)
    }
  }

  useEffect(() => {
    // Initial fetch
    executeRefetch()

    // Set up real-time subscription
    const channel = supabase
      .channel(channelName || `realtime_${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`[${tableName}] Database change detected:`, payload.eventType)
          throttledRefetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (pendingRefetch.current) {
        clearTimeout(pendingRefetch.current)
      }
    }
  }, [tableName, filter, channelName, minRefetchInterval])

  return {
    data,
    loading,
    error,
    refetch: executeRefetch
  }
}