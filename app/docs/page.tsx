"use client";

import { useState } from "react";
import { ChevronDown, Rocket, Users, PenSquare, AlertTriangle, HelpCircle, ShieldCheck } from "lucide-react";

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: { heading?: string; body: string[] }[];
};

const SECTIONS: Section[] = [
  {
    id: "overview",
    title: "What is Mintrs?",
    icon: <Rocket size={16} />,
    content: [
      {
        body: [
          "Mintrs is an EVM-compatible NFT launchpad for launching and minting NFT collections. The platform helps approved creators and project teams create mint pages, manage launch phases, set wallet limits, handle allowlists, and give collectors a simple minting experience.",
        ],
      },
      {
        heading: "Mintrs is built around",
        body: [
          "Curated NFT launches · Approved creator access · EVM-compatible minting · Clean collection pages · Allowlist and public mint phases · Wallet-based minting · Community-focused drops · Simple launch tools for selected projects.",
        ],
      },
      {
        heading: "Gated access",
        body: [
          "Mintrs is currently gated — projects need approval, an invite, or creator access before launching. This helps maintain quality and keep the minting experience clean for collectors. More creator access may become available over time.",
        ],
      },
      {
        heading: "EVM compatibility",
        body: [
          "Mintrs currently supports EVM-compatible wallets and networks only. Confirm your wallet and network before minting or launching — non-EVM wallets are not supported.",
        ],
      },
    ],
  },
  {
    id: "collectors",
    title: "For Collectors",
    icon: <Users size={16} />,
    content: [
      {
        heading: "How to mint",
        body: [
          "1. Visit the official Mintrs collection page.",
          "2. Connect your EVM-compatible wallet.",
          "3. Make sure your wallet is on the correct network.",
          "4. Check the mint price, supply, wallet limit, and active phase.",
          "5. Select the number of NFTs you want to mint.",
          "6. Confirm the transaction in your wallet.",
          "7. Wait for the transaction to confirm on-chain.",
        ],
      },
      {
        heading: "Mint phases",
        body: [
          "Allowlist Mint — restricted to approved wallet addresses. Being allowlisted doesn't always guarantee a mint unless stated.",
          "Public Mint — open to everyone while supply lasts, though wallet limits and timing may still apply.",
          "Free Mint — price is zero, but gas fees still apply.",
          "Paid Mint — mint price plus gas. Always check the full cost in your wallet before confirming.",
        ],
      },
      {
        heading: "Wallet limits & gas",
        body: [
          "A wallet limit controls how many NFTs one wallet can mint per phase or overall. Gas fees are network transaction costs — Mintrs doesn't control or set them, and they can rise during network congestion.",
        ],
      },
      {
        heading: "After minting",
        body: [
          "Your NFT is sent to the wallet used for the transaction. It may take time to appear on marketplaces since they need to index the collection and metadata separately.",
        ],
      },
    ],
  },
  {
    id: "creators",
    title: "For Creators",
    icon: <PenSquare size={16} />,
    content: [
      {
        heading: "Applying to launch",
        body: [
          "Mintrs is gated for creators. To apply, projects typically provide: project name, description, artwork previews, total supply, mint price, network choice, team details, social links, launch plan, allowlist plan, and mint date. Approval is not guaranteed.",
        ],
      },
      {
        heading: "Creating a collection",
        body: [
          "Approved creators set up: collection name, description, banner, mint image, supply, price, phases, wallet limits, allowlist wallets, launch date, network, and social links. Review everything carefully — once minting begins, some settings become difficult or impossible to change.",
        ],
      },
      {
        heading: "Responsibilities",
        body: [
          "Creators are responsible for accurate project info, original or properly licensed artwork, correct supply/mint details, clear communication, and following platform rules and applicable law. Mintrs provides the tools — each project team owns its own collection.",
        ],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Common Issues",
    icon: <AlertTriangle size={16} />,
    content: [
      {
        heading: "Wallet not connecting",
        body: ["Confirm you're using an updated, EVM-compatible wallet, on the official Mintrs site, with the wallet unlocked."],
      },
      {
        heading: "Wrong network",
        body: ["Switch to the network required by the collection — minting won't work on an unsupported network."],
      },
      {
        heading: "Not allowlisted / sold out / wallet limit reached",
        body: ["If a phase requires allowlist access and your wallet isn't listed, wait for public mint if one opens. Sold-out collections and wallet limits are final for that phase."],
      },
      {
        heading: "Insufficient funds",
        body: ["Your wallet needs enough for both the mint price and gas — even free mints require gas."],
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    icon: <HelpCircle size={16} />,
    content: [
      { heading: "Is Mintrs open to all creators?", body: ["Not yet — Mintrs is gated. Projects need approval, an invite, or creator access."] },
      { heading: "Can I use a non-EVM wallet?", body: ["No, Mintrs currently supports EVM-compatible wallets and networks only."] },
      { heading: "Does allowlist mean guaranteed mint?", body: ["Not always — it depends on the project. Some allowlists guarantee a mint, others are first-come-first-served."] },
      { heading: "Does Mintrs control gas fees?", body: ["No — gas fees are set by the blockchain network, not Mintrs."] },
      { heading: "Is every project on Mintrs guaranteed safe?", body: ["No. Mintrs may review projects, but approval doesn't guarantee profit, value, or success. Always do your own research."] },
    ],
  },
];

function AccordionItem({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
  return (
    <div id={section.id} className="rounded-xl border border-border bg-panel overflow-hidden scroll-mt-24">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 font-semibold text-main-text">
          <span className="text-accent-blue">{section.icon}</span>
          {section.title}
        </span>
        <ChevronDown
          size={18}
          className={`text-muted-text transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-5 py-5 space-y-4">
            {section.content.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h4 className="mb-1.5 text-sm font-semibold text-main-text">{block.heading}</h4>
                )}
                {block.body.map((line, j) => (
                  <p key={j} className="text-sm leading-relaxed text-muted-text">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [openId, setOpenId] = useState<string | null>("overview");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-blue">
          <ShieldCheck size={14} /> Launch on Mintrs
        </div>
        <h1 className="text-3xl font-bold text-main-text mb-3">Documentation</h1>
        <p className="text-muted-text max-w-2xl">
          Everything collectors and creators need to know about minting, launching, and using Mintrs safely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        {/* Sticky side nav — desktop only */}
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpenId(s.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-text hover:text-main-text hover:bg-white/5 transition-colors"
              >
                {s.icon} {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <AccordionItem
              key={section.id}
              section={section}
              isOpen={openId === section.id}
              onToggle={() => setOpenId((cur) => (cur === section.id ? null : section.id))}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <p className="text-xs leading-relaxed text-yellow-500/90">
          <strong>Disclaimer:</strong> Mintrs is a gated, EVM-compatible NFT launchpad. NFTs involve risk.
          Minting, buying, selling, or holding NFTs does not guarantee profit, future value, rewards, or
          project success. Always verify official links, wallet details, and transaction information before
          signing anything.
        </p>
      </div>
    </div>
  );
}
