import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId') ?? 'd1';

  // 定員データ（3年分）
  const quotas = await prisma.headcountQuota.findMany({
    where: { orgId },
    orderBy: [{ fiscalYear: 'asc' }, { category: 'asc' }],
  });

  // 異動計画データ（該当組織）
  const transfers = await prisma.transferPlan.findMany({
    where: { orgId },
  });

  return NextResponse.json({ quotas, transfers });
}

// 定員の更新
export async function PUT(request: Request) {
  const body = await request.json();
  const { orgId, fiscalYear, category, q1 } = body;

  const quota = await prisma.headcountQuota.upsert({
    where: { orgId_fiscalYear_category: { orgId, fiscalYear: Number(fiscalYear), category } },
    update: { q1: Number(q1) },
    create: { orgId, fiscalYear: Number(fiscalYear), category, q1: Number(q1), q2: Number(q1), q3: Number(q1), q4: Number(q1) },
  });
  return NextResponse.json(quota);
}
