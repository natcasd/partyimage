'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isSessionActive } from '@/lib/supabase/services/sessions'
import { submitPrompt } from '@/lib/supabase/services/prompts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SubmitPrompt() {
  const params = useParams()
  const sessionId = params.id as string
  const [prompt, setPrompt] = useState('')
  const [sessionValid, setSessionValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
      try {
        const valid = await isSessionActive(supabase, sessionId)
        setSessionValid(valid)
      } catch (err) {
        console.error('Error checking session:', err)
        setError('Failed to verify session')
        setSessionValid(false)
      }
    }
    checkSession()
  }, [sessionId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      await submitPrompt(supabase, sessionId, prompt.trim())
      setPrompt('')
    } catch (err) {
      console.error('Error submitting prompt:', err)
      setError('Failed to submit prompt')
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Verifying session...</p>
        </div>
      </div>
    )
  }

  if (sessionValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 to-pink-400">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Available</h1>
          <p className="text-gray-600">{error || 'This party session doesn\'t exist or has ended.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Submit Your Prompt</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full"
            disabled={submitting}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !prompt.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}