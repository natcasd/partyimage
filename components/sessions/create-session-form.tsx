"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createSession } from "@/lib/supabase/services/sessions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateSessionFormProps {
  onCreate: (session: { id: string }) => void
}

export function CreateSessionForm({ onCreate }: CreateSessionFormProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('You must be logged in to create a session')
      }

      const session = await createSession(user.id, name)
      onCreate(session)
      setName("")
    } catch (err: any) {
      setError(err.message || "Failed to create session")
    } finally {
      setLoading(false)
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
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Session"}
      </Button>
    </form>
  )
} 