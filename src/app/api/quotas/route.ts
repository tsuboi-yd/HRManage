import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  const quotas = await prisma.headcountQuota.findMany({
    where: orgId ? { orgId } : undefined,
    include: { org: true },
    orderBy: [{ orgId: 'asc' }, { fiscalYear: 'asc' }],
  });
  return NextResponse.json(quotas);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { orgId, fiscalYear, category, q1, q2, q3, q4, note } = body;

  const quota = await prisma.headcountQuota.upsert({
    where: { orgId_fiscalYear_category: { orgId, fiscalYear, category } },
    update: { q1, q2, q3, q4, note },
    create: { orgId, fiscalYear, category, q1, q2, q3, q4, note },
  });
  return NextResponse.json(quota);
}
