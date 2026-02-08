/**
 * Supabase Storage Module
 *
 * Manages TTS-generated audio files in Supabase Storage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const AUDIO_BUCKET = 'audio';

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}

export function isStorageConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadAudio(
  filename: string,
  buffer: Buffer,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  const client = getClient();
  if (!client) throw new Error('Supabase storage not configured');

  const { error } = await client.storage
    .from(AUDIO_BUCKET)
    .upload(filename, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return `/api/audio/${filename}`;
}

export async function getAudioUrl(filename: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const { data } = client.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(filename);

  if (!data?.publicUrl) return null;

  // Return the local proxy URL for consistent API
  return `/api/audio/${filename}`;
}

export async function audioExists(filename: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { data, error } = await client.storage
    .from(AUDIO_BUCKET)
    .list('', {
      search: filename,
      limit: 1,
    });

  if (error || !data) return false;
  return data.some(f => f.name === filename);
}

export async function deleteAudio(filename: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client.storage
    .from(AUDIO_BUCKET)
    .remove([filename]);

  return !error;
}

export function getPublicUrl(filename: string): string | null {
  const client = getClient();
  if (!client) return null;

  const { data } = client.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(filename);

  return data?.publicUrl || null;
}

export async function downloadAudio(filename: string): Promise<Buffer | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client.storage
    .from(AUDIO_BUCKET)
    .download(filename);

  if (error || !data) return null;

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
