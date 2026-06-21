import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther as viemFormatEther } from 'viem';

export function formatEther(value: bigint | string | number): string {
  const wei = typeof value === 'bigint' ? value : BigInt(value);
  return viemFormatEther(wei);
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
