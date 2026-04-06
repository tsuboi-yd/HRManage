'use client';
import AppBar from './AppBar';
import TabBar from './TabBar';
import QuotaSummarySection from './QuotaSummarySection';
import { PlanDeltaProvider, getFiscalYear } from '@/contexts/PlanDeltaContext';

interface Props {
  children: React.ReactNode;
}

const MANAGER_RANKS = new Set(['課長', '部長', '次長']);

// ── 初期デルタ（ハードコード） ──
// members: 転出・退職（INIT_MEMBERS から異動ありのみ抽出）
const INIT_MEMBERS_RAW: { rank: string; transferType: string; transferDate: string }[] = [
  { rank: '主任',   transferType: '転出（異動）', transferDate: '2026年7月' },
  { rank: '一般',   transferType: '退職',         transferDate: '2026年6月' },
  { rank: '主任',   transferType: '転出（異動）', transferDate: '2026年7月' },
  { rank: '課長',   transferType: '退職',         transferDate: '2026年9月' },
  { rank: '一般',   transferType: '退職',         transferDate: '2026年8月' },
  { rank: '主任',   transferType: '転出（異動）', transferDate: '2026年9月' },
  { rank: '副主任', transferType: '転出（異動）', transferDate: '2026年9月' },
];

// hiring: 採用計画
const INIT_HIRING_RAW: { type: string; count: number; targetDate: string }[] = [
  { type: '中途', count: 2, targetDate: '2026年6月' },
  { type: '中途', count: 1, targetDate: '2026年7月' },
  { type: '新卒', count: 3, targetDate: '2027年3月' },
  { type: '中途', count: 1, targetDate: '2026年8月' },
  { type: '契約', count: 2, targetDate: '2026年5月' },
];

// transferin: 転入
const INIT_TRANSFERIN_RAW: { targetDate: string }[] = [
  { targetDate: '2026年9月' },
  { targetDate: '2026年11月' },
  { targetDate: '2026年10月' },
  { targetDate: '2027年1月' },
  { targetDate: '2026年7月' },
];

function computeInitialDeltas() {
  type YD = Record<string, [number, number, number]>;

  const membersD: YD = {};
  for (const m of INIT_MEMBERS_RAW) {
    const fy = getFiscalYear(m.transferDate);
    if (!fy) continue;
    if (!membersD[fy]) membersD[fy] = [0, 0, 0];
    membersD[fy][MANAGER_RANKS.has(m.rank) ? 0 : 1] -= 1;
  }

  const hiringD: YD = {};
  for (const h of INIT_HIRING_RAW) {
    const fy = getFiscalYear(h.targetDate);
    if (!fy) continue;
    if (!hiringD[fy]) hiringD[fy] = [0, 0, 0];
    hiringD[fy][h.type === '契約' ? 2 : 1] += h.count;
  }

  const tinD: YD = {};
  for (const t of INIT_TRANSFERIN_RAW) {
    const fy = getFiscalYear(t.targetDate);
    if (!fy) continue;
    if (!tinD[fy]) tinD[fy] = [0, 0, 0];
    tinD[fy][1] += 1;
  }

  return { members: membersD, hiring: hiringD, transferin: tinD };
}

const INITIAL_DELTAS = computeInitialDeltas();

export default function DeptPageShell({ children }: Props) {
  return (
    <PlanDeltaProvider initialDeltas={INITIAL_DELTAS}>
      <div className="flex flex-col min-h-screen bg-background">
        <AppBar roleIcon="person" roleLabel="部長：田中太郎" showNotification />
        <QuotaSummarySection deptName="第一開発部" />
        <TabBar />
        {children}
      </div>
    </PlanDeltaProvider>
  );
}
