"use client";

import { useEffect, useState } from 'react';
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { COLLECTION_ABI, FACTORY_ABI, FACTORY_ADDRESS } from '@/lib/contracts';
import { decodeContractURI } from '@/lib/contract-metadata';
import { getAllCollectionIds, getCollectionIdsByCreator, getMintedCollectionIds } from '@/lib/ponder';
import { type Address, parseEventLogs, zeroHash } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export function useCollectionInfo(address: Address) {
  const { data: name } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'name' });
  const { data: symbol } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'symbol' });
  const { data: maxSupply } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'maxSupply' });
  const { data: totalSupply } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'totalSupply' });
  const { data: revealed } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'revealed' });
  const { data: tradingLocked } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'tradingLocked' });
  const { data: owner } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'owner' });
  const { data: placeholderURI } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'placeholderURI' });
  const { data: platformFlatFee } = useReadContract({ address, abi: COLLECTION_ABI, functionName: 'platformFlatFee' });

  return {
    name, symbol, maxSupply, totalSupply, revealed,
    tradingLocked, owner, placeholderURI, platformFlatFee,
    isLoading: !name,
  };
}

// phaseId of -1 is used as a "no phase selected yet" sentinel by callers.
// Guard against it here with `enabled` rather than letting BigInt(-1) reach
// a uint256 contract arg, which viem will throw on at encoding time.
export function usePhase(collection: Address, phaseId: number) {
  const { address } = useAccount();
  const isValid = phaseId >= 0;
  const safePhaseId = BigInt(Math.max(phaseId, 0));

  const { data: phase } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'getPhase',
    args: [safePhaseId],
    query: { enabled: isValid },
  });

  const { data: phaseMinted } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'phaseMinted',
    args: [safePhaseId],
    query: { enabled: isValid },
  });

  // How many of this phase the *connected wallet* has already claimed -
  // needed to enforce/display the per-wallet limit client-side.
  const { data: claimed } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'claimed',
    args: [safePhaseId, address ?? ZERO_ADDRESS],
    query: { enabled: isValid && !!address },
  });

  return { phase, phaseMinted, claimed };
}

export function useTotalPhases(collection: Address) {
  return useReadContract({ address: collection, abi: COLLECTION_ABI, functionName: 'totalPhases' });
}

export function useTotalTicketPhases(collection: Address) {
  return useReadContract({ address: collection, abi: COLLECTION_ABI, functionName: 'totalTicketPhases' });
}

export function useMint(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  // isPending = waiting on wallet signature/broadcast.
  // isConfirming/isConfirmed = waiting on actual on-chain confirmation -
  // don't tell the user "success" until isConfirmed is true, since a
  // broadcast transaction can still revert.
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const mint = async (
    phaseId: number,
    quantity: number,
    proof: `0x${string}`[],
    value: bigint
  ) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'mint',
      args: [BigInt(phaseId), BigInt(quantity), proof],
      value,
    });
  };

  return { mint, isPending, hash, isConfirming, isConfirmed };
}

export function useSetTradingLock(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const setLocked = async (locked: boolean) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: locked ? 'lockTrading' : 'unlockTrading',
    });
  };

  return { setLocked, isPending, isConfirming, isConfirmed, hash };
}

export function useFactoryCollections() {
  const { data: total } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'totalCollections',
  });

  return { totalCollections: total };
}

// Deploys a new collection and decodes the CollectionCreated event from the
// receipt to get the new collection's address - this is what lets the
// launch page redirect straight to /dashboard/{newAddress} once the
// transaction confirms, instead of leaving the creator stranded on the form.
export function useCreateCollection() {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  let newCollectionAddress: Address | undefined;
  if (receipt) {
    const logs = parseEventLogs({
      abi: FACTORY_ABI,
      eventName: 'CollectionCreated',
      logs: receipt.logs,
    });
    newCollectionAddress = logs[0]?.args.collection as Address | undefined;
  }

  const createCollection = async (params: {
    name: string;
    symbol: string;
    maxSupply: bigint;
    placeholderURI: string;
    royaltyBps: bigint;
  }) => {
    await writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createCollection',
      args: [{ ...params, onChainMode: false }],
    });
  };

  return { createCollection, isPending, isConfirming, isConfirmed, hash, newCollectionAddress };
}

// Finds every collection the connected wallet owns or has minted from.
// Tries the Ponder indexer first (one fast indexed query); if that's
// unreachable (not deployed, wrong URL, etc.) falls back automatically to
// the on-chain scan below - slower, but has no external dependency.
export function useMyCollections() {
  const { address } = useAccount();
  const [indexedAddresses, setIndexedAddresses] = useState<Address[] | null>(null);
  const [indexerFailed, setIndexerFailed] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    Promise.all([getCollectionIdsByCreator(address), getMintedCollectionIds(address)])
      .then(([created, minted]) => {
        if (cancelled) return;
        const combined = Array.from(new Set([...created, ...minted])) as Address[];
        setIndexedAddresses(combined);
      })
      .catch(() => {
        if (!cancelled) setIndexerFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  // --- On-chain fallback, only runs if the indexer attempt failed ---
  const { data: total, isLoading: loadingTotal } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'totalCollections',
    query: { enabled: indexerFailed },
  });

  const indices = indexerFailed && total ? Array.from({ length: Number(total) }, (_, i) => BigInt(i)) : [];

  const { data: addressResults, isLoading: loadingAddresses } = useReadContracts({
    contracts: indices.map((i) => ({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'allCollections',
      args: [i],
    })),
    query: { enabled: indexerFailed && indices.length > 0 },
  });

  const fallbackCollectionAddresses = (addressResults ?? [])
    .map((r) => (r.status === 'success' ? (r.result as Address) : null))
    .filter((a): a is Address => !!a);

  const { data: ownerResults, isLoading: loadingOwners } = useReadContracts({
    contracts: fallbackCollectionAddresses.map((addr) => ({
      address: addr,
      abi: COLLECTION_ABI,
      functionName: 'owner',
    })),
    query: { enabled: indexerFailed && fallbackCollectionAddresses.length > 0 && !!address },
  });

  const fallbackMyCollections = fallbackCollectionAddresses.filter((_, i) => {
    const ownerResult = (ownerResults as any)?.[i];
    if (ownerResult?.status !== 'success' || !address) return false;
    return (ownerResult.result as Address).toLowerCase() === address.toLowerCase();
  });

  // Indexer succeeded - use it.
  if (indexedAddresses) {
    return { myCollections: indexedAddresses, isLoading: false, source: 'indexer' as const };
  }
  // Indexer failed - use the on-chain fallback.
  if (indexerFailed) {
    return {
      myCollections: fallbackMyCollections,
      isLoading: loadingTotal || (indices.length > 0 && (loadingAddresses || loadingOwners)),
      source: 'onchain' as const,
    };
  }
  // Still waiting to find out which path we're on.
  return { myCollections: [], isLoading: true, source: 'pending' as const };
}

export function useIsAdmin() {
  const { address } = useAccount();
  const { data: factoryOwner } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'owner',
  });

  const isAdmin =
    !!address && !!factoryOwner &&
    address.toLowerCase() === (factoryOwner as Address).toLowerCase();

  return { isAdmin, factoryOwner };
}

export function useTransferOwnership(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const transferOwnership = async (newOwner: Address) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'transferOwnership',
      args: [newOwner],
    });
  };

  return { transferOwnership, isPending, isConfirming, isConfirmed, hash };
}

export function useAddPhase(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const addPhase = async (params: {
    name: string;
    startTime: bigint;
    endTime: bigint; // 0n = no end
    price: bigint; // wei
    maxPerWallet: number; // 0 = unlimited
    maxSupply: number; // 0 = no phase cap
    merkleRoot?: `0x${string}`; // omit or zeroHash for a public phase
    active: boolean;
  }) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'addPhase',
      args: [
        params.name,
        params.startTime,
        params.endTime,
        params.price,
        params.maxPerWallet,
        params.maxSupply,
        params.merkleRoot ?? zeroHash,
        params.active,
      ],
    });
  };

  return { addPhase, isPending, isConfirming, isConfirmed, hash };
}

