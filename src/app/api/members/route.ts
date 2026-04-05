import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  const members = await prisma.member.findMany({
    where: orgId ? { orgId } : undefined,
    include: { org: true },
    orderBy: { empNo: 'asc' },
  });
  return NextResponse.json(members);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;

  const member = await prisma.member.update({
    where: { id },
    data,
  });
  return NextResponse.json(member);
}
