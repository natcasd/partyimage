"use client"
import { useEffect, useState } from 'react'
import { getSessionPrompts } from '@/lib/supabase/services/prompts'
import type { Prompt } from '@/lib/supabase/types'

interface SubmittedPromptsProps {
  sessionId: string
}

export function SubmittedPrompts({ sessionId }: SubmittedPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const data = await getSessionPrompts(sessionId)
        setPrompts(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load prompts')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sessionId])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Submitted Prompts</h2>
      {loading && <div className="text-muted-foreground">Loading prompts...</div>}
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      {!loading && !error && prompts.length === 0 && (
        <div className="text-muted-foreground bg-muted/50 p-6 rounded-lg text-center">
          No prompts submitted yet. Share the QR code above to get started!
        </div>
      )}
      {!loading && !error && prompts.length > 0 && (
        <div className="overflow-x-auto">
          <div className="rounded-lg border border-gray-300 overflow-hidden">
            <table className="min-w-full bg-card">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left font-semibold first:rounded-tl-lg last:rounded-tr-lg">Prompt</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold last:rounded-tr-lg">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt, idx) => (
                  <tr key={prompt.id} className={`border-t ${idx === prompts.length - 1 ? 'last:rounded-b-lg' : ''}`}>
                    <td className={`px-4 py-2 align-top ${idx === prompts.length - 1 ? 'rounded-bl-lg' : ''}`}>{prompt.prompt_text}</td>
                    <td className="px-4 py-2 align-top">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prompt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        prompt.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {prompt.status}
                      </span>
                    </td>
                    <td className={`px-4 py-2 align-top text-xs text-muted-foreground ${idx === prompts.length - 1 ? 'rounded-br-lg' : ''}`}>
                      {new Date(prompt.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 