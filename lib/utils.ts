import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther as viemFormatEther, parseEther as viemParseEther } from 'viem';

export function formatEther(value: bigint | string | number): string {
  const wei = typeof value === 'bigint' ? value : BigInt(value);
  return viemFormatEther(wei);
}

export function parseEther(value: string): bigint {
  return viemParseEther(value);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export function formatDate(timestamp: bigint | number): string {
  const ms = Number(timestamp) * 1000;
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type PhaseStatus = 'live' | 'upcoming' | 'ended';

export function isPhaseActive(
  startTime: bigint,
  endTime: bigint,
  active: boolean
): { status: PhaseStatus; label: string } {
  const now = BigInt(Math.floor(Date.now() / 1000));

  if (!active) {
    return { status: 'ended', label: 'Inactive' };
  }
  if (now < startTime) {
    return { status: 'upcoming', label: `Starts ${formatDate(startTime)}` };
  }
  if (endTime > 0n && now > endTime) {
    return { status: 'ended', label: 'Ended' };
  }
  return { status: 'live', label: 'Live now' };
}
