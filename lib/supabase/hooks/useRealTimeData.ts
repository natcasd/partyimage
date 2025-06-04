"use client"
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type PostgresChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeDataOptions<T> {
  tableName: string
  fetchData: () => Promise<T[]>
  filter?: string
  channelName?: string
  minRefetchInterval?: number
  eventType?: PostgresChangesEvent
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
  minRefetchInterval = 1000,
  eventType = '*'
}: UseRealtimeDataOptions<T>): UseRealtimeDataReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchTime = useRef<number>(0)
  const pendingRefetch = useRef<NodeJS.Timeout | null>(null)

  console.log("useRealtimeData called")

  const executeRefetch = async () => {
    console.log("executeRefetch called")
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
      executeRefetch()
    } else {
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
    console.log('base useeffect triggered')
    executeRefetch()

    // Derive an event-specific channel suffix
    const eventSuffix = eventType === '*' ? 'all' : eventType.toLowerCase()
    const derivedChannelName = channelName || `realtime_${tableName}_${eventSuffix}`

    const channel = supabase.channel(derivedChannelName)

    if (eventType === 'INSERT') {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName, ...(filter && { filter }) },
        (payload) => {
          console.log(`[${tableName}] INSERT detected`, payload)
          throttledRefetch()
        }
      )
    } else if (eventType === 'UPDATE') {
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: tableName, ...(filter && { filter }) },
        (payload) => {
          console.log(`[${tableName}] UPDATE detected`, payload)
          throttledRefetch()
        }
      )
    } else if (eventType === 'DELETE') {
      channel.on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: tableName, ...(filter && { filter }) },
        (payload) => {
          console.log(`[${tableName}] DELETE detected`, payload)
          throttledRefetch()
        }
      )
    } else {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName, ...(filter && { filter }) },
        (payload) => {
          console.log(`[${tableName}] Change detected (${payload.eventType})`, payload)
          throttledRefetch()
        }
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (pendingRefetch.current) {
        clearTimeout(pendingRefetch.current)
      }
    }
  }, [tableName, filter, channelName, minRefetchInterval, eventType])

  return {
    data,
    loading,
    error,
    refetch: executeRefetch
  }
}
