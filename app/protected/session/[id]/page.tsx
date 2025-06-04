import { QrCodeShare } from '@/components/sessions/QrCodeShare'
import { SessionTabs } from '@/components/sessions/SessionTabs'
import { ProcessPromptsClient } from '@/components/sessions/ProcessPromptsClient'

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { id: sessionId } = await params;
  console.log("session dashboard rerendering")

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Session Metadata</h1>
      <p className="text-muted-foreground mb-8">Session ID: <code className="bg-muted px-2 py-1 rounded text-sm">{sessionId}</code></p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <QrCodeShare sessionId={sessionId} />
        </div>
        <div className="md:col-span-2">
          <SessionTabs sessionId={sessionId} />
        </div>
      </div>
      <ProcessPromptsClient sessionId={sessionId} />
    </div>
  )
} 