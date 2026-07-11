"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Mintrs?",
    a: "Mintrs is an EVM-compatible NFT launchpad for launching and minting NFT collections. The platform helps approved creators set up mint pages, manage launch phases, handle allowlists, and give collectors a simple minting experience.",
  },
  {
    q: "Is Mintrs open to all creators?",
    a: "For now, no. Mintrs is currently gated, so projects need approval, an invite, or creator access before launching. This helps maintain quality and reduce spam collections. More creator access may become available in the future.",
  },
  {
    q: "How do I apply to launch on Mintrs?",
    a: "Open a ticket on our Discord to apply. You may be asked to provide project details such as your collection name, artwork previews, total supply, mint price, network choice, social links, and launch plan. Approval is not guaranteed.",
  },
  {
    q: "What wallets does Mintrs support?",
    a: "Mintrs supports EVM-compatible wallets. Make sure your wallet supports the EVM network your chosen collection is on. Mintrs will never ask for your seed phrase or private key.",
  },
  {
    q: "What networks does Mintrs support?",
    a: "Mintrs is currently EVM-compatible only, supporting Ethereum and other EVM chains available on the platform. Always confirm you are connected to the correct network before minting.",
  },
  {
    q: "How do I mint an NFT?",
    a: "Visit the official collection page on Mintrs, connect your EVM-compatible wallet, make sure you are on the correct network, review the mint price, supply, and wallet limit, select the quantity you want to mint, and confirm the transaction in your wallet. The NFT will be sent to your wallet once the transaction confirms on-chain.",
  },
  {
    q: "What is an allowlist?",
    a: "An allowlist is a list of wallet addresses approved to mint during a restricted phase. If your wallet is not on the allowlist, you cannot mint during that phase. You may need to wait for a public mint phase if the project opens one.",
  },
  {
    q: "Does being allowlisted guarantee I can mint?",
    a: "Not always. Allowlist rules depend on the project. Some allowlists may be guaranteed, while others are first come, first served. Always check the project's official mint details before the mint begins.",
  },
  {
    q: "What are wallet limits?",
    a: "Projects can set a maximum number of NFTs one wallet can mint during a phase or across the full mint. If your wallet reaches the limit, you will not be able to mint more from that wallet during that phase.",
  },
  {
    q: "Does Mintrs control gas fees?",
    a: "No. Gas fees are blockchain transaction fees paid to the network, not to Mintrs. They are not controlled by Mintrs and may change depending on network activity. Even free mints may require gas fees. Always review the full transaction cost in your wallet before confirming.",
  },
  {
    q: "Why did my transaction fail?",
    a: "A transaction may fail because of insufficient funds, wrong network, wallet not on the allowlist, inactive mint phase, sold-out supply, wallet limit reached, transaction rejected, or network congestion. If a transaction fails, the NFT will not be minted. Depending on the network, gas fees may still be spent.",
  },
  {
    q: "Where will my NFT appear after minting?",
    a: "Your NFT will appear in your wallet after the transaction confirms. It may also appear on supported NFT marketplaces after they index the collection. This can take time. If your NFT does not appear immediately on a marketplace, wait for indexing or try refreshing the metadata on that marketplace.",
  },
  {
    q: "Is every project on Mintrs safe?",
    a: "Mintrs may review projects before listing, but approval does not guarantee profit, future value, rewards, or project success. Collectors should always do their own research before participating in any mint. Always verify official links before minting.",
  },
  {
    q: "Will Mintrs ever ask for my seed phrase?",
    a: "Never. Mintrs will never ask for your seed phrase or private key. If anyone claiming to be Mintrs asks for this information, it is a scam.",
  },
  {
    q: "How do I get support?",
    a: "Contact Mintrs only through official support channels. When requesting support, include the collection name, your wallet address, the transaction hash, a screenshot of the issue, and a short explanation of what happened. Never share your seed phrase or private key with anyone.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-main-text mb-2">FAQ</h1>
        <p className="text-muted-text mb-10">Frequently asked questions about Mintrs.</p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-panel p-6 text-center">
          <p className="text-main-text font-medium mb-2">Still have questions?</p>
          <p className="text-muted-text text-sm mb-4">
            Open a ticket on our Discord and the Mintrs team will help you.
          </p>
          <a
            href="https://discord.gg/mintrs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
          >
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-panel overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-main-text pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-text transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-text leading-relaxed border-t border-border pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}
