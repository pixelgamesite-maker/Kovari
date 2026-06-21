"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Check, Upload, Link, Lock, Tag, Hash } from "lucide-react";

const steps = [
  { id: "basics", label: "Collection Info" },
  { id: "assets", label: "Assets" },
  { id: "phases", label: "Mint Phases" },
  { id: "settings", label: "Settings" },
  { id: "review", label: "Review" },
];

export default function LaunchPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-main-text mb-2">Launch Collection</h1>
          <p className="text-muted-text">Deploy your NFT collection on Ethereum or Base</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  i === currentStep
                    ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                    : i < currentStep
                    ? "bg-accent-blue/5 text-accent-blue"
                    : "bg-panel text-muted-text border border-border"
                )}
              >
                {i < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-text shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-border bg-panel p-6 sm:p-8">
          {currentStep === 0 && <BasicsStep />}
          {currentStep === 1 && <AssetsStep />}
          {currentStep === 2 && <PhasesStep />}
          {currentStep === 3 && <SettingsStep />}
          {currentStep === 4 && <ReviewStep />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={() =>
              setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
            }
          >
            {currentStep === steps.length - 1 ? "Deploy" : "Continue"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-main-text">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-text">{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-main-text placeholder:text-muted-text focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-colors",
        props.className
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-main-text placeholder:text-muted-text focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-colors resize-none",
        props.className
      )}
    />
  );
}

function BasicsStep() {
  return (
    <div className="space-y-6">
      <FormField label="Collection Name" hint="This will be the display name for your NFT collection">
        <Input placeholder="e.g., Dusky Lads" />
      </FormField>
      <FormField label="Slug" hint="Used in the URL: kovari.io/collections/your-slug">
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input className="pl-10" placeholder="dusky-lads" />
        </div>
      </FormField>
      <FormField label="Description">
        <TextArea rows={4} placeholder="Tell the story behind your collection..." />
      </FormField>
      <FormField label="Network">
        <div className="grid grid-cols-2 gap-3">
          {["Ethereum", "Base"].map((chain) => (
            <button
              key={chain}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-main-text hover:border-accent-blue/30 transition-colors text-left"
            >
              {chain}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function AssetsStep() {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-accent-blue/30 transition-colors cursor-pointer">
        <Upload className="h-8 w-8 text-muted-text mx-auto mb-3" />
        <p className="text-sm font-medium text-main-text mb-1">Upload collection assets</p>
        <p className="text-xs text-muted-text">Drag and drop or click to browse. ZIP of images or folder.</p>
      </div>
      <FormField label="Banner Image" hint="Recommended 1600x400">
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <Link className="h-4 w-4 text-muted-text mx-auto mb-2" />
          <p className="text-xs text-muted-text">Paste image URL or upload</p>
        </div>
      </FormField>
    </div>
  );
}

function PhasesStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-main-text">Phase 1: Allowlist</h3>
          <button className="text-xs text-accent-blue">Edit</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price (ETH)">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
              <Input className="pl-10" placeholder="0.05" />
            </div>
          </FormField>
          <FormField label="Max Per Wallet">
            <Input type="number" placeholder="2" />
          </FormField>
        </div>
      </div>
      <Button variant="outline" className="w-full">
        + Add Phase
      </Button>
    </div>
  );
}

function SettingsStep() {
  return (
    <div className="space-y-6">
      <FormField label="Total Supply">
        <Input type="number" placeholder="1111" />
      </FormField>
      <FormField label="Royalties (%)" hint="Creator fee on secondary sales">
        <Input type="number" step="0.1" placeholder="5" />
      </FormField>
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex items-center gap-3 mb-3">
          <Lock className="h-4 w-4 text-muted-text" />
          <div>
            <p className="text-sm font-medium text-main-text">Trading Lock</p>
            <p className="text-xs text-muted-text">Prevent immediate flipping</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input type="number" placeholder="14" className="w-24" />
          <span className="text-sm text-muted-text">days</span>
        </div>
      </div>
    </div>
  );
}

function ReviewStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4">
        <p className="text-sm text-main-text font-medium mb-1">Ready to deploy</p>
        <p className="text-xs text-muted-text">
          Review your settings above. Once deployed, the contract is immutable.
        </p>
      </div>
      <div className="space-y-3">
        {[
          { label: "Network", value: "Base" },
          { label: "Total Supply", value: "1,111" },
          { label: "Phases", value: "2" },
          { label: "Trading Lock", value: "14 days" },
          { label: "Royalties", value: "5%" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-text">{item.label}</span>
            <span className="text-sm font-medium text-main-text">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
