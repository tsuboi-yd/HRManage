'use client';
import React, { useState } from 'react';

// ================================================================
// 型定義
// ================================================================
export interface QuotaCategory {
  label: string;
  quota: number;
  current: number;
  planDelta: number;
  color: string;
}

export interface FiscalYearData {
  year: string;
  categories: {
    label: string;
    quota: number | null;
    byname: number | null;
  }[];
}

export interface QuotaSummaryProps {
  deptName: string;
  currentMembers: { label: string; count: number; color: string }[];
  fiscalYears: FiscalYearData[];
  onQuotaChange?: (fyIdx: number, catIdx: number, value: number) => void;
  onBulkSubmit?: () => void;
}

// カテゴリカラー（棒グラフ用）
const CAT_COLORS = ['#1976D2', '#388E3C', '#F57C00'];

// ================================================================
// 棒グラフコンポーネント
// ================================================================
function QuotaBarChart({ fiscalYears, catLabels }: { fiscalYears: FiscalYearData[]; catLabels: string[] }) {
  const maxVal = 50;
  const chartH = 180;
  const gridLines = [0, 10, 20, 30, 40, 50];

  return (
    <div className="flex flex-col gap-4 px-5 py-5" style={{ borderLeft: '1px solid #E0E0E0' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[#212121]">定員推移</span>
        <div className="flex items-center gap-4">
          {catLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: CAT_COLORS[i] }} />
              <span className="text-[11px] text-[#757575]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: chartH + 24 }}>
        {/* Y-Axis labels */}
        <div className="absolute left-0 top-0 flex flex-col justify-between text-right" style={{ width: 28, height: chartH }}>
          {gridLines.slice().reverse().map((v) => (
            <span key={v} className="text-[11px] text-[#757575] leading-none">{v}</span>
          ))}
        </div>

        {/* Grid lines */}
        {gridLines.map((v, i) => (
          <div key={v} className="absolute" style={{
            left: 34, right: 0,
            top: chartH - (chartH * v / maxVal),
            height: 1,
            backgroundColor: i === 0 ? '#BDBDBD' : '#E0E0E0',
          }} />
        ))}

        {/* Bars */}
        {fiscalYears.map((fy, fi) => {
          const totalQuota = fy.categories.every(c => c.quota != null)
            ? fy.categories.reduce((s, c) => s + (c.quota ?? 0), 0)
            : null;
          const barX = 60 + fi * 130;

          return (
            <React.Fragment key={fy.year}>
              {/* Bar group */}
              <div className="absolute flex items-end gap-[3px]" style={{ left: barX, bottom: 24, height: chartH }}>
                {fy.categories.map((cat, ci) => {
                  const val = cat.quota ?? 0;
                  const h = Math.max(0, (val / maxVal) * chartH);
                  return (
                    <div
                      key={ci}
                      style={{
                        width: 24,
                        height: h,
                        backgroundColor: CAT_COLORS[ci],
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  );
                })}
              </div>
              {/* Total label */}
              {totalQuota != null && (
                <span className="absolute text-[13px] font-bold text-[#212121]" style={{
                  left: barX + 14,
                  top: chartH - (totalQuota / maxVal) * chartH - 18,
                }}>
                  {totalQuota}
                </span>
              )}
              {/* Year label */}
              <span className="absolute text-[12px] font-medium text-[#757575]" style={{
                left: barX + 10,
                top: chartH + 6,
              }}>
                {fy.year}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// 過不足セル
// ================================================================
function GapCell({ gap }: { gap: number | null }) {
  if (gap == null) return <td className="py-1 px-2 text-right text-[#BDBDBD]">—</td>;
  if (gap === 0) return <td className="py-1 px-2 text-right text-[15px] font-semibold text-[#388E3C]">±0</td>;
  const isShort = gap > 0;
  return (
    <td className="py-1 px-2 text-right">
      <span className="text-[13px] px-2 py-0.5 rounded-full font-semibold inline-block" style={{
        backgroundColor: isShort ? 'rgba(211,47,47,0.12)' : 'rgba(230,81,0,0.12)',
        color: isShort ? '#D32F2F' : '#E65100',
      }}>
        {isShort ? `${gap}名不足` : `${Math.abs(gap)}名超過`}
      </span>
    </td>
  );
}

// ================================================================
// メインコンポーネント
// ================================================================
export default function QuotaSummaryBar({ deptName, currentMembers, fiscalYears, onQuotaChange, onBulkSubmit }: QuotaSummaryProps) {
  const totalCurrent = currentMembers.reduce((s, c) => s + c.count, 0);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const catLabels = currentMembers.map(c => c.label);

  // 過不足列は1年目のみ表示
  function isFirstYear(_fy: FiscalYearData, fi: number) {
    return fi === 0;
  }

  function calcGap(fyIdx: number, catIdx: number) {
    const fy = fiscalYears[fyIdx];
    if (!fy) return null;
    const cat = fy.categories[catIdx];
    if (!cat || cat.quota == null) return null;
    const cur = currentMembers[catIdx]?.count ?? 0;
    const byname = cat.byname ?? 0;
    return cat.quota - (cur + byname);
  }

  function renderQuotaCell(fyIdx: number, catIdx: number, quota: number | null) {
    const cellId = `q-${fyIdx}-${catIdx}`;
    if (editingCell === cellId && onQuotaChange) {
      return (
        <td className="py-1 px-3 text-right" style={{ minWidth: 70 }}>
          <input
            type="number"
            autoFocus
            className="w-14 h-7 text-center text-sm border-2 border-[#1976D2] rounded outline-none bg-white"
            defaultValue={quota ?? ''}
            onBlur={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) onQuotaChange(fyIdx, catIdx, v);
              setEditingCell(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditingCell(null);
            }}
          />
        </td>
      );
    }
    return (
      <td
        className={`py-1 px-3 text-right text-[18px] font-bold text-[#212121] ${onQuotaChange ? 'cursor-pointer hover:bg-[#F0F0F0] transition-colors' : ''}`}
        style={{ minWidth: 70 }}
        onClick={onQuotaChange ? () => setEditingCell(cellId) : undefined}
        title={onQuotaChange ? 'クリックして定員を編集' : undefined}
      >
        {quota == null ? <span className="text-[#BDBDBD]">—</span> : quota}
        {onQuotaChange && <span className="material-symbols-rounded text-[#BDBDBD] ml-0.5 align-middle" style={{ fontSize: 10, lineHeight: 1 }}>edit</span>}
      </td>
    );
  }

  function renderBynameCell(cat: { byname: number | null }) {
    const val = cat.byname;
    const color = val == null ? '#BDBDBD'
      : val > 0 ? '#388E3C'
      : val < 0 ? '#D32F2F'
      : '#757575';
    return (
      <td className="py-1 px-3 text-right text-[18px] font-bold" style={{ color, minWidth: 60 }}>
        {val == null ? '—' : val > 0 ? `+${val}` : `${val}`}
      </td>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #CFD8DC',
        boxShadow: '0 2px 8px #00000014',
      }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid #E0E0E0' }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[#1976D2]" style={{ fontSize: 24, lineHeight: 1 }}>groups</span>
          <span className="text-[20px] font-bold text-[#212121]">定員・計画サマリ</span>
        </div>
        <div className="flex items-center gap-3">
          {onQuotaChange && (
            <div className="flex items-center gap-1 text-[#757575]">
              <span className="material-symbols-rounded" style={{ fontSize: 14, lineHeight: 1 }}>edit</span>
              <span className="text-[13px]">定員欄クリックで編集可</span>
            </div>
          )}
          {onBulkSubmit && (
            <button
              onClick={onBulkSubmit}
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-lg"
              style={{ backgroundColor: '#1976D2' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18, lineHeight: 1 }}>send</span>
              一括申請
            </button>
          )}
        </div>
      </div>

      {/* Content: Table + Chart */}
      <div className="flex">
        {/* Table */}
        <div className="overflow-x-auto" style={{ flex: '0 0 auto' }}>
          <table className="border-collapse">
            <thead>
              {/* Year header row */}
              <tr style={{ height: 48 }}>
                <th className="text-left py-2 px-5 text-[14px] font-semibold text-[#757575] whitespace-nowrap" style={{ backgroundColor: '#F5F5F5', minWidth: 160 }}>職分類</th>
                <th className="text-right py-2 px-5 text-[14px] font-semibold text-[#757575]" style={{ backgroundColor: '#F5F5F5', minWidth: 70 }}>現員</th>
                {fiscalYears.map((fy, fi) => {
                  const detail = isFirstYear(fy, fi);
                  return (
                    <th
                      key={fy.year}
                      colSpan={detail ? 3 : 2}
                      className="py-2 px-4 text-[13px] font-bold text-[#212121]"
                      style={{ backgroundColor: '#F5F5F5', borderLeft: '1px solid #E0E0E0' }}
                    >
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="text-[14px]">{fy.year}</span>
                        <div className="flex gap-4 text-[12px] font-semibold text-[#757575]">
                          <span>異動計画</span>
                          <span>定員</span>
                          {detail && <span>過不足</span>}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {catLabels.map((label, ci) => (
                <tr key={label} style={{ height: 56, borderBottom: '1px solid #E0E0E0' }}>
                  <td className="py-2 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: currentMembers[ci].color }} />
                      <span className="text-[15px] font-medium text-[#212121]">{label}</span>
                    </div>
                  </td>
                  <td className="py-2 px-5 text-right text-[18px] font-bold text-[#212121]">{currentMembers[ci].count}</td>
                  {fiscalYears.map((fy, fi) => {
                    const cat = fy.categories[ci];
                    const detail = isFirstYear(fy, fi);
                    const gap = detail ? calcGap(fi, ci) : null;
                    return (
                      <React.Fragment key={fy.year}>
                        {renderBynameCell(cat ?? { byname: null })}
                        {renderQuotaCell(fi, ci, cat?.quota ?? null)}
                        {detail && <GapCell gap={gap} />}
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ height: 56, backgroundColor: '#F5F5F5' }}>
                <td className="py-2 px-5 text-[15px] font-bold text-[#212121]">合計</td>
                <td className="py-2 px-5 text-right text-[18px] font-extrabold text-[#212121]">{totalCurrent}</td>
                {fiscalYears.map((fy, fi) => {
                  const totalByname = fy.categories.reduce((s, c) => s + (c.byname ?? 0), 0);
                  const totalQuota = fy.categories.every(c => c.quota != null)
                    ? fy.categories.reduce((s, c) => s + (c.quota ?? 0), 0)
                    : null;
                  const detail = isFirstYear(fy, fi);
                  const totalGap = detail && totalQuota != null ? totalQuota - (totalCurrent + totalByname) : null;
                  const bynameColor = totalByname > 0 ? '#388E3C'
                    : totalByname < 0 ? '#D32F2F'
                    : '#757575';
                  return (
                    <React.Fragment key={fy.year + '_total'}>
                      <td className="py-2 px-3 text-right text-[18px] font-bold" style={{ color: bynameColor, borderLeft: '1px solid #E0E0E0' }}>
                        {totalByname > 0 ? `+${totalByname}` : `${totalByname}`}
                      </td>
                      <td className="py-2 px-3 text-right text-[18px] font-extrabold text-[#212121]">
                        {totalQuota == null ? <span className="text-[#BDBDBD]">—</span> : totalQuota}
                      </td>
                      {detail && <GapCell gap={totalGap} />}
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 min-w-[340px]">
          <QuotaBarChart fiscalYears={fiscalYears} catLabels={catLabels} />
        </div>
      </div>
    </div>
  );
}
