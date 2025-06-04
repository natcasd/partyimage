'use client'
import { SubmittedPrompts } from '@/components/sessions/SubmittedPrompts'
import { GeneratedImages } from '@/components/sessions/GeneratedImages'
import { useState } from 'react'

interface SessionTabsProps {
  sessionId: string
}

export function SessionTabs({ sessionId }: SessionTabsProps) {
  const [activeTab, setActiveTab] = useState('prompts')

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'prompts'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('prompts')}
        >
          Prompts
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'images'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
      </div>
      <div>
        {activeTab === 'prompts' && <SubmittedPrompts sessionId={sessionId} />}
        {activeTab === 'images' && <GeneratedImages sessionId={sessionId} />}
      </div>
    </div>
  )
} 