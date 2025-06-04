import type { ApiKey } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ==================== API KEY FUNCTIONS ====================

// Get API key for a specific service (for using in your app)
export async function getApiKeyForService(supabase: SupabaseClient, userId: string, serviceName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('key_value')
    .eq('user_id', userId)
    .eq('service_name', serviceName)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data?.key_value || null
}

// Save/Update API key
export async function saveApiKey(supabase: SupabaseClient, userId: string, serviceName: string, keyValue: string): Promise<ApiKey> {
  const { data, error } = await supabase
    .from('api_keys')
    .upsert({
      user_id: userId,
      service_name: serviceName,
      key_value: keyValue,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,service_name'
    })
    .select()
    .single()
  
  if (error) throw error
  return data as ApiKey
}

// Get all API keys for a user (excluding actual key values for security)
export async function getUserApiKeys(supabase: SupabaseClient, userId: string): Promise<Omit<ApiKey, 'key_value'>[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, service_name, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Delete API key
export async function deleteApiKey(supabase: SupabaseClient, userId: string, serviceName: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', userId)
    .eq('service_name', serviceName)
  
  if (error) throw error
}

// Check if user has API key for service
export async function hasApiKey(supabase: SupabaseClient, userId: string, serviceName: string): Promise<boolean> {
  const key = await getApiKeyForService(supabase, userId, serviceName)
  return key !== null
}

// Get multiple API keys at once
export async function getApiKeysForServices(supabase: SupabaseClient, userId: string, serviceNames: string[]): Promise<Record<string, string | null>> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('service_name, key_value')
    .eq('user_id', userId)
    .in('service_name', serviceNames)
  
  if (error) throw error
  
  const result: Record<string, string | null> = {}
  serviceNames.forEach(service => {
    const found = data.find(item => item.service_name === service)
    result[service] = found?.key_value || null
  })
  
  return result
}