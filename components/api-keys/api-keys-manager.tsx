'use client'

import { useState } from 'react'
import { getUserApiKeys, saveApiKey, deleteApiKey } from '@/lib/supabase/services/api-keys'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ApiKey } from '@/lib/supabase/types'

interface ApiKeysManagerProps {
  user: { id: string }
}

export function ApiKeysManager({ user }: ApiKeysManagerProps) {
  const [selectedService, setSelectedService] = useState<string>('')
  const [newKey, setNewKey] = useState('')
  const [keys, setKeys] = useState<Omit<ApiKey, 'key_value'>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadKeys = async () => {
    try {
      const keys = await getUserApiKeys(supabase, user.id)
      setKeys(keys)
    } catch (error) {
      console.error('Failed to load API keys:', error)
      setError('Failed to load API keys')
    }
  }

  const handleSave = async () => {
    if (!selectedService || !newKey) return

    setLoading(true)
    setError(null)

    try {
      await saveApiKey(supabase, user.id, selectedService, newKey)
      setNewKey('')
      await loadKeys()
    } catch (error) {
      console.error('Failed to save API key:', error)
      setError('Failed to save API key')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serviceName: string) => {
    setLoading(true)
    setError(null)

    try {
      await deleteApiKey(supabase, user.id, serviceName)
      await loadKeys()
    } catch (error) {
      console.error('Failed to delete API key:', error)
      setError('Failed to delete API key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">API Keys</h2>
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      
      <div className="flex gap-2">
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="stability">Stability AI</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="password"
          placeholder="Enter API key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSave} disabled={loading || !selectedService || !newKey}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="space-y-2">
        {keys.map((key) => (
          <div key={key.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{key.service_name}</p>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(key.updated_at).toLocaleString()}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(key.service_name)}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 