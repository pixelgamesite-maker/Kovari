const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL;

async function ponderQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!PONDER_URL) {
    throw new Error('NEXT_PUBLIC_PONDER_GRAPHQL_URL is not set');
  }

  const res = await fetch(PONDER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Ponder query failed: ${res.status}`);

  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0]?.message ?? 'Ponder GraphQL error');
  return data as T;
}

// NOTE: field names here match the dev's confirmed schema as last reviewed.
// First thing to check once the indexer's real URL is wired in - run this
// query directly and confirm the field names actually match before trusting
// the UI built on top of it.
export async function getAllCollectionIds(limit = 100): Promise<string[]> {
  const data = await ponderQuery<{ collections: { items: { id: string }[] } }>(
    `query GetCollections($limit: Int) {
      collections(orderBy: "createdAt", orderDirection: "desc", limit: $limit) {
        items { id }
      }
    }`,
    { limit }
  );
  return data.collections.items.map((c) => c.id);
}

export async function getCollectionIdsByCreator(creator: string): Promise<string[]> {
  const data = await ponderQuery<{ collections: { items: { id: string }[] } }>(
    `query GetCollectionsByCreator($creator: String!) {
      collections(where: { creator: $creator }) {
        items { id }
      }
    }`,
    { creator: creator.toLowerCase() }
  );
  return data.collections.items.map((c) => c.id);
}

// Collections a wallet has minted from, even if it didn't create them -
// distinct collection ids derived from the mints table.
export async function getMintedCollectionIds(minter: string): Promise<string[]> {
  const data = await ponderQuery<{ mints: { items: { collectionId: string }[] } }>(
    `query GetMintsByMinter($minter: String!) {
      mints(where: { minter: $minter }) {
        items { collectionId }
      }
    }`,
    { minter: minter.toLowerCase() }
  );
  return Array.from(new Set(data.mints.items.map((m) => m.collectionId)));
}
