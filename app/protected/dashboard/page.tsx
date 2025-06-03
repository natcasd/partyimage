'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeysManager } from '@/components/api-keys/api-keys-manager'
import { CreateSessionForm } from '@/components/sessions/create-session-form'

export default function DashboardPage() {
  const router = useRouter()

  const handleSessionCreate = (session: { id: string }) => {
    router.push(`/protected/session/${session.id}`)
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
          <ApiKeysManager />
        </TabsContent>
      </Tabs>
    </div>
  )
} 