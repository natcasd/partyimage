"use client"
import { useSessionPrompts } from '@/lib/supabase/hooks/useSessionPrompts'
import { deletePrompt } from '@/lib/supabase/services/prompts'
import { Trash2 } from 'lucide-react'

interface SubmittedPromptsProps {
  sessionId: string
}

export function SubmittedPrompts({ sessionId }: SubmittedPromptsProps) {
  const { data: prompts, loading, error, refetch } = useSessionPrompts(sessionId, undefined, 500)

  const handleDelete = async (promptId: string) => {
    await deletePrompt(promptId)
    refetch()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Submitted Prompts</h2>
      {loading && <div className="text-muted-foreground">Loading prompts...</div>}
      {typeof error === 'string' && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      {typeof error === 'object' && error && 'message' in (error as any) && <div className="text-red-500 bg-red-50 p-3 rounded">{(error as any).message}</div>}
      {!loading && !error && prompts && prompts.length === 0 && (
        <div className="text-muted-foreground bg-muted/50 p-6 rounded-lg text-center">
          No prompts submitted yet. Share the QR code above to get started!
        </div>
      )}
      {!loading && !error && prompts && prompts.length > 0 && (
        <div className="overflow-x-auto">
          <div className="rounded-lg border border-gray-300 overflow-hidden">
            <table className="min-w-full bg-card">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left font-semibold first:rounded-tl-lg">Prompt</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Submitted At</th>
                  <th className="px-4 py-2 text-left font-semibold last:rounded-tr-lg"></th>
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
                    <td className={`px-4 py-2 align-top text-xs text-muted-foreground ${idx === prompts.length - 1 ? 'rounded-br-lg' : ''}`}>{new Date(prompt.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 align-top text-right">
                      <button
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Delete prompt"
                        onClick={() => handleDelete(prompt.id)}
                      >
                        <Trash2 size={16} />
                      </button>
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