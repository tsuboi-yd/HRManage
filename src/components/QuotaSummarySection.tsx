'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import QuotaSummaryBar, { FiscalYearData } from './QuotaSummaryBar';
import BulkSubmitModal from './BulkSubmitModal';
import { usePlanDeltas } from '@/contexts/PlanDeltaContext';

const CATEGORY_MAP: Record<string, number> = { manager: 0, staff: 1, non_regular: 2 };
const CATEGORY_LABELS = ['管理職（課長以上）', '一般正社員', '非正規'];

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

// ── モジュールレベルキャッシュ（タブ切り替えでも保持） ──
let _cachedQuotas: Record<string, (number | null)[]> | null = null;
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
  const fetched = useRef(_cachedOrgId === orgId);

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

  // コンテキストの集約デルタから年度データを構築
  // 全年度で常に数値表示（データなし＝0）
  const quotaFiscalYears: FiscalYearData[] = useMemo(() => {
    return ['2026', '2027', '2028'].map(year => {
      const d = aggregated[year] ?? [0, 0, 0];
      return {
        year,
        categories: [
          { label: CATEGORY_LABELS[0], byname: d[0], quota: quotas[year]?.[0] ?? null },
          { label: CATEGORY_LABELS[1], byname: d[1], quota: quotas[year]?.[1] ?? null },
          { label: CATEGORY_LABELS[2], byname: d[2], quota: quotas[year]?.[2] ?? null },
        ],
      };
    });
  }, [aggregated, quotas]);

  const handleQuotaChange = useCallback((fyIdx: number, catIdx: number, value: number) => {
    const year = quotaFiscalYears[fyIdx]?.year;
    if (!year) return;

    setQuotas(prev => {
      const arr = [...(prev[year] ?? [null, null, null])];
      arr[catIdx] = value;
      const next = { ...prev, [year]: arr };
      _cachedQuotas = next;
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
  // 1. 定員サマリ: 3年分すべてのカテゴリに定員が入力されているか
  const quotasDone = useMemo(() => {
    return ['2026', '2027', '2028'].every(year =>
      quotas[year]?.every(v => v != null)
    );
  }, [quotas]);

  // 2. 異動計画: membersソースにデータがあるか
  const membersDone = useMemo(() => {
    const md = deltas.members;
    if (!md) return false;
    return Object.values(md).some(([m, s, n]) => m !== 0 || s !== 0 || n !== 0);
  }, [deltas]);

  // 3. 退職・採用計画: hiringソースにデータがあるか
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
    {
      label: '定員・計画サマリ',
      done: quotasDone,
      sub: quotasDone ? '3年分の定員数が入力されています' : '定員が未入力の年度があります',
      linkLabel: quotasDone ? '確認する' : '入力する',
      href: '/members',
    },
    {
      label: '異動計画',
      done: membersDone,
      sub: membersDone ? `${memberCount}件の異動計画が登録されています` : '異動計画が未登録です',
      linkLabel: membersDone ? '確認する' : '入力する',
      href: '/members',
    },
    {
      label: '退職・採用計画',
      done: hiringDone,
      sub: hiringDone ? '採用計画が登録されています' : '採用計画が未入力です',
      linkLabel: hiringDone ? '確認する' : '入力する',
      href: '/retirement-plans',
    },
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
          onSubmit={() => {
            setShowModal(false);
            alert('一括申請が完了しました');
          }}
        />
      )}
    </div>
  );
}
