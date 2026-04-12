'use client';
import React, { useState } from 'react';

// ================================================================
// 型定義
// ================================================================
export interface FiscalYearData {
  year: string;
  categories: {
    label: string;
    quota: number | null;
    quotaReason: string;    // 定員変動理由
    byname: number;         // 充員（採用計画合計）
    bynameConfirmed: number; // バイネーム確定数
  }[];
}

export interface QuotaSummaryProps {
  deptName: string;
  currentMembers: { label: string; count: number; color: string }[];
  fiscalYears: FiscalYearData[];
  onQuotaChange?: (fyIdx: number, catIdx: number, value: number, reason: string) => void;
  onBulkSubmit?: () => void;
}

// ================================================================
// 過不足セル
// ================================================================
function GapCell({ gap }: { gap: number | null }) {
  if (gap == null) return <td className="py-1 px-3 text-center text-[#BDBDBD] text-sm">—</td>;
  if (gap === 0) return <td className="py-1 px-3 text-center text-sm font-semibold text-[#388E3C]">±0</td>;
  return (
    <td className="py-1 px-3 text-center">
      <span className="text-[12px] px-2 py-0.5 rounded-full font-semibold inline-block" style={{
        backgroundColor: gap > 0 ? 'rgba(211,47,47,0.10)' : 'rgba(56,142,60,0.10)',
        color: gap > 0 ? '#D32F2F' : '#388E3C',
      }}>
        {gap > 0 ? `+${gap}` : `${gap}`}
      </span>
    </td>
  );
}

