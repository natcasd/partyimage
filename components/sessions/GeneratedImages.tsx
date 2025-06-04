import { useSessionImages } from '@/lib/supabase/hooks/useSessionImages'
import { deleteImage, getImagePublicUrl } from '@/lib/supabase/services/images'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Image } from '@/lib/supabase/types'

interface GeneratedImagesProps {
  sessionId: string
}

export function GeneratedImages({ sessionId }: GeneratedImagesProps) {
  const { images, loading, error, refetch } = useSessionImages(sessionId)
  const supabase = createClient()

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage(supabase, imageId)
      refetch()
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Generated Images</h2>
      {loading && <div className="text-muted-foreground">Loading images...</div>}
      {typeof error === 'string' && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      {typeof error === 'object' && error && 'message' in (error as any) && <div className="text-red-500 bg-red-50 p-3 rounded">{(error as any).message}</div>}
      {!loading && !error && images && images.length === 0 && (
        <div className="text-muted-foreground bg-muted/50 p-6 rounded-lg text-center">
          No images generated yet. Submit a prompt to get started!
        </div>
      )}
      {!loading && !error && images && images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image: Image) => (
            <div key={image.id} className="relative group">
              <img
                src={getImagePublicUrl(supabase, image.storage_path)}
                alt="Generated image"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => handleDelete(image.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 