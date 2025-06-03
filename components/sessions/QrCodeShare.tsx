"use client"
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy } from 'lucide-react'

interface QrCodeShareProps {
  sessionId: string
}

export function QrCodeShare({ sessionId }: QrCodeShareProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);

  useEffect(() => {
    async function generateQr() {
      const url = `${window.location.origin}/submit/${sessionId}`;
      setSubmissionUrl(url)
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
    }
    generateQr()
  }, [sessionId])


  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Share with Party Guests</h2>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          {qrCodeUrl ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Scan to submit prompts:</p>
              <img 
                src={qrCodeUrl} 
                alt="Session QR Code" 
                className="mx-auto border rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mx-auto">
              <span className="text-muted-foreground">Generating QR Code...</span>
            </div>
          )}
        </div>
        {/* Submission URL under QR code */}
        <div className="w-full">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Submission URL:</label>
          <div className="relative bg-muted rounded mt-1">
            {submissionUrl && (
              <a
                href={submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-3 py-2 rounded text-sm break-all text-primary underline underline-offset-4 hover:underline hover:decoration-2 hover:decoration-primary transition-all"
              >
                {submissionUrl}
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Share this QR code or URL with your party guests so they can submit image prompts that will appear on your screen in real-time.
          </p>
        </div>
      </div>
    </div>
  )
} 