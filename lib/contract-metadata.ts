import { toGateway } from './utils';

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
      // Apply toGateway here so every consumer gets a renderable URL,
      // not a raw ipfs:// string that browsers can't display.
      image: toGateway(json.image),
      banner: toGateway(json.banner_image_url),
      externalLink: json.external_link,
      sellerFeeBasisPoints: json.seller_fee_basis_points,
      feeRecipient: json.fee_recipient,
    };
  } catch {
    return null;
  }
}
