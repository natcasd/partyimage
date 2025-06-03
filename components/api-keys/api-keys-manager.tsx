'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SERVICE_NAMES, type ServiceName } from '@/lib/supabase/types'
import { getUserApiKeys, saveApiKey, deleteApiKey } from '@/lib/supabase/services/api-keys'
import { createClient } from '@/lib/supabase/client'
import { Trash } from 'lucide-react'

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [selectedService, setSelectedService] = useState<ServiceName | ''>('')
  const [newKey, setNewKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const keys = await getUserApiKeys(user.id)
      const keyMap = keys.reduce((acc, key) => ({
        ...acc,
        [key.service_name]: '••••••••' // Show masked value
      }), {})
      setApiKeys(keyMap)
    } catch (err) {
      console.error('Failed to load API keys:', err)
      setError(typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
    }
  }

  const handleSaveKey = async () => {
    if (!selectedService || !newKey) return

    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await saveApiKey(user.id, selectedService, newKey)
      await loadApiKeys()
      setNewKey('')
      setSelectedService('')
    } catch (err) {
      console.error('Failed to save API key:', err)
      setError(typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKey = async (serviceName: string) => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await deleteApiKey(user.id, serviceName)
      await loadApiKeys()
    } catch (err) {
      console.error('Failed to delete API key:', err)
      setError(typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Get available services (ones that don't have keys yet)
  const availableServices = Object.entries(SERVICE_NAMES).filter(([_, value]) => !apiKeys[value])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">API Key Management</h2>
        <p className="text-muted-foreground mb-4">
          Manage your API keys for image generation services.
        </p>
      </div>

      {/* Existing Keys */}
      <div className="space-y-4">
        {Object.entries(apiKeys).map(([serviceName, _]) => (
          <div key={serviceName} className="space-y-2">
            <Label>{serviceName}</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="password"
                value="••••••••"
                readOnly
                placeholder="No API key set"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteKey(serviceName)}
                disabled={loading}
                aria-label={`Delete ${serviceName} API key`}
                className="focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                <Trash className="w-4 h-4 text-red-500 opacity-60 hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Key */}
      {availableServices.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Add New API Key</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={selectedService} onValueChange={(value) => setSelectedService(value as ServiceName)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Enter your API key"
                />
                <Button
                  onClick={handleSaveKey}
                  disabled={loading || !selectedService || !newKey}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 rounded p-2 mb-4">
          {error}
        </div>
      )}
    </div>
  )
} 