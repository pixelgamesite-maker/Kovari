"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collectionName: string;
  imageUrl?: string;
  quantity: number;
  txHash?: string;
}

export function MintSuccessModal({ isOpen, onClose, collectionName, imageUrl, quantity, txHash }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      color: ["#2D6BFF", "#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#A78BFA"][
        Math.floor(Math.random() * 6)
      ],
      speed: Math.random() * 3 + 1.5,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
      drift: Math.random() * 2 - 1,
    }));

    let running = true;

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti canvas — behind the modal */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-40"
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-sm rounded-2xl border border-border bg-panel p-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-text hover:text-main-text transition-colors"
        >
          <X size={18} />
        </button>

        {/* Collection image */}
        <div className="mx-auto mb-5 h-32 w-32 overflow-hidden rounded-2xl border border-border bg-background">
          {imageUrl ? (
            <img src={imageUrl} alt={collectionName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🎉</div>
          )}
        </div>

        {/* Success message */}
        <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent-blue">
          Mint Successful
        </div>
        <h2 className="mb-1 text-xl font-bold text-main-text">
          You got {quantity === 1 ? "it" : `${quantity}`}!
        </h2>
        <p className="mb-5 text-sm text-muted-text">
          {quantity === 1
            ? `Your ${collectionName} NFT is on its way to your wallet.`
            : `Your ${quantity} ${collectionName} NFTs are on their way to your wallet.`}
        </p>

        {/* Actions */}
        <div className="space-y-2">
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-muted-text hover:text-main-text hover:border-accent-blue/30 transition-colors"
            >
              <ExternalLink size={14} />
              View on Etherscan
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-accent-blue py-2.5 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
