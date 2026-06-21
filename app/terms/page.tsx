export default function TermsPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-main-text mb-6">Terms of Use</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-text leading-relaxed">
            These terms govern your use of the Kovari platform. By accessing or using Kovari,
            you agree to be bound by these terms.
          </p>
          <h2 className="text-xl font-semibold text-main-text mt-8 mb-4">1. Platform Use</h2>
          <p className="text-muted-text leading-relaxed">
            Kovari provides tools for launching and managing NFT collections. You are responsible
            for ensuring your collections comply with applicable laws and do not infringe on
            third-party rights.
          </p>
          <h2 className="text-xl font-semibold text-main-text mt-8 mb-4">2. Smart Contracts</h2>
          <p className="text-muted-text leading-relaxed">
            All smart contracts deployed through Kovari are immutable once deployed. Review your
            configuration carefully before deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
