export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-main-text mb-2">Privacy Policy</h1>
        <p className="text-muted-text text-sm mb-10">Last updated: July 2026</p>

        <div className="space-y-10 text-muted-text leading-relaxed">

          <Section title="Overview">
            <p>Mintrs is an EVM-compatible NFT launchpad. This privacy policy explains how Mintrs handles information in connection with your use of the platform.</p>
            <p>Mintrs is built on public blockchain infrastructure. Transactions, wallet addresses, and on-chain activity are publicly visible on the blockchain by nature and are not private.</p>
          </Section>

          <Section title="Information We Work With">
            <SubSection title="Wallet Addresses">
              <p>When you connect a wallet to Mintrs, your wallet address is used to interact with smart contracts, verify allowlist status, display your collections, and process mint transactions. Wallet addresses are public on the blockchain.</p>
            </SubSection>
            <SubSection title="On-Chain Data">
              <p>Mint transactions, token ownership, contract interactions, and transaction hashes are recorded on the blockchain and are publicly visible. Mintrs does not control or store this data — it lives on the blockchain.</p>
            </SubSection>
            <SubSection title="Usage Data">
              <p>Mintrs may collect basic usage data such as page visits and interactions to help improve the platform. This data does not include personal identifying information.</p>
            </SubSection>
          </Section>

          <Section title="What We Do Not Collect">
            <p>Mintrs does not collect:</p>
            <ul>
              <li>Your name, email address, or personal identifying information</li>
              <li>Your seed phrase or private key</li>
              <li>Payment information outside of on-chain transactions</li>
              <li>Location data</li>
            </ul>
            <p className="font-medium text-main-text">Mintrs will never ask for your seed phrase or private key under any circumstances.</p>
          </Section>

          <Section title="Third-Party Services">
            <p>Mintrs may use third-party services to support platform infrastructure, including blockchain RPC providers, IPFS pinning services for metadata and images, and analytics tools.</p>
            <p>These services may have their own privacy policies. Mintrs is not responsible for third-party data practices.</p>
          </Section>

          <Section title="Blockchain Transparency">
            <p>All mint transactions, contract deployments, and on-chain interactions made through Mintrs are recorded on the public blockchain. This data is permanently visible to anyone and cannot be deleted or altered. By using Mintrs, you understand that your on-chain activity is public.</p>
          </Section>

          <Section title="NFT Metadata and Images">
            <p>NFT metadata and images uploaded through Mintrs may be stored on IPFS, a decentralized storage network. Once uploaded and pinned, this content may be publicly accessible and difficult to remove.</p>
            <p>Creators should ensure that any artwork, metadata, or content they upload does not violate any laws or third-party rights.</p>
          </Section>

          <Section title="Cookies">
            <p>Mintrs may use minimal cookies or local storage for basic platform functionality such as remembering wallet connection state or user preferences. Mintrs does not use cookies for advertising or tracking purposes.</p>
          </Section>

          <Section title="Your Responsibilities">
            <p>You are responsible for the security of your own wallet, seed phrase, and private key. Mintrs cannot recover lost wallets, reverse transactions, or access your wallet on your behalf.</p>
            <p>Always use the official Mintrs website and verify links before connecting your wallet or signing transactions.</p>
          </Section>

          <Section title="Changes to This Policy">
            <p>Mintrs may update this privacy policy from time to time. Changes will be reflected on this page. Continued use of Mintrs after any changes means you accept the updated policy.</p>
          </Section>

          <Section title="Contact">
            <p>For privacy-related questions or concerns, contact Mintrs through official support channels only. Never share your seed phrase or private key with anyone claiming to represent Mintrs.</p>
          </Section>

          <div className="rounded-xl border border-border bg-panel p-6 mt-10">
            <h2 className="text-lg font-semibold text-main-text mb-3">Important Reminder</h2>
            <p>Mintrs will never ask for your seed phrase or private key. NFTs and blockchain transactions involve risk. Always do your own research and verify all information before minting or signing any transaction.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-main-text mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-medium text-main-text mb-2">{title}</h3>
      {children}
    </div>
  );
}
