// lib/supabase/services/images.ts
import type { Image } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ImageRecord {
  id: string;
  session_id: string;
  prompt_id: string | null;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export interface SaveImageOptions {
  sessionId: string;
  promptId?: string;
  userId: string;
  fileExtension?: string;
}

// Save image and return record with public URL
export async function saveImage(supabase: SupabaseClient, buffer: Buffer, options: SaveImageOptions) {
  const { sessionId, promptId, userId, fileExtension = 'png' } = options;
  const timestamp = Date.now();
  const promptPrefix = promptId ? `${promptId}_` : '';
  const filePath = `${userId}/${sessionId}/${promptPrefix}${timestamp}.${fileExtension}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('party-images')
      .upload(filePath, buffer, {
        contentType: `image/${fileExtension}`,
        cacheControl: '3600'
      });

    if (uploadError) throw uploadError;

    const { data: image, error: dbError } = await supabase
      .from('images')
      .insert({
        session_id: sessionId,
        prompt_id: promptId || null,
        storage_path: filePath
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from('party-images').remove([filePath]);
      throw dbError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('party-images')
      .getPublicUrl(filePath);

    return { ...image, public_url: publicUrl };

  } catch (error) {
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getImage(supabase: SupabaseClient, imageId: string) {
  const { data: image, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', imageId)
    .single();

  if (error) throw error;

  return {
    ...image,
    public_url: supabase.storage.from('party-images').getPublicUrl(image.storage_path).data.publicUrl
  };
}

export async function getSessionImages(supabase: SupabaseClient, sessionId: string): Promise<Image[]> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteImage(supabase: SupabaseClient, imageId: string): Promise<void> {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId)

  if (error) throw error
}

export function getImagePublicUrl(supabase: SupabaseClient, storagePath: string): string {
  const { data } = supabase.storage.from('party-images').getPublicUrl(storagePath)
  return data.publicUrl
}