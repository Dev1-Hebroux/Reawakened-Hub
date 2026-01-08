import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './queryClient';

interface JournalEntry {
  id: number;
  sparkId: number;
  userId: string;
  textContent: string | null;
  audioUrl: string | null;
  audioDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

interface UseJournalManagerOptions {
  sparkId?: number;
  reflectionId?: number;
  readingPlanDayId?: number;
}

export function useJournalManager({ sparkId, reflectionId, readingPlanDayId }: UseJournalManagerOptions) {
  const queryClient = useQueryClient();
  
  const queryKey = sparkId 
    ? ['/api/sparks', sparkId.toString(), 'journal']
    : reflectionId 
      ? ['/api/reflections', reflectionId.toString(), 'journal']
      : readingPlanDayId 
        ? ['/api/reading-plan-days', readingPlanDayId.toString(), 'journal']
        : [];

  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey,
    queryFn: async () => {
      if (sparkId) {
        return apiRequest<JournalEntry[]>('GET', `/api/sparks/${sparkId}/journals`);
      }
      return [];
    },
    enabled: !!sparkId || !!reflectionId || !!readingPlanDayId,
  });

  const currentEntry = entries?.[0] ?? null;

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sparkId) throw new Error('No sparkId provided');
      
      const method = currentEntry ? 'PATCH' : 'POST';
      const url = currentEntry 
        ? `/api/sparks/${sparkId}/journals/${currentEntry.id}`
        : `/api/sparks/${sparkId}/journals`;
      
      return apiRequest<JournalEntry>(method, url, { textContent: content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!sparkId || !currentEntry) throw new Error('No entry to delete');
      return apiRequest<void>('DELETE', `/api/sparks/${sparkId}/journals/${currentEntry.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    currentEntry,
    entries: entries ?? [],
    isLoading,
    error,
    saveEntry: saveMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

const MIGRATION_KEY = 'journal_migrated_to_server';

export function migrateLocalStorageJournals(): { sparkId: string; content: string }[] {
  if (typeof window === 'undefined') return [];
  
  const alreadyMigrated = localStorage.getItem(MIGRATION_KEY);
  if (alreadyMigrated) return [];
  
  const entries: { sparkId: string; content: string }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('journal_spark_')) {
      const sparkId = key.replace('journal_spark_', '');
      const content = localStorage.getItem(key);
      if (content) {
        entries.push({ sparkId, content });
      }
    }
  }
  
  if (entries.length > 0) {
    localStorage.setItem(MIGRATION_KEY, 'true');
  }
  
  return entries;
}

export function clearLocalStorageJournals(): void {
  if (typeof window === 'undefined') return;
  
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('journal_spark_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
