import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orgs = await prisma.organization.findMany({
    orderBy: { level: 'asc' },
  });
  return NextResponse.json(orgs);
}
