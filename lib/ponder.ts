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

export async function getAllCollectionIds(): Promise<string[]> {
  const data = await ponderQuery<{ collections: { items: { id: string }[] } }>(
    `{
      collections(orderBy: "createdAt", orderDirection: "desc") {
        items { id }
      }
    }`
  );
  return data.collections.items.map((c) => c.id);
}

export async function getCollectionIdsByCreator(creator: string): Promise<string[]> {
  const data = await ponderQuery<{ collections: { items: { id: string }[] } }>(
    `query GetByCreator($creator: String!) {
      collections(where: { creator: $creator }) {
        items { id }
      }
    }`,
    { creator: creator.toLowerCase() }
  );
  return data.collections.items.map((c) => c.id);
}

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
