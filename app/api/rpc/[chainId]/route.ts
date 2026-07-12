import { NextRequest, NextResponse } from 'next/server';

const RPC_URLS: Record<string, string> = {
  '1':    `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  '8453': `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chainId: string }> }
) {
  const { chainId } = await params;
  const rpcUrl = RPC_URLS[chainId];

  if (!rpcUrl) {
    return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
  }

  const body = await req.text();
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
