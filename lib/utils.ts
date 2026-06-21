import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { formatEther } from 'viem';

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
