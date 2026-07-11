// Client-side fetcher for collection socials + verified status.
// Hits /api/collections which reads from Neon server-side.
// Never imports pg or db.ts directly — server-side only.

export type CollectionMeta = {
  address: string;
  verified: boolean;
  featured: boolean;
  twitter?: string | null;
  discord?: string | null;
  website?: string | null;
  telegram?: string | null;
};

export async function getCollectionMeta(address: string): Promise<CollectionMeta> {
  const res = await fetch(`/api/collections?address=${address.toLowerCase()}`);
  if (!res.ok) throw new Error('Failed to fetch collection meta');
  return res.json();
}

export async function updateCollectionMeta(
  data: Partial<CollectionMeta> & { address: string },
  adminKey: string
): Promise<void> {
  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update collection meta');
}
