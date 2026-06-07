import { useCallback, useEffect, useRef, useState } from 'react';
import pagesService from '../services/api/pages.service';
import {
  appendUniqueMembers,
  normalizePageMembersMeta,
  type PageMembersMeta,
} from '../utils/pageMembers';

const PAGE_SIZE = 20;

interface UsePaginatedPageMembersOptions {
  pageId: string | null;
  type: 'team' | 'followers';
  enabled?: boolean;
}

export function usePaginatedPageMembers({
  pageId,
  type,
  enabled = true,
}: UsePaginatedPageMembersOptions) {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<PageMembersMeta>({
    page: 0,
    limit: PAGE_SIZE,
    total: 0,
    hasMore: false,
  });
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number, reset: boolean) => {
      if (!pageId || !enabled) return;

      const requestId = ++requestIdRef.current;

      if (reset) {
        setInitialLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await pagesService.getMembers(pageId, {
          page,
          limit: PAGE_SIZE,
          type,
        });

        if (requestId !== requestIdRef.current) return;

        const batch =
          type === 'team'
            ? response.members || response.data || []
            : response.followers || response.data || [];

        const nextMeta = normalizePageMembersMeta(response.meta, batch.length);

        setItems((current) => (reset ? batch : appendUniqueMembers(current, batch)));
        setMeta(nextMeta);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        const message = err instanceof Error ? err.message : 'Failed to load members';
        setError(message);
        if (reset) {
          setItems([]);
          setMeta({ page: 0, limit: PAGE_SIZE, total: 0, hasMore: false });
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setInitialLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [enabled, pageId, type]
  );

  const refresh = useCallback(async () => {
    await fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (initialLoading || loadingMore || !meta.hasMore) return;
    await fetchPage(meta.page + 1, false);
  }, [fetchPage, initialLoading, loadingMore, meta.hasMore, meta.page]);

  useEffect(() => {
    if (!enabled || !pageId) {
      setItems([]);
      setMeta({ page: 0, limit: PAGE_SIZE, total: 0, hasMore: false });
      setError(null);
      return;
    }

    void fetchPage(1, true);
  }, [enabled, pageId, type, fetchPage]);

  return {
    items,
    total: meta.total,
    hasMore: meta.hasMore,
    initialLoading,
    loadingMore,
    error,
    refresh,
    loadMore,
  };
}
