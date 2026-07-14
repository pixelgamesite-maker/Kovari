import { PLATFORM_API_BASE_URL } from './contracts';

export async function buildMerkleRoot(
  addresses: string[],
  collectionAddress: string,
  phaseId: number
): Promise<{ root: `0x${string}` }> {
  const res = await fetch(`${PLATFORM_API_BASE_URL}/merkle/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionAddress, phaseId, addresses }),
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

export async function uploadPlaceholderImage(image: File): Promise<{ placeholderURI: string }> {
  const formData = new FormData();
  formData.append('image', image);
  const res = await fetch(`${PLATFORM_API_BASE_URL}/metadata/placeholder`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Placeholder upload failed: ${res.status}`);
  return res.json();
}

export async function uploadImage(image: File): Promise<{ placeholderURI: string }> {
  return uploadPlaceholderImage(image);
}

export async function uploadRevealMetadata(images: File[], csv: File): Promise<{ baseURI: string }> {
  const formData = new FormData();
  images.forEach((image) => formData.append('images', image));
  formData.append('csv', csv);
  const res = await fetch(`${PLATFORM_API_BASE_URL}/metadata/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Reveal upload failed: ${res.status}`);
  return res.json();
}
