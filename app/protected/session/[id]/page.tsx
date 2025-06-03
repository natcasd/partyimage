import { QrCodeShare } from '@/components/sessions/QrCodeShare'
import { SubmittedPrompts } from '@/components/sessions/SubmittedPrompts'

interface PageProps {
  params: { id: string }
}

export default function SessionPage({ params }: PageProps) {
  const { id: sessionId } = params
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Session Metadata</h1>
      <p className="text-muted-foreground mb-8">Session ID: <code className="bg-muted px-2 py-1 rounded text-sm">{sessionId}</code></p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <QrCodeShare sessionId={sessionId} />
        </div>
        <div className="md:col-span-2">
          <SubmittedPrompts sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
} 