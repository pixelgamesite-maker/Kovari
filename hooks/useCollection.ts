"use client";

import { useEffect, useState } from 'react';
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Once mint confirms on-chain, invalidate every cached read for this
  // collection so totalSupply, phaseMinted, claimed all update live
  // without the user needing to refresh.
  useEffect(() => {
    if (isConfirmed) {
      // Invalidate all cached reads so counts update live without refresh
      queryClient.invalidateQueries();
    }
  }, [isConfirmed, queryClient]);

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

export function useMyCollections() {
  const { address } = useAccount();
  const [indexedAddresses, setIndexedAddresses] = useState<Address[] | null>(null);
  const [indexerFailed, setIndexerFailed] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled && !indexedAddresses) setIndexerFailed(true);
    }, 5000);

    Promise.all([getCollectionIdsByCreator(address), getMintedCollectionIds(address)])
      .then(([created, minted]) => {
        if (cancelled) return;
        clearTimeout(timeout);
        const combined = Array.from(new Set([...created, ...minted])) as Address[];
        setIndexedAddresses(combined);
      })
      .catch(() => {
        if (!cancelled) { clearTimeout(timeout); setIndexerFailed(true); }
      });

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [address]);

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

  if (indexedAddresses) return { myCollections: indexedAddresses, isLoading: false, source: 'indexer' as const };
  if (indexerFailed) return {
    myCollections: fallbackMyCollections,
    isLoading: loadingTotal || (indices.length > 0 && (loadingAddresses || loadingOwners)),
    source: 'onchain' as const,
  };
  return { myCollections: [], isLoading: true, source: 'pending' as const };
}

// Admin wallets hardcoded while RPC proxy issue is being resolved.
// Revert to contract-based check once confirmed working.
const ADMIN_WALLETS = [
  '0xC0058301b89d8AaF5224981BB42e2Ae2b1EdBac9',
  '0x9DaeC3674f99cE1bBCe1c90C20C5A78f8F256657',
  '0xA2431b31F55579FD779d080449c9A9983CFD1850',
].map(a => a.toLowerCase());

export function useIsAdmin() {
  const { address } = useAccount();

  const isAdmin = !!address && ADMIN_WALLETS.includes(address.toLowerCase());
  const factoryOwner = ADMIN_WALLETS[0] as Address;
  const adminLoading = false;

  return { isAdmin, isLoading: adminLoading, factoryOwner };
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
    endTime: bigint;
    price: bigint;
    maxPerWallet: number;
    maxSupply: number;
    merkleRoot?: `0x${string}`;
    active: boolean;
  }) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'addPhase',
      args: [
        params.name, params.startTime, params.endTime, params.price,
        params.maxPerWallet, params.maxSupply, params.merkleRoot ?? zeroHash, params.active,
      ],
    });
  };

  return { addPhase, isPending, isConfirming, isConfirmed, hash };
}

export function useContractMetadata(collection: Address) {
  const { data: contractURI, isLoading } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'contractURI',
  });

  const metadata = decodeContractURI(contractURI as string | undefined);
  return { metadata, isLoading };
}

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

export function useSetPhase(collection: Address) {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const setPhase = async (phaseId: number, params: {
    name: string; startTime: bigint; endTime: bigint; price: bigint;
    maxPerWallet: number; maxSupply: number; merkleRoot?: `0x${string}`; active: boolean;
  }) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'setPhase',
      args: [
        BigInt(phaseId), params.name, params.startTime, params.endTime, params.price,
        params.maxPerWallet, params.maxSupply, params.merkleRoot ?? zeroHash, params.active,
      ],
    });
  };

  return { setPhase, isPending, isConfirming, isConfirmed, hash };
}

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

export function useDiscoverCollections() {
  const [indexedAddresses, setIndexedAddresses] = useState<Address[] | null>(null);
  const [indexerFailed, setIndexerFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled && !indexedAddresses) setIndexerFailed(true);
    }, 5000);

    getAllCollectionIds()
      .then((ids) => {
        if (!cancelled) { clearTimeout(timeout); setIndexedAddresses(ids as Address[]); }
      })
      .catch(() => {
        if (!cancelled) { clearTimeout(timeout); setIndexerFailed(true); }
      });

    return () => { cancelled = true; clearTimeout(timeout); };
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

  if (indexedAddresses) return { addresses: indexedAddresses, isLoading: false, source: 'indexer' as const };
  if (indexerFailed) return {
    addresses: fallbackAddresses,
    isLoading: loadingTotal || (indices.length > 0 && loadingAddresses),
    source: 'onchain' as const,
  };
  return { addresses: [], isLoading: true, source: 'pending' as const };
}
