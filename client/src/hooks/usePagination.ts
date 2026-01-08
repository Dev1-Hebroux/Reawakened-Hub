import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';

interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string | number | null;
  hasMore: boolean;
  total?: number;
}

interface UsePaginationOptions<T> {
  queryKey: string[];
  fetchFn: (cursor?: string | number) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
  staleTime?: number;
}

export function usePagination<T>({
  queryKey,
  fetchFn,
  enabled = true,
  staleTime = 1000 * 60 * 5,
}: UsePaginationOptions<T>) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      return fetchFn(pageParam);
    },
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled,
    staleTime,
  });

  const allItems = query.data?.pages.flatMap((page) => page.items) ?? [];

  const setLoadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node && query.hasNextPage && !query.isFetchingNextPage) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && query.hasNextPage) {
              query.fetchNextPage();
            }
          },
          { rootMargin: '100px' }
        );
        observerRef.current.observe(node);
      }

      loadMoreRef.current = node;
    },
    [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    items: allItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    setLoadMoreRef,
    total: query.data?.pages[0]?.total,
  };
}

interface UseOffsetPaginationOptions<T> {
  queryKey: string[];
  fetchFn: (offset: number, limit: number) => Promise<{ items: T[]; total: number }>;
  limit?: number;
  enabled?: boolean;
}

export function useOffsetPagination<T>({
  queryKey,
  fetchFn,
  limit = 20,
  enabled = true,
}: UseOffsetPaginationOptions<T>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const result = await fetchFn(pageParam, limit);
      return {
        items: result.items,
        total: result.total,
        nextOffset: pageParam + limit,
        hasMore: pageParam + limit < result.total,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    enabled,
  });

  const allItems = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    items: allItems,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
