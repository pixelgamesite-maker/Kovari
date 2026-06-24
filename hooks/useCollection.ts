"use client";

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { COLLECTION_ABI, FACTORY_ABI, FACTORY_ADDRESS } from '@/lib/contracts';
import { type Address } from 'viem';

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
  const { data: phase } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'getPhase',
    args: [BigInt(phaseId)],
  });
  const { data: phaseMinted } = useReadContract({
    address: collection,
    abi: COLLECTION_ABI,
    functionName: 'phaseMinted',
    args: [BigInt(phaseId)],
  });

  return { phase, phaseMinted };
}

export function useTotalPhases(collection: Address) {
  return useReadContract({ address: collection, abi: COLLECTION_ABI, functionName: 'totalPhases' });
}

export function useMint(collection: Address) {
  const { writeContract, isPending } = useWriteContract();
  
  const mint = async (phaseId: number, quantity: number, proof: `0x${string}`[], value: bigint) => {
    await writeContract({
      address: collection,
      abi: COLLECTION_ABI,
      functionName: 'mint',
      args: [BigInt(phaseId), BigInt(quantity), proof],
      value,
    });
  };

  return { mint, isPending };
}

export function useFactoryCollections() {
  const { data: total } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'totalCollections',
  });

  return { totalCollections: total };
}
