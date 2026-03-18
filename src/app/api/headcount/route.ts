import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  const plans = await prisma.headcountPlan.findMany({
    where: orgId ? { orgId } : undefined,
    orderBy: [{ orgId: 'asc' }, { monthIdx: 'asc' }],
  });
  return NextResponse.json(plans);
}
