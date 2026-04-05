import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MANAGER_RANKS = new Set(['課長', '部長', '次長']);

function getFiscalYear(dateStr: string): string | null {
  const m = dateStr.match(/(\d{4})年(\d{1,2})月/);
  if (!m) return null;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  return String(month >= 4 ? year : year - 1);
}

type YD = Record<string, [number, number, number]>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId') ?? 'd1';

  // 1. Members (転出・退職 = マイナス)
  const members = await prisma.member.findMany({ where: { orgId } });
  const membersD: YD = {};
  for (const m of members) {
    if (!m.transferType || !m.transferDate) continue;
    if (m.transferType !== '転出（異動）' && m.transferType !== '退職') continue;
    const fy = getFiscalYear(m.transferDate);
    if (!fy) continue;
    if (!membersD[fy]) membersD[fy] = [0, 0, 0];
    membersD[fy][MANAGER_RANKS.has(m.rank) ? 0 : 1] -= 1;
  }

  // 2. Hiring (採用 = プラス)
  const hiringPlans = await prisma.hiringPlan.findMany({ where: { orgId } });
  const hiringD: YD = {};
  for (const h of hiringPlans) {
    const fy = getFiscalYear(h.targetDate);
    if (!fy) continue;
    if (!hiringD[fy]) hiringD[fy] = [0, 0, 0];
    hiringD[fy][h.type === '契約' ? 2 : 1] += h.count;
  }

  // 3. TransferIn (転入 = プラス、一般正社員)
  const transferIns = await prisma.transferInPlan.findMany({ where: { destOrgId: orgId } });
  const transferinD: YD = {};
  for (const t of transferIns) {
    const fy = getFiscalYear(t.targetDate);
    if (!fy) continue;
    if (!transferinD[fy]) transferinD[fy] = [0, 0, 0];
    transferinD[fy][1] += 1;
  }

  return NextResponse.json({
    members: membersD,
    hiring: hiringD,
    transferin: transferinD,
  });
}
