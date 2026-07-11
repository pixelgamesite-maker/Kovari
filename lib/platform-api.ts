import { PLATFORM_API_BASE_URL } from './contracts';

// Thin client for the contract team's Merkle + metadata backend.
//
// Merkle endpoints below are still a best-guess at the exact request/response
// shape (confirm with the dev or test directly before relying on them).
// The metadata upload functions further down ARE confirmed - see comment there.

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

// Confirmed with the contract dev (2026-06-28):
// - Placeholder image: POST /metadata/placeholder, field "image" (single file)
// - Reveal upload: POST /metadata/upload, fields "images" (multiple files) +
//   "csv" (one file) - individual files in one multipart request, NOT a zip.

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

// Same endpoint, confirmed generic (2026-06-29) - reused for logo/banner
// uploads. Different name at call sites for clarity; identical request.
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
