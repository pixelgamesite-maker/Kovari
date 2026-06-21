export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-main-text mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-text leading-relaxed">
            Kovari respects your privacy. This policy explains how we collect, use, and protect
            your information.
          </p>
          <h2 className="text-xl font-semibold text-main-text mt-8 mb-4">Information We Collect</h2>
          <p className="text-muted-text leading-relaxed">
            We collect wallet addresses and on-chain transaction data necessary for platform
            functionality. We do not collect personal identifying information.
          </p>
        </div>
      </div>
    </div>
  );
}
