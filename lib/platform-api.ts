import { PLATFORM_API_BASE_URL } from './contracts';

// Thin client for the contract team's Merkle + metadata backend.
//
// IMPORTANT: the brief gives endpoint names and a high-level description,
// but not exact request/response JSON shapes. Everything below is a
// reasonable guess at that shape - confirm the actual payload format with
// the contract dev (or just hit the endpoint directly and check) before
// relying on this in production. Wrong field names here will fail
// silently differently than a missing export does - it'll just send a
// malformed request.

export async function buildMerkleRoot(addresses: string[]): Promise<{ root: `0x${string}` }> {
  const res = await fetch(`${PLATFORM_API_BASE_URL}/merkle/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses }),
  });
  if (!res.ok) throw new Error(`Merkle build failed: ${res.status}`);
  return res.json();
}

export async function getMerkleProof(params: {
  collection: string;
  phaseId: number;
  address: string;
}): Promise<{ proof: `0x${string}`[] }> {
  const query = new URLSearchParams({
    collection: params.collection,
    phaseId: String(params.phaseId),
    address: params.address,
  });
  const res = await fetch(`${PLATFORM_API_BASE_URL}/merkle/proof?${query.toString()}`);
  if (!res.ok) throw new Error(`Merkle proof fetch failed: ${res.status}`);
  return res.json();
}

export async function uploadMetadata(formData: FormData): Promise<{ baseURI: string }> {
  const res = await fetch(`${PLATFORM_API_BASE_URL}/metadata/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Metadata upload failed: ${res.status}`);
  return res.json();
}