// ================================================================
// 定員編集モーダル（理由付き）
// ================================================================
function QuotaEditPopover({
  value,
  reason,
  onSave,
  onCancel,
}: {
  value: number | null;
  reason: string;
  onSave: (value: number, reason: string) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState(String(value ?? ''));
  const [r, setR] = useState(reason);

  return (
    <div className="absolute z-50 top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-[#E0E0E0] p-3 w-64"
      onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-[#757575]">定員数</label>
        <input
          type="number"
          autoFocus
          className="w-full h-8 text-sm border border-[#BDBDBD] rounded px-2 outline-none focus:border-[#1976D2]"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const n = parseInt(v, 10);
              if (!isNaN(n)) onSave(n, r);
            }
            if (e.key === 'Escape') onCancel();
          }}
        />
        <label className="text-[11px] font-medium text-[#757575]">変更理由</label>
        <input
          type="text"
          className="w-full h-8 text-sm border border-[#BDBDBD] rounded px-2 outline-none focus:border-[#1976D2]"
          placeholder="例: 生産設備拡大"
          value={r}
          onChange={(e) => setR(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const n = parseInt(v, 10);
              if (!isNaN(n)) onSave(n, r);
            }
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={onCancel} className="text-xs text-[#757575] px-3 h-7 rounded border border-[#E0E0E0]">取消</button>
          <button
            onClick={() => { const n = parseInt(v, 10); if (!isNaN(n)) onSave(n, r); }}
            className="text-xs font-medium text-white px-3 h-7 rounded bg-[#1976D2]"
          >保存</button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// メインコンポーネント
// ================================================================
export default function QuotaSummaryBar({ deptName, currentMembers, fiscalYears, onQuotaChange, onBulkSubmit }: QuotaSummaryProps) {
  const totalCurrent = currentMembers.reduce((s, c) => s + c.count, 0);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  // 年度ごとのバイネーム未確定数（最初の年度で計算）
  const fy0 = fiscalYears[0];
  const totalConfirmed = fy0 ? fy0.categories.reduce((s, c) => s + c.bynameConfirmed, 0) : 0;
  const totalQuota0 = fy0?.categories.every(c => c.quota != null) ? fy0.categories.reduce((s, c) => s + (c.quota ?? 0), 0) : null;
  const totalByname0 = fy0 ? fy0.categories.reduce((s, c) => s + c.byname, 0) : 0;
  const unconfirmed = totalQuota0 != null ? Math.max(0, totalQuota0 - totalCurrent - totalConfirmed) : 0;

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
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #E0E0E0' }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[#1976D2]" style={{ fontSize: 22, lineHeight: 1 }}>groups</span>
          <span className="text-[18px] font-bold text-[#212121]">定員・計画サマリ</span>
        </div>
        <div className="flex items-center gap-3">
          {onQuotaChange && (
            <div className="flex items-center gap-1 text-[#757575]">
              <span className="material-symbols-rounded" style={{ fontSize: 14, lineHeight: 1 }}>edit</span>
              <span className="text-[12px]">定員欄クリックで編集可</span>
            </div>
          )}
          {onBulkSubmit && (
            <button
              onClick={onBulkSubmit}
              className="flex items-center gap-2 text-[13px] font-semibold text-white px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#1976D2' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16, lineHeight: 1 }}>send</span>
              一括申請
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ height: 40 }}>
              <th className="text-left py-1 px-4 font-semibold text-[#757575] whitespace-nowrap" style={{ backgroundColor: '#F5F5F5', minWidth: 120 }}>区分</th>
              <th className="text-right py-1 px-3 font-semibold text-[#757575]" style={{ backgroundColor: '#F5F5F5', width: 60 }}>現員</th>
              {fiscalYears.map((fy) => (
                <th
                  key={fy.year}
                  colSpan={3}
                  className="py-1 px-2 font-bold text-[#212121] text-center"
                  style={{ backgroundColor: '#F5F5F5', borderLeft: '1px solid #E0E0E0' }}
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[13px] font-bold">{fy.year}</span>
                    <div className="flex gap-0">
                      <span className="text-[11px] font-semibold text-[#757575] w-[60px] text-center">定員</span>
                      <span className="text-[11px] font-semibold text-[#757575] w-[50px] text-center">充員</span>
                      <span className="text-[11px] font-semibold text-[#757575] w-[60px] text-center">過不足</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentMembers.map((cm, ci) => (
              <tr key={cm.label} style={{ height: 48, borderBottom: '1px solid #E0E0E0' }}>
                <td className="py-1 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cm.color }} />
                    <span className="text-[13px] font-medium text-[#212121]">{cm.label}</span>
                  </div>
                </td>
                <td className="py-1 px-3 text-right text-[16px] font-bold text-[#212121]">{cm.count}</td>
                {fiscalYears.map((fy, fi) => {
                  const cat = fy.categories[ci];
                  const quota = cat?.quota ?? null;
                  const filling = cat?.byname ?? 0;
                  const gap = quota != null ? quota - cm.count - filling : null;
                  const cellId = `q-${fi}-${ci}`;
                  const isEditing = editingCell === cellId;
                  const reason = cat?.quotaReason ?? '';

                  return (
                    <React.Fragment key={fy.year}>
                      {/* 定員 */}
                      <td
                        className={`py-1 px-2 text-center text-[16px] font-bold text-[#212121] relative ${onQuotaChange ? 'cursor-pointer hover:bg-[#E3F2FD] transition-colors' : ''}`}
                        style={{ borderLeft: '1px solid #E0E0E0', width: 60 }}
                        onClick={onQuotaChange ? () => setEditingCell(isEditing ? null : cellId) : undefined}
                        title={reason ? `変更理由: ${reason}` : (onQuotaChange ? 'クリックして編集' : undefined)}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          {quota == null ? <span className="text-[#BDBDBD]">—</span> : quota}
                          {onQuotaChange && <span className="material-symbols-rounded text-[#BDBDBD]" style={{ fontSize: 10, lineHeight: 1 }}>edit</span>}
                          {reason && <span className="material-symbols-rounded text-[#F57C00]" style={{ fontSize: 10, lineHeight: 1 }}>info</span>}
                        </div>
                        {isEditing && onQuotaChange && (
                          <QuotaEditPopover
                            value={quota}
                            reason={reason}
                            onSave={(v, r) => { onQuotaChange(fi, ci, v, r); setEditingCell(null); }}
                            onCancel={() => setEditingCell(null)}
                          />
                        )}
                      </td>
                      {/* 充員 */}
                      <td className="py-1 px-2 text-center text-[14px] font-semibold" style={{ width: 50, color: filling > 0 ? '#1976D2' : '#757575' }}>
                        {filling > 0 ? `+${filling}` : filling}
                      </td>
                      {/* 過不足 */}
                      <GapCell gap={gap} />
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            {/* 合計行 */}
            <tr style={{ height: 48, backgroundColor: '#F5F5F5' }}>
              <td className="py-1 px-4 text-[13px] font-bold text-[#212121]">合計</td>
              <td className="py-1 px-3 text-right text-[16px] font-extrabold text-[#212121]">{totalCurrent}</td>
              {fiscalYears.map((fy) => {
                const totalQuota = fy.categories.every(c => c.quota != null) ? fy.categories.reduce((s, c) => s + (c.quota ?? 0), 0) : null;
                const totalFilling = fy.categories.reduce((s, c) => s + c.byname, 0);
                const totalGap = totalQuota != null ? totalQuota - totalCurrent - totalFilling : null;
                return (
                  <React.Fragment key={fy.year + '_t'}>
                    <td className="py-1 px-2 text-center text-[16px] font-extrabold text-[#212121]" style={{ borderLeft: '1px solid #E0E0E0' }}>
                      {totalQuota ?? '—'}
                    </td>
                    <td className="py-1 px-2 text-center text-[14px] font-bold" style={{ color: totalFilling > 0 ? '#1976D2' : '#757575' }}>
                      {totalFilling > 0 ? `+${totalFilling}` : totalFilling}
                    </td>
                    <GapCell gap={totalGap} />
                  </React.Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* バイネーム行 */}
      {fy0 && (
        <div className="flex items-center gap-3 px-5 py-2.5" style={{ borderTop: '1px solid #E0E0E0', backgroundColor: '#FAFAFA' }}>
          <span className="material-symbols-rounded text-[#757575]" style={{ fontSize: 16, lineHeight: 1 }}>person_search</span>
          <span className="text-[12px] text-[#212121]">
            <span className="font-medium">{fy0.year}年度</span>
            {' '}バイネーム:
            {' '}<span className="font-bold text-[#388E3C]">確定 {totalConfirmed}名</span>
            {unconfirmed > 0 && (
              <> / <span className="font-bold text-[#D32F2F]">未確定 {unconfirmed}名</span></>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
