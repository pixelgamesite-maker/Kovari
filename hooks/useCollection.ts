"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { COLLECTION_ABI, FACTORY_ABI, FACTORY_ADDRESS } from '@/lib/contracts';
import { type Address } from 'viem';

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
