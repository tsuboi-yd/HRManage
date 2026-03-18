import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const snapshots = await prisma.snapshot.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(snapshots);
}

export async function POST(request: Request) {
  const body = await request.json();
  const snapshot = await prisma.snapshot.create({
    data: { label: body.label, date: body.date, comment: body.comment ?? null },
  });
  return NextResponse.json(snapshot, { status: 201 });
}
