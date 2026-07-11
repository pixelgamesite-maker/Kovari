"use client";

import { useState, useEffect } from 'react';
import { type CollectionMeta, getCollectionMeta } from '@/lib/collection-meta';

export function useCollectionMeta(address: string) {
  const [meta, setMeta] = useState<CollectionMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    setIsLoading(true);
    getCollectionMeta(address)
      .then(setMeta)
      .catch(() => setMeta(null))
      .finally(() => setIsLoading(false));
  }, [address]);

  return { meta, isLoading };
}
