import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const transfers = await prisma.transferPlan.findMany({
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(transfers);
}
