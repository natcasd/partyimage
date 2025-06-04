'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeysManager } from '@/components/api-keys/api-keys-manager'
import { CreateSessionForm } from '@/components/sessions/create-session-form'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSessionCreate = (sessionId: string) => {
    router.push(`/protected/session/${sessionId}`)
  }

  if (!user) {
    return (
      <div className="w-full h-full p-6 max-w-5xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="sessions" className="flex-1">Sessions</TabsTrigger>
          <TabsTrigger value="api-keys" className="flex-1">API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="sessions" className="w-full">
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Create New Session</h2>
              <p className="text-muted-foreground mb-4">
                Create a new interactive party session for your guests.
              </p>
            </div>
            <CreateSessionForm onCreate={handleSessionCreate} />
          </div>
        </TabsContent>
        <TabsContent value="api-keys" className="w-full">
          <ApiKeysManager user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 