'use client';
import { useState, useMemo, useCallback } from 'react';
import QuotaSummaryBar, { FiscalYearData } from './QuotaSummaryBar';
import BulkSubmitModal from './BulkSubmitModal';
import { usePlanDeltas } from '@/contexts/PlanDeltaContext';

const CATEGORY_LABELS = ['管理職', '正社員', '非正規'];

// 現員のデフォルト値（第一開発部）
const DEFAULT_CURRENT = [
  { label: CATEGORY_LABELS[0], count: 1, color: '#1976D2' },
  { label: CATEGORY_LABELS[1], count: 14, color: '#388E3C' },
  { label: CATEGORY_LABELS[2], count: 4, color: '#F57C00' },
];

// 定員データ（ハードコード：seed.ts と同じ値）
const DEFAULT_QUOTAS: Record<string, [number, number, number]> = {
  '2026': [8, 30, 6],
  '2027': [7, 35, 6],
  '2028': [7, 31, 6],
};

// ── モジュールレベルキャッシュ ──
let _cachedQuotas: Record<string, (number | null)[]> | null = null;
let _cachedReasons: Record<string, string[]> | null = null;

interface Props {
  deptName: string;
  orgId?: string;
}

export default function QuotaSummarySection({ deptName }: Props) {
  const { aggregated, deltas } = usePlanDeltas();
  const [showModal, setShowModal] = useState(false);

  const [quotas, setQuotas] = useState<Record<string, (number | null)[]>>(
    _cachedQuotas ?? {
      '2026': [...DEFAULT_QUOTAS['2026']],
      '2027': [...DEFAULT_QUOTAS['2027']],
      '2028': [...DEFAULT_QUOTAS['2028']],
    }
  );
  const [reasons, setReasons] = useState<Record<string, string[]>>(
    _cachedReasons ?? { '2026': ['','',''], '2027': ['','',''], '2028': ['','',''] }
  );

  // 充員数（hiringデルタ + transferinデルタ）
  const fillingByYear = useMemo(() => {
    const result: Record<string, [number, number, number]> = {};
    const hd = deltas.hiring;
    if (hd) {
      for (const [year, vals] of Object.entries(hd)) {
        result[year] = [...vals] as [number, number, number];
      }
    }
    const td = deltas.transferin;
    if (td) {
      for (const [year, vals] of Object.entries(td)) {
        if (!result[year]) result[year] = [0, 0, 0];
        result[year][0] += vals[0];
        result[year][1] += vals[1];
        result[year][2] += vals[2];
      }
    }
    return result;
  }, [deltas]);

  // バイネーム確定数（membersデルタの絶対値）
  const confirmedByYear = useMemo(() => {
    const result: Record<string, [number, number, number]> = {};
    const md = deltas.members;
    if (md) {
      for (const [year, vals] of Object.entries(md)) {
        result[year] = [Math.abs(vals[0]), Math.abs(vals[1]), Math.abs(vals[2])] as [number, number, number];
      }
    }
    return result;
  }, [deltas]);

  // 年度データを構築
  const quotaFiscalYears: FiscalYearData[] = useMemo(() => {
    return ['2026', '2027', '2028'].map(year => {
      const filling = fillingByYear[year] ?? [0, 0, 0];
      const confirmed = confirmedByYear[year] ?? [0, 0, 0];
      const r = reasons[year] ?? ['', '', ''];
      return {
        year,
        categories: CATEGORY_LABELS.map((label, ci) => ({
          label,
          quota: quotas[year]?.[ci] ?? null,
          quotaReason: r[ci],
          byname: filling[ci],
          bynameConfirmed: confirmed[ci],
        })),
      };
    });
  }, [quotas, reasons, fillingByYear, confirmedByYear]);

  // 定員更新ハンドラ（理由付き、ローカルのみ）
  const handleQuotaChange = useCallback((fyIdx: number, catIdx: number, value: number, reason: string) => {
    const year = quotaFiscalYears[fyIdx]?.year;
    if (!year) return;

    setQuotas(prev => {
      const arr = [...(prev[year] ?? [null, null, null])];
      arr[catIdx] = value;
      const next = { ...prev, [year]: arr };
      _cachedQuotas = next;
      return next;
    });
    setReasons(prev => {
      const arr = [...(prev[year] ?? ['', '', ''])];
      arr[catIdx] = reason;
      const next = { ...prev, [year]: arr };
      _cachedReasons = next;
      return next;
    });
  }, [quotaFiscalYears]);

  // ── 一括申請チェックリスト ──
  const quotasDone = useMemo(() => {
    return ['2026', '2027', '2028'].every(year => quotas[year]?.every(v => v != null));
  }, [quotas]);

  const membersDone = useMemo(() => {
    const md = deltas.members;
    if (!md) return false;
    return Object.values(md).some(([m, s, n]) => m !== 0 || s !== 0 || n !== 0);
  }, [deltas]);

  const hiringDone = useMemo(() => {
    const hd = deltas.hiring;
    if (!hd) return false;
    return Object.values(hd).some(([m, s, n]) => m !== 0 || s !== 0 || n !== 0);
  }, [deltas]);

  const memberCount = useMemo(() => {
    const md = deltas.members;
    if (!md) return 0;
    let count = 0;
    for (const [m, s, n] of Object.values(md)) { count += Math.abs(m) + Math.abs(s) + Math.abs(n); }
    return count;
  }, [deltas]);

  const checkItems = useMemo(() => [
    { label: '定員・計画サマリ', done: quotasDone, sub: quotasDone ? '3年分の定員数が入力されています' : '定員が未入力の年度があります', linkLabel: quotasDone ? '確認する' : '入力する', href: '/members' },
    { label: '異動計画', done: membersDone, sub: membersDone ? `${memberCount}件の異動計画が登録されています` : '異動計画が未登録です', linkLabel: membersDone ? '確認する' : '入力する', href: '/members' },
    { label: '退職・採用計画', done: hiringDone, sub: hiringDone ? '採用計画が登録されています' : '採用計画が未入力です', linkLabel: hiringDone ? '確認する' : '入力する', href: '/retirement-plans' },
  ], [quotasDone, membersDone, hiringDone, memberCount]);

  return (
    <div className="px-6 pt-5 pb-5" style={{ backgroundColor: '#ECEFF1' }}>
      <QuotaSummaryBar
        deptName={deptName}
        currentMembers={DEFAULT_CURRENT}
        fiscalYears={quotaFiscalYears}
        onQuotaChange={handleQuotaChange}
        onBulkSubmit={() => setShowModal(true)}
      />
      {showModal && (
        <BulkSubmitModal
          items={checkItems}
          onClose={() => setShowModal(false)}
          onSubmit={() => { setShowModal(false); alert('一括申請が完了しました'); }}
        />
      )}
    </div>
  );
}
