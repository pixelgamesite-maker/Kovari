export default function TermsPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-main-text mb-2">Terms of Use</h1>
        <p className="text-muted-text text-sm mb-10">Last updated: July 2026</p>

        <div className="space-y-10 text-muted-text leading-relaxed">

          <Section title="Welcome to Mintrs">
            <p>Mintrs is an EVM-compatible NFT launchpad for launching and minting NFT collections. For now, Mintrs is a gated launchpad. This means projects cannot launch automatically without approval, an invite, or creator access from the Mintrs team.</p>
            <p>By accessing or using Mintrs, you agree to be bound by these terms.</p>
          </Section>

          <Section title="What is Gated?">
            <p>Gated means not every project can instantly create and launch a collection on the platform. Projects may need to be approved, invited, or given creator access before launching on Mintrs. This helps Mintrs maintain quality, reduce spam launches, and keep the minting experience cleaner for collectors.</p>
            <p>More creator access may become available in the future.</p>
          </Section>

          <Section title="EVM Compatibility">
            <p>Mintrs is currently EVM-compatible only. This means Mintrs works with wallets and networks that support the Ethereum Virtual Machine. Collectors and creators must make sure they are using the correct network before minting or launching. If a wallet or network is not EVM-compatible, it may not work on Mintrs.</p>
          </Section>

          <Section title="Supported Wallets">
            <p>Mintrs supports EVM-compatible wallets. Before minting, collectors should confirm that:</p>
            <ul>
              <li>Their wallet supports EVM networks</li>
              <li>They are connected to the correct chain</li>
              <li>They have enough funds for mint price and gas</li>
              <li>They are using the official Mintrs website</li>
              <li>They are on the correct collection page</li>
            </ul>
            <p className="font-medium text-main-text">Mintrs will never ask for your seed phrase or private key.</p>
          </Section>

          <Section title="Mint Phases">
            <p>Projects on Mintrs may use different mint phases depending on their launch plan.</p>
            <SubSection title="Allowlist Mint">
              <p>An allowlist mint is a restricted mint phase for approved wallet addresses. Only wallets added to the allowlist can mint during this phase. Being allowlisted does not always guarantee a mint unless the project clearly states that access is guaranteed.</p>
            </SubSection>
            <SubSection title="Public Mint">
              <p>A public mint is open to everyone while supply is available. Public mint may still have wallet limits, network requirements, supply limits, start and end times, and mint price requirements.</p>
            </SubSection>
            <SubSection title="Free Mint">
              <p>A free mint means the mint price is zero, but users may still need to pay gas fees on the blockchain network. Gas fees are not controlled by Mintrs.</p>
            </SubSection>
          </Section>

          <Section title="Gas Fees">
            <p>Gas fees are blockchain transaction fees. Mintrs does not control gas fees. Gas fees are paid to the blockchain network and may change depending on network activity. Before confirming a mint, always review the transaction details in your wallet.</p>
          </Section>

          <Section title="Failed Transactions">
            <p>A mint transaction may fail for different reasons, including insufficient wallet balance, wrong network, wallet not allowlisted, mint phase not active, collection sold out, wallet limit reached, transaction rejected, or network congestion. If a transaction fails, the NFT will not be minted. Depending on the network, gas fees may still be spent even if the transaction fails.</p>
          </Section>

          <Section title="Wallet Limits">
            <p>Projects can set wallet limits for minting. A wallet limit controls how many NFTs one wallet can mint during a phase or across the full mint. If your wallet has reached the limit, you will not be able to mint more from that wallet.</p>
          </Section>

          <Section title="Project Responsibilities">
            <p>Creators launching on Mintrs are responsible for providing accurate project information, using original or properly licensed artwork, setting correct supply and mint details, communicating clearly with their community, avoiding misleading promises, delivering what they publicly announce, and following platform rules and applicable laws.</p>
            <p>Mintrs provides launch tools, but each project team is responsible for its own collection.</p>
          </Section>

          <Section title="Royalties">
            <p>Projects may set royalties where supported. Royalty behavior can vary depending on marketplaces and network standards. Mintrs may display royalty details, but royalty enforcement outside the platform may depend on third-party marketplaces. Creators should not assume every marketplace will enforce royalties the same way.</p>
          </Section>

          <Section title="Refunds">
            <p>Refund rules depend on the project. Unless clearly stated by the project, successful on-chain mint transactions are usually final. Collectors should understand a project's terms before minting.</p>
          </Section>

          <Section title="Collector Safety">
            <p>Before minting, always check the official Mintrs website, the correct collection page, the project's official links, the mint price, the network, the wallet limit, the contract details, and the transaction details before signing.</p>
            <p className="font-medium text-main-text">Never share your seed phrase or private key. Mintrs will never ask for your seed phrase.</p>
          </Section>

          <Section title="Marketplace Indexing">
            <p>After minting, NFTs may take time to appear correctly on marketplaces. Marketplaces may need to index contract data, token ownership, metadata, images, and collection details. Mintrs does not fully control how fast third-party marketplaces index NFTs.</p>
          </Section>

          <div className="rounded-xl border border-border bg-panel p-6 mt-10">
            <h2 className="text-lg font-semibold text-main-text mb-3">Important Disclaimer</h2>
            <p>Mintrs is a gated, EVM-compatible NFT launchpad. NFTs involve risk. Minting, buying, selling, or holding NFTs does not guarantee profit, future value, rewards, or project success. Mintrs may review projects, but collectors are responsible for doing their own research before participating in any mint. Always verify official links, wallet details, network details, and transaction information before signing anything.</p>
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
