import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  const plans = await prisma.transferInPlan.findMany({
    where: orgId ? { destOrgId: orgId } : undefined,
    include: { destOrg: true },
    orderBy: { no: 'asc' },
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const count = await prisma.transferInPlan.count();
  const no = `TIN-${String(count + 1).padStart(3, '0')}`;

  const plan = await prisma.transferInPlan.create({
    data: { ...body, no },
  });
  return NextResponse.json(plan, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;

  const plan = await prisma.transferInPlan.update({
    where: { id },
    data,
  });
  return NextResponse.json(plan);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.transferInPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
