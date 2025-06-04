"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createSession } from "@/lib/supabase/services/sessions"
import { createClient } from '@/lib/supabase/client'
import { Label } from "@/components/ui/label"

interface CreateSessionFormProps {
  onCreate: (sessionId: string) => void
}

export function CreateSessionForm({ onCreate }: CreateSessionFormProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('You must be logged in to create a session')
      }

      const session = await createSession(supabase, user.id, name)
      onCreate(session.id)
      setName("")
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sessionName">Session Name</Label>
        <Input
          id="sessionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter session name"
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Session"}
      </Button>
    </form>
  )
} 