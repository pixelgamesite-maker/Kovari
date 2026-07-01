// Decodes the base64-encoded JSON that contractURI() returns - this is the
// only way to read back description/image/banner/externalLink, since the
// contract only exposes setters for these, not individual getters.
//
// Field names confirmed with the contract dev (2026-06-29):
// image, banner_image_url, external_link, seller_fee_basis_points, fee_recipient
// (name/description follow the standard convention, not explicitly
// reconfirmed but assumed present alongside the above).
export type ContractMetadata = {
  name?: string;
  description?: string;
  image?: string;
  banner?: string;
  externalLink?: string;
  sellerFeeBasisPoints?: number;
  feeRecipient?: string;
};

export function decodeContractURI(uri: string | undefined): ContractMetadata | null {
  if (!uri) return null;

  try {
    const base64 = uri.replace(/^data:application\/json;base64,/, '');
    const json = JSON.parse(atob(base64));

    return {
      name: json.name,
      description: json.description,
      image: json.image,
      banner: json.banner_image_url,
      externalLink: json.external_link,
      sellerFeeBasisPoints: json.seller_fee_basis_points,
      feeRecipient: json.fee_recipient,
    };
  } catch {
    // Malformed or unexpected contractURI shape - degrade gracefully rather
    // than crashing the page over a cosmetic metadata read.
    return null;
  }
}
