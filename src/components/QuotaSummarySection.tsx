'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import QuotaSummaryBar, { FiscalYearData } from './QuotaSummaryBar';
import BulkSubmitModal from './BulkSubmitModal';
import { usePlanDeltas } from '@/contexts/PlanDeltaContext';

const CATEGORY_MAP: Record<string, number> = { manager: 0, staff: 1, non_regular: 2 };
const CATEGORY_LABELS = ['管理職', '正社員', '非正規'];

// 現員のデフォルト値（第一開発部）
const DEFAULT_CURRENT = [
  { label: CATEGORY_LABELS[0], count: 1, color: '#1976D2' },
  { label: CATEGORY_LABELS[1], count: 14, color: '#388E3C' },
  { label: CATEGORY_LABELS[2], count: 4, color: '#F57C00' },
];

interface QuotaRow {
  orgId: string;
  fiscalYear: number;
  category: string;
  q1: number;
}

// ── モジュールレベルキャッシュ ──
let _cachedQuotas: Record<string, (number | null)[]> | null = null;
let _cachedReasons: Record<string, string[]> | null = null;
let _cachedOrgId: string | null = null;

interface Props {
  deptName: string;
  orgId?: string;
}

export default function QuotaSummarySection({ deptName, orgId = 'd1' }: Props) {
  const { aggregated, deltas } = usePlanDeltas();
  const [showModal, setShowModal] = useState(false);

  const [quotas, setQuotas] = useState<Record<string, (number | null)[]>>(
    (_cachedOrgId === orgId && _cachedQuotas) ? _cachedQuotas : { '2026': [null,null,null], '2027': [null,null,null], '2028': [null,null,null] }
  );
  const [reasons, setReasons] = useState<Record<string, string[]>>(
    (_cachedOrgId === orgId && _cachedReasons) ? _cachedReasons : { '2026': ['','',''], '2027': ['','',''], '2028': ['','',''] }
  );
  const fetched = useRef(_cachedOrgId === orgId);

  // APIから定員データを取得
  useEffect(() => {
    if (fetched.current) return;
    fetch(`/api/quota-summary?orgId=${orgId}`)
      .then(r => r.json())
      .then(data => {
        const q: Record<string, (number | null)[]> = { '2026': [null,null,null], '2027': [null,null,null], '2028': [null,null,null] };
        (data.quotas as QuotaRow[]).forEach(row => {
          const fy = String(row.fiscalYear);
          const ci = CATEGORY_MAP[row.category];
          if (q[fy] && ci !== undefined) q[fy][ci] = row.q1;
        });
        setQuotas(q);
        _cachedQuotas = q;
        _cachedOrgId = orgId;
        fetched.current = true;
      })
      .catch(e => console.error('quota-summary fetch failed:', e));
  }, [orgId]);

  // 充員数（hiringデルタ: 採用計画の合計）を年度ごとに取得
  const fillingByYear = useMemo(() => {
    const result: Record<string, [number, number, number]> = {};
    const hd = deltas.hiring;
    if (hd) {
      for (const [year, vals] of Object.entries(hd)) {
        result[year] = [...vals] as [number, number, number];
      }
    }
    // 転入も充員に加算
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

  // バイネーム確定数（membersデルタ: 異動計画で名前入りの件数、絶対値）
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

  // 定員更新ハンドラ（理由付き）
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

    const categoryKeys = ['manager', 'staff', 'non_regular'];
    fetch('/api/quota-summary', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, fiscalYear: year, category: categoryKeys[catIdx], q1: value }),
    }).catch(e => console.error('quota save failed:', e));
  }, [orgId, quotaFiscalYears]);

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
