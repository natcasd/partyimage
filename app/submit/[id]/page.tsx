'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { isSessionActive } from '@/lib/supabase/services/sessions'
import { submitPrompt } from '@/lib/supabase/services/prompts'

export default function SubmitPrompt() {
  const params = useParams()
  const sessionId = params.id as string
  
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [sessionValid, setSessionValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifySession = async () => {
      try {
        if (!sessionId) {
          setSessionValid(false)
          setError('No session ID provided')
          return
        }

        const active = await isSessionActive(sessionId)
        setSessionValid(active)
        if (!active) {
          setError('This session is not active')
        }
      } catch (error: any) {
        console.error('Error verifying session:', error)
        setSessionValid(false)
        setError(error.message || 'Failed to verify session')
      }
    }
    
    verifySession()
  }, [sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) return
    
    setIsSubmitting(true)
    setMessage('')
    
    try {
      await submitPrompt(sessionId, prompt.trim())
      setMessage('🎨 Your image is being generated! Check the party screen.')
      setPrompt('')
    } catch (error: any) {
      console.error('Error submitting prompt:', error)
      setMessage(`Error: ${error.message || 'Failed to submit prompt'}`)
    } finally {
      setIsSubmitting(false)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🎉 Party Image Generator</h1>
          <p className="text-gray-600">Describe an image and watch it appear on the party screen!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              What should we create?
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A disco ball floating in outer space..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              required
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {prompt.length}/500
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? '🎨 Creating...' : '✨ Generate Image'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}