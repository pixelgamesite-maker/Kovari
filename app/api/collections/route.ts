import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export type CollectionMeta = {
  address: string;
  verified: boolean;
  featured: boolean;
  twitter?: string;
  discord?: string;
  website?: string;
  telegram?: string;
};

// GET /api/collections?address=0x...
// Returns socials + verified/featured status for one collection
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')?.toLowerCase();
  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT address, verified, featured, twitter, discord, website, telegram
     FROM mintrs.collections WHERE address = $1`,
    [address]
  );

  if (rows.length === 0) {
    return NextResponse.json({
      address, verified: false, featured: false,
      twitter: null, discord: null, website: null, telegram: null,
    });
  }

  return NextResponse.json(rows[0]);
}

// POST /api/collections
// Upserts socials + verified/featured (admin only — checked via Factory owner)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, verified, featured, twitter, discord, website, telegram, adminSignature } = body;

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // Simple admin key check — the admin sets ADMIN_API_KEY in Railway env vars
  // and the dashboard sends it in the request header.
  // Not NEXT_PUBLIC so it stays server-side only.
  const apiKey = req.headers.get('x-admin-key');
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await pool.query(
    `INSERT INTO mintrs.collections
       (address, verified, featured, twitter, discord, website, telegram, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (address) DO UPDATE SET
       verified = EXCLUDED.verified,
       featured = EXCLUDED.featured,
       twitter  = EXCLUDED.twitter,
       discord  = EXCLUDED.discord,
       website  = EXCLUDED.website,
       telegram = EXCLUDED.telegram,
       updated_at = now()`,
    [
      address.toLowerCase(),
      verified ?? false,
      featured ?? false,
      twitter || null,
      discord || null,
      website || null,
      telegram || null,
    ]
  );

  return NextResponse.json({ ok: true });
}
