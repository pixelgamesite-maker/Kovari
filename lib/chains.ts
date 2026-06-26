// Plain chain metadata, deliberately kept dependency-free from wagmi/RainbowKit
// so server components (like CollectionCard on the home page) can import it
// without pulling in client-only config.
export const chainMeta = {
  1: { label: 'Ethereum', color: '#627EEA' },
  8453: { label: 'Base', color: '#0052FF' },
  11155111: { label: 'Sepolia', color: '#CFA0F5' },
} as const;