// Reads contractURI() and decodes it - the only way to see the collection's
// current description/image/banner/externalLink, since the contract only
// exposes setters for these.
export function useContractMetadata(collection: Address) {
  const { data: contractURI, isLoading } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'contractURI',
  });

  const metadata = decodeContractURI(contractURI as string | undefined);

  return { metadata, isLoading };
}

// Bundles description + image + banner + externalLink into a single
// transaction via setCollectionMetadata, rather than one transaction per
// field - one save action in the UI, one wallet signature.
export function useUpdateCollectionMetadata(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const updateMetadata = async (params: {
    description: string;
    image: string;
    banner: string;
    externalLink: string;
  }) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'setCollectionMetadata',
      args: [params.description, params.image, params.banner, params.externalLink],
    });
  };

  return { updateMetadata, isPending, isConfirming, isConfirmed, hash };
}

// Full phase edit - same shape as addPhase but targets an existing phaseId.
// Used by PhaseBuilder when mode="edit".
export function useSetPhase(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const setPhase = async (
    phaseId: number,
    params: {
      name: string;
      startTime: bigint;
      endTime: bigint;
      price: bigint;
      maxPerWallet: number;
      maxSupply: number;
      merkleRoot?: `0x${string}`;
      active: boolean;
    }
  ) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'setPhase',
      args: [
        BigInt(phaseId),
        params.name,
        params.startTime,
        params.endTime,
        params.price,
        params.maxPerWallet,
        params.maxSupply,
        params.merkleRoot ?? zeroHash,
        params.active,
      ],
    });
  };

  return { setPhase, isPending, isConfirming, isConfirmed, hash };
}

// Quick toggle - just active/inactive, no need to resend the rest of the
// phase's fields for this single change.
export function useSetPhaseActive(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const setPhaseActive = async (phaseId: number, active: boolean) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'setPhaseActive',
      args: [BigInt(phaseId), active],
    });
  };

  return { setPhaseActive, isPending, isConfirming, isConfirmed, hash };
}

// Quick price-only update.
export function useSetPhasePrice(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const setPhasePrice = async (phaseId: number, price: bigint) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'setPhasePrice',
      args: [BigInt(phaseId), price],
    });
  };

  return { setPhasePrice, isPending, isConfirming, isConfirmed, hash };
}

// Powers the home page's collection list. Same indexer-first,
// on-chain-fallback pattern as useMyCollections, just without the
// owner-filtering step.
export function useDiscoverCollections() {
  const [indexedAddresses, setIndexedAddresses] = useState<Address[] | null>(null);
  const [indexerFailed, setIndexerFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllCollectionIds()
      .then((ids) => {
        if (!cancelled) setIndexedAddresses(ids as Address[]);
      })
      .catch(() => {
        if (!cancelled) setIndexerFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: total, isLoading: loadingTotal } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'totalCollections',
    query: { enabled: indexerFailed },
  });

  const indices = indexerFailed && total ? Array.from({ length: Number(total) }, (_, i) => BigInt(i)) : [];

  const { data: addressResults, isLoading: loadingAddresses } = useReadContracts({
    contracts: indices.map((i) => ({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'allCollections',
      args: [i],
    })),
    query: { enabled: indexerFailed && indices.length > 0 },
  });

  const fallbackAddresses = (addressResults ?? [])
    .map((r) => (r.status === 'success' ? (r.result as Address) : null))
    .filter((a): a is Address => !!a);

  if (indexedAddresses) {
    return { addresses: indexedAddresses, isLoading: false, source: 'indexer' as const };
  }
  if (indexerFailed) {
    return {
      addresses: fallbackAddresses,
      isLoading: loadingTotal || (indices.length > 0 && loadingAddresses),
      source: 'onchain' as const,
    };
  }
  return { addresses: [], isLoading: true, source: 'pending' as const };
}
