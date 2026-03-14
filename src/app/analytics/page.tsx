'use client';
import AppBar from '@/components/AppBar';
import { useState } from 'react';

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

// ================================================================
// 型定義
// ================================================================
interface Snapshot {
  id: string;
  label: string;
  date: string;
  comment: string;
}
interface DiffRow {
  id: string;
  level: 'honbu' | 'center' | 'dept';
  parentId?: string;
  name: string;
  icon: string;
  actual: number;
  transferOut: number;
  transferIn: number;
  retirement: number;
  hiring: number;
  planned: number;
  diff: number;
}
type DiffKind = '計画のみ' | '実績のみ' | '一致';
type NameKind = '転出' | '転入' | '退職' | '採用';
type ViewLevel = 'honbu' | 'center' | 'dept';
type NameFilter = 'all' | NameKind;
interface FuturePoint {
  id: string;
  orgId: string;
  monthIdx: number;
  count: number;
  comment: string;
}
interface NameDiffRow {
  id: string;
  orgId: string;
  empNo: string;
  name: string;
  dept: string;
  type: NameKind;
  dest: string;
  date: string;
  diffKind: DiffKind;
}

// ================================================================
// グラフ定数
// ================================================================
const TOTAL_MONTHS    = 30;   // Oct 2025 → Mar 2028
const ACTUAL_END_IDX  = 5;    // Mar 2026 = 最新実績終点
const FUTURE_START    = ACTUAL_END_IDX + 1; // 6
const SVG_W = 1000, SVG_H = 280;
const PL = 52, PR = 24, PT = 28, PB = 36; // padding
const CW = SVG_W - PL - PR;               // chart width in viewBox units

// スライダー左端がグラフの index=FUTURE_START の X 座標に合うよう計算
const SLIDER_LEFT_PCT  = `${((PL + (FUTURE_START / (TOTAL_MONTHS - 1)) * CW) / SVG_W * 100).toFixed(2)}%`;
const SLIDER_RIGHT_PCT = `${(PR / SVG_W * 100).toFixed(2)}%`;

// 全月ラベル（30件）
const ALL_MONTH_LABELS: string[] = [
  '2025年10月', '2025年11月', '2025年12月',
  '2026年1月',  '2026年2月',  '2026年3月',
  '2026年4月',  '2026年5月',  '2026年6月',  '2026年7月',  '2026年8月',  '2026年9月',
  '2026年10月', '2026年11月', '2026年12月',
  '2027年1月',  '2027年2月',  '2027年3月',
  '2027年4月',  '2027年5月',  '2027年6月',  '2027年7月',  '2027年8月',  '2027年9月',
  '2027年10月', '2027年11月', '2027年12月',
  '2028年1月',  '2028年2月',  '2028年3月',
];

// X軸に表示するラベル（間引き）
const AXIS_TICKS: { idx: number; label: string }[] = [
  { idx: 0,  label: '25/10' },
  { idx: 6,  label: '26/4'  },
  { idx: 12, label: '26/10' },
  { idx: 18, label: '27/4'  },
  { idx: 24, label: '27/10' },
  { idx: 29, label: '28/3'  },
];

// ================================================================
// 組織ごとの計画・実績データ（30ヶ月）
// ================================================================
const EXTENDED_CHART_DATA: Record<string, { plan: number[]; actual: number[] }> = {
  h1: {
    plan:   [390,382,375,368,360,354,348,342,336,331,326,321,316,311,306,301,296,291,287,283,279,275,271,267,263,260,257,254,251,248],
    actual: [388,378,370,363,355,348],
  },
  c1: {
    plan:   [102,100,99,98,97,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73],
    actual: [101,99,98,97,96,98],
  },
  c2: {
    plan:   [60,59,59,58,57,57,56,56,55,55,54,54,53,53,52,51,51,50,50,49,49,48,48,47,47,46,46,45,45,44],
    actual: [60,59,58,57,57,57],
  },
  d1: {
    plan:   [54,53,52,52,52,52,51,51,50,50,49,49,48,48,47,47,46,46,45,44,44,43,43,42,42,41,41,40,40,39],
    actual: [54,52,52,51,51,52],
  },
  d2: {
    plan:   [30,29,29,28,28,27,27,26,26,25,25,24,24,23,23,22,22,21,21,21,20,20,19,19,19,18,18,17,17,17],
    actual: [30,29,28,28,27,27],
  },
  d3: {
    plan:   [37,36,36,35,35,34,34,33,33,32,32,31,31,30,30,29,29,28,28,27,27,27,26,26,25,25,25,24,24,23],
    actual: [37,36,35,35,34,34],
  },
  d4: {
    plan:   [24,24,23,23,23,23,22,22,22,21,21,20,20,20,19,19,19,18,18,18,17,17,17,16,16,16,15,15,15,14],
    actual: [24,23,23,23,23,23],
  },
};

// ================================================================
// モックデータ
// ================================================================
const INIT_SNAPSHOTS: Snapshot[] = [
  { id: 's1', label: '2026年3月1日時点',  date: '2026-03-01', comment: '3月初旬スナップショット' },
  { id: 's2', label: '2026年2月1日時点',  date: '2026-02-01', comment: '2月初旬スナップショット' },
  { id: 's3', label: '2026年1月6日時点',  date: '2026-01-06', comment: '年始スナップショット' },
];

const DIFF_ROWS: DiffRow[] = [
  { id: 'h1', level: 'honbu',                name: '開発本部（全体）', icon: 'business',       actual: 156, transferOut: -8, transferIn: 5, retirement: -3, hiring: 4, planned: 154, diff: -2 },
  { id: 'c1', level: 'center', parentId: 'h1', name: '開発センター',  icon: 'corporate_fare', actual: 98,  transferOut: -5, transferIn: 3, retirement: -2, hiring: 3, planned: 97,  diff: -1 },
  { id: 'c2', level: 'center', parentId: 'h1', name: '品質センター',  icon: 'corporate_fare', actual: 58,  transferOut: -3, transferIn: 2, retirement: -1, hiring: 1, planned: 57,  diff: -1 },
  { id: 'd1', level: 'dept',   parentId: 'c1', name: '第一開発部',    icon: 'group',          actual: 52,  transferOut: -3, transferIn: 2, retirement: -1, hiring: 2, planned: 52,  diff:  0 },
  { id: 'd2', level: 'dept',   parentId: 'c1', name: '第二開発部',    icon: 'group',          actual: 28,  transferOut: -2, transferIn: 1, retirement: -1, hiring: 1, planned: 27,  diff: -1 },
  { id: 'd3', level: 'dept',   parentId: 'c2', name: '品質管理部',    icon: 'group',          actual: 35,  transferOut: -2, transferIn: 1, retirement: -1, hiring: 1, planned: 34,  diff: -1 },
  { id: 'd4', level: 'dept',   parentId: 'c2', name: '品質保証部',    icon: 'group',          actual: 23,  transferOut: -1, transferIn: 1, retirement:  0, hiring: 0, planned: 23,  diff:  0 },
];

const ALL_NAME_DIFFS: NameDiffRow[] = [
  { id: 'n1', orgId: 'd1', empNo: 'EMP-001', name: '佐藤 一郎',   dept: '第一開発部', type: '転出', dest: '→ 第二開発部',   date: '2026/07', diffKind: '計画のみ' },
  { id: 'n2', orgId: 'd1', empNo: 'EMP-003', name: '高橋 健太',   dept: '第一開発部', type: '退職', dest: '自己都合',        date: '2026/09', diffKind: '計画のみ' },
  { id: 'n3', orgId: 'd1', empNo: 'NEW-001', name: '（新規採用）', dept: '第一開発部', type: '採用', dest: '新卒配属予定',    date: '2026/04', diffKind: '計画のみ' },
  { id: 'n4', orgId: 'd2', empNo: 'EMP-007', name: '田中 美咲',   dept: '第二開発部', type: '転入', dest: '← 品質管理部',    date: '2026/06', diffKind: '一致' },
  { id: 'n5', orgId: 'd1', empNo: 'EMP-012', name: '鈴木 誠',     dept: '第一開発部', type: '転出', dest: '→ インフラ部',    date: '2026/05', diffKind: '実績のみ' },
  { id: 'n6', orgId: 'd2', empNo: 'EMP-019', name: '中村 裕子',   dept: '第二開発部', type: '退職', dest: '定年退職',        date: '2026/07', diffKind: '一致' },
  { id: 'n7', orgId: 'd3', empNo: 'EMP-021', name: '山本 哲也',   dept: '品質管理部', type: '転出', dest: '→ 開発センター',  date: '2026/06', diffKind: '計画のみ' },
  { id: 'n8', orgId: 'd4', empNo: 'EMP-024', name: '伊藤 千代',   dept: '品質保証部', type: '退職', dest: '定年退職',        date: '2026/08', diffKind: '一致' },
  { id: 'n9', orgId: 'd3', empNo: 'NEW-002', name: '（新規採用）', dept: '品質管理部', type: '採用', dest: '中途配属予定',    date: '2026/07', diffKind: '計画のみ' },
];

const FIRST_ORG_BY_LEVEL: Record<ViewLevel, string> = { honbu: 'h1', center: 'c1', dept: 'd1' };

// ================================================================
// SVG 折れ線グラフ
// ================================================================
function LineChart({ planData, actualData, selectedIdx, futurePoints, baselinePoint }: {
  planData: number[];
  actualData: number[];
  selectedIdx: number;
  futurePoints: { monthIdx: number; count: number }[];
  baselinePoint: { monthIdx: number; count: number };
}) {
  const n = TOTAL_MONTHS;
  const CH = SVG_H - PT - PB;

  // Y スケール自動算出
  const allVals   = [...planData, ...actualData, ...futurePoints.map(p => p.count)];
  const dataMin   = Math.min(...allVals);
  const dataMax   = Math.max(...allVals);
  const dataRange = Math.max(dataMax - dataMin, 4);
  const pad       = Math.ceil(dataRange * 0.25);
  const step      = dataRange <= 10 ? 1 : dataRange <= 40 ? 5 : dataRange <= 150 ? 10 : 30;
  const yMin      = Math.floor((dataMin - pad) / step) * step;
  const yMax      = Math.ceil((dataMax  + pad) / step) * step;
  const gridStep  = Math.ceil((yMax - yMin) / 5 / step) * step;
  const gridVals: number[] = [];
  for (let v = yMin; v <= yMax + 0.001; v += gridStep) gridVals.push(Math.round(v));

  const xS = (i: number) => PL + (i / (n - 1)) * CW;
  const yS = (v: number) => PT + ((yMax - v) / (yMax - yMin)) * CH;

  // Plan: solid up to actual end, dashed beyond
  const solidPlan  = planData.slice(0, ACTUAL_END_IDX + 1)
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yS(v)}`).join(' ');
  const dashedPlan = planData.slice(ACTUAL_END_IDX)
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i + ACTUAL_END_IDX)},${yS(v)}`).join(' ');
  const actualPath = actualData
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yS(v)}`).join(' ');

  const selX      = xS(selectedIdx);
  const selPlanY  = yS(planData[selectedIdx]);
  const actEndX   = xS(ACTUAL_END_IDX);
  const actEndY   = yS(actualData[ACTUAL_END_IDX]);

  // 将来登録ポイント（sorted）
  const sortedFP  = [...futurePoints].sort((a, b) => a.monthIdx - b.monthIdx);

  // 実績終点 → 将来登録ポイントを繋ぐ破線パス
  const extPathPts = [{ x: actEndX, y: actEndY }, ...sortedFP.map(p => ({ x: xS(p.monthIdx), y: yS(p.count) }))];
  const extPath    = extPathPts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ');

  // 差分ラインの起点（比較基準）
  const baseX      = xS(baselinePoint.monthIdx);
  const baseY      = yS(baselinePoint.count);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', minHeight: 180 }}>
      {/* 未来エリア薄背景 */}
      <rect x={actEndX} y={PT} width={xS(n - 1) - actEndX} height={CH}
        fill="rgba(0,0,0,0.025)" />

      {/* グリッド線 & Y軸ラベル */}
      {gridVals.map(v => (
        <g key={v}>
          <line x1={PL} y1={yS(v)} x2={SVG_W - PR} y2={yS(v)} stroke="#EEEEEE" strokeWidth={1} />
          <text x={PL - 6} y={yS(v) + 4} textAnchor="end" fontSize={11} fill="#9E9E9E">{v}</text>
        </g>
      ))}

      {/* 実績終点区切り線 */}
      <line x1={actEndX} y1={PT} x2={actEndX} y2={SVG_H - PB}
        stroke="#BDBDBD" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={actEndX - 5} y={PT + 10} textAnchor="end" fontSize={10} fill="#9E9E9E">最新実績</text>

      {/* 将来登録ポイント延長線（実績終点→登録済み将来ポイント） */}
      {sortedFP.length > 0 && (
        <path d={extPath} fill="none" stroke="#00897B" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
      )}

      {/* 差分ガイド: 比較基準の水平点線 → 選択月 */}
      <line x1={baseX} y1={baseY} x2={selX} y2={baseY}
        stroke="#BDBDBD" strokeWidth={1} strokeDasharray="3,3" />
      {/* 差分垂直線（比較基準値 → 選択時点計画値） */}
      <line x1={selX} y1={baseY} x2={selX} y2={selPlanY}
        stroke="#FF9800" strokeWidth={2.5} />

      {/* 選択月の縦ガイド */}
      <line x1={selX} y1={PT} x2={selX} y2={SVG_H - PB}
        stroke="#FF9800" strokeWidth={1} strokeDasharray="5,4" opacity={0.5} />

      {/* 実人員ライン */}
      <path d={actualPath} fill="none" stroke="#388E3C" strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* 計画ライン：実線部分 */}
      <path d={solidPlan} fill="none" stroke="#1976D2" strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* 計画ライン：破線部分（予測） */}
      <path d={dashedPlan} fill="none" stroke="#1976D2" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7,4" />

      {/* 実人員ドット */}
      {actualData.map((v, i) => (
        <circle key={`a${i}`} cx={xS(i)} cy={yS(v)} r={4} fill="#388E3C" />
      ))}
      {/* 計画ドット（実線部分のみ） */}
      {planData.slice(0, ACTUAL_END_IDX + 1).map((v, i) => (
        <circle key={`ps${i}`} cx={xS(i)} cy={yS(v)} r={4} fill="#1976D2" />
      ))}

      {/* 実績終点ドット（少し大きめ） */}
      <circle cx={actEndX} cy={actEndY} r={6} fill="#388E3C" stroke="white" strokeWidth={2} />

      {/* 将来登録ポイント（ダイヤモンドマーカー） */}
      {sortedFP.map((p, i) => {
        const px = xS(p.monthIdx), py = yS(p.count), r = 7;
        return (
          <g key={`fp${i}`}>
            <polygon points={`${px},${py - r} ${px + r},${py} ${px},${py + r} ${px - r},${py}`}
              fill="#00897B" stroke="white" strokeWidth={2} />
          </g>
        );
      })}

      {/* 選択時点ドット（オレンジ・二重丸） */}
      <circle cx={selX} cy={selPlanY} r={9} fill="#FF9800" opacity={0.25} />
      <circle cx={selX} cy={selPlanY} r={6} fill="#FF9800" />
      <circle cx={selX} cy={selPlanY} r={3} fill="white" />

      {/* X軸ラベル */}
      {AXIS_TICKS.map(({ idx, label }) => (
        <text key={idx} x={xS(idx)} y={SVG_H - 4} textAnchor="middle" fontSize={11} fill="#9E9E9E">
          {label}
        </text>
      ))}
    </svg>
  );
}

// ================================================================
// スナップショット登録モーダル
// ================================================================
function SnapshotModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (s: Omit<Snapshot, 'id'>) => void;
}) {
  const today = new Date();
  const [form, setForm] = useState({
    label: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日時点`,
    date: today.toISOString().slice(0, 10),
    comment: '',
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 h-14 border-b border-outline">
          <span className="text-base font-medium text-on-surface flex items-center gap-2">
            <Icon name="photo_camera" size={18} className="text-primary" />
            スナップショット登録
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-[#E3F2FD] border border-[#90CAF9]">
            <Icon name="info" size={16} className="text-[#1565C0] shrink-0 mt-0.5" />
            <span className="text-xs text-[#1565C0]">
              現在の人員計画データを取り込んでスナップショットを作成します。後から実績との差分確認に使用できます。
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">スナップショット名</label>
            <input className="snap-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">基準日</label>
            <input type="date" className="snap-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">コメント（任意）</label>
            <textarea className="snap-input resize-none" rows={2} placeholder="スナップショットのメモ"
              value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-outline">
          <button onClick={onClose} className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">キャンセル</button>
          <button onClick={() => onSave(form)} className="text-sm font-medium text-on-primary px-4 h-9 rounded-full flex items-center gap-1.5" style={{ backgroundColor: '#1976D2' }}>
            <Icon name="photo_camera" size={16} className="text-on-primary" />登録する
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 将来人数登録モーダル
// ================================================================
function FuturePointModal({ orgName, onClose, onSave }: {
  orgName: string;
  onClose: () => void;
  onSave: (monthIdx: number, count: number, comment: string) => void;
}) {
  const [monthIdx, setMonthIdx] = useState<number>(FUTURE_START);
  const [count, setCount]       = useState('');
  const [comment, setComment]   = useState('');
  const canSave = count !== '' && Number(count) > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 h-14 border-b border-outline">
          <span className="text-base font-medium text-on-surface flex items-center gap-2">
            <Icon name="edit_calendar" size={18} className="text-[#00897B]" />
            将来人数登録
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-[#E0F2F1] border border-[#80CBC4]">
            <Icon name="info" size={16} className="text-[#00695C] shrink-0 mt-0.5" />
            <span className="text-xs text-[#00695C]">
              将来の特定時点における人数の見込みを登録します。グラフの予測基準として反映されます。
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">対象組織</label>
            <div className="snap-input text-on-surface-variant bg-surface-variant">{orgName}</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">時点</label>
            <select className="snap-input" value={monthIdx} onChange={e => setMonthIdx(Number(e.target.value))}>
              {ALL_MONTH_LABELS.slice(FUTURE_START).map((label, i) => (
                <option key={i} value={FUTURE_START + i}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">人数（名）</label>
            <input
              type="number" min={1} className="snap-input" placeholder="例: 95"
              value={count} onChange={e => setCount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">コメント（任意）</label>
            <textarea className="snap-input resize-none" rows={2} placeholder="根拠・備考など"
              value={comment} onChange={e => setComment(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-outline">
          <button onClick={onClose} className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">キャンセル</button>
          <button
            onClick={() => canSave && onSave(monthIdx, Number(count), comment)}
            disabled={!canSave}
            className="text-sm font-medium px-4 h-9 rounded-full flex items-center gap-1.5 transition-opacity"
            style={{ backgroundColor: '#00897B', color: '#fff', opacity: canSave ? 1 : 0.4 }}>
            <Icon name="add_circle" size={16} />登録する
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 差分バッジ
// ================================================================
function DiffBadge({ diff }: { diff: number }) {
  if (diff === 0) return <span className="text-sm text-on-surface-variant font-medium">±0</span>;
  const isNeg = diff < 0;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: isNeg ? '#FFEBEE' : '#E8F5E9', color: isNeg ? '#D32F2F' : '#388E3C' }}>
      {diff > 0 ? '+' : ''}{diff}
    </span>
  );
}

const KIND_STYLE: Record<NameKind, { bg: string; color: string }> = {
  '転出': { bg: '#FFF3E0', color: '#E65100' },
  '転入': { bg: '#E3F2FD', color: '#1565C0' },
  '退職': { bg: '#FFEBEE', color: '#D32F2F' },
  '採用': { bg: '#E8F5E9', color: '#388E3C' },
};
const DIFF_KIND_STYLE: Record<DiffKind, { bg: string; color: string }> = {
  '計画のみ': { bg: '#FFEBEE', color: '#D32F2F' },
  '実績のみ': { bg: '#FFF3E0', color: '#E65100' },
  '一致':     { bg: '#E8F5E9', color: '#388E3C' },
};

// ================================================================
// メインページ
// ================================================================
export default function AnalyticsPage() {
  const [snapshots, setSnapshots]         = useState<Snapshot[]>(INIT_SNAPSHOTS);
  const [selectedSnap, setSelectedSnap]   = useState(INIT_SNAPSHOTS[0].id);
  const [viewLevel, setViewLevel]         = useState<ViewLevel>('center');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(FIRST_ORG_BY_LEVEL['center']);
  const [showModal, setShowModal]         = useState(false);
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [snapDropOpen, setSnapDropOpen]   = useState(false);
  const [nameFilter, setNameFilter]       = useState<NameFilter>('all');
  const [selectedFutureIdx, setSelectedFutureIdx] = useState(17); // default: Mar 2027
  const [futurePoints, setFuturePoints]   = useState<FuturePoint[]>([]);

  const currentSnap  = snapshots.find(s => s.id === selectedSnap) ?? snapshots[0];
  const selectedRow  = DIFF_ROWS.find(r => r.id === selectedOrgId);
  const chartData    = EXTENDED_CHART_DATA[selectedOrgId] ?? EXTENDED_CHART_DATA['h1'];

  // 現在の組織の将来登録ポイント
  const chartFuturePoints = futurePoints
    .filter(p => p.orgId === selectedOrgId)
    .map(p => ({ monthIdx: p.monthIdx, count: p.count }));

  // 差分の比較基準：selectedFutureIdx 以前の最新登録ポイント、なければ最新実績
  const latestApplicable = futurePoints
    .filter(p => p.orgId === selectedOrgId && p.monthIdx <= selectedFutureIdx)
    .sort((a, b) => b.monthIdx - a.monthIdx)[0];
  const baselinePoint = latestApplicable
    ? { monthIdx: latestApplicable.monthIdx, count: latestApplicable.count }
    : { monthIdx: ACTUAL_END_IDX, count: chartData.actual[ACTUAL_END_IDX] };

  // 差分カード用の値
  const planAtSelected = chartData.plan[selectedFutureIdx];
  const actualLast     = chartData.actual[ACTUAL_END_IDX];
  const futureDiff     = planAtSelected - baselinePoint.count;

  const saveFuturePoint = (monthIdx: number, count: number, comment: string) => {
    const newPoint: FuturePoint = {
      id: String(Date.now()),
      orgId: selectedOrgId,
      monthIdx,
      count,
      comment,
    };
    // 同一組織・同一月があれば上書き
    setFuturePoints(prev => [
      ...prev.filter(p => !(p.orgId === selectedOrgId && p.monthIdx === monthIdx)),
      newPoint,
    ]);
    setShowFutureModal(false);
  };

  const handleViewLevel = (level: ViewLevel) => {
    setViewLevel(level);
    setSelectedOrgId(FIRST_ORG_BY_LEVEL[level]);
    setNameFilter('all');
  };

  const saveSnapshot = (s: Omit<Snapshot, 'id'>) => {
    const newSnap = { ...s, id: String(Date.now()) };
    setSnapshots(prev => [newSnap, ...prev]);
    setSelectedSnap(newSnap.id);
    setShowModal(false);
  };

  const visibleRows = DIFF_ROWS.filter(row => {
    if (viewLevel === 'honbu')  return row.level === 'honbu';
    if (viewLevel === 'center') return row.level === 'honbu' || row.level === 'center';
    return true;
  });

  const getVisibleNameDiffs = (): NameDiffRow[] => {
    if (!selectedRow || selectedRow.level === 'honbu') return ALL_NAME_DIFFS;
    if (selectedRow.level === 'center') {
      const childIds = DIFF_ROWS.filter(r => r.parentId === selectedOrgId).map(r => r.id);
      return ALL_NAME_DIFFS.filter(n => childIds.includes(n.orgId));
    }
    return ALL_NAME_DIFFS.filter(n => n.orgId === selectedOrgId);
  };

  // 一致行は除外し差分のみ表示
  const filteredNames = getVisibleNameDiffs()
    .filter(r => r.diffKind !== '一致')
    .filter(r => nameFilter === 'all' || r.type === nameFilter);

  const chartTitle   = selectedRow ? `人員推移グラフ（${selectedRow.name}）` : '人員推移グラフ';
  const nameDiffTitle = selectedRow ? `バイネーム差分（${selectedRow.name}）` : 'バイネーム差分';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="admin_panel_settings" roleLabel="人事部：加藤恵子" />

      <main className="flex flex-col gap-6 p-6 max-w-[1400px] w-full mx-auto">

        {/* ── ページヘッダー ── */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-medium text-on-surface">分析</h1>
            <p className="text-sm text-on-surface-variant">人員推移・スナップショット差分の分析ダッシュボード</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm font-medium text-on-primary px-5 h-10 rounded-full shrink-0"
            style={{ backgroundColor: '#1976D2' }}>
            <Icon name="photo_camera" size={18} className="text-on-primary" />
            スナップショット登録
          </button>
        </div>

        {/* ── スナップショット選択 + 表示レベル ── */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-on-surface">スナップショット:</span>
          <div className="relative">
            <button onClick={() => setSnapDropOpen(v => !v)}
              className="flex items-center justify-between gap-2 h-10 px-3 rounded border text-sm text-on-surface bg-surface"
              style={{ minWidth: 240, borderColor: '#BDBDBD' }}>
              {currentSnap?.label ?? '—'}
              <Icon name="arrow_drop_down" size={24} className="text-on-surface-variant" />
            </button>
            {snapDropOpen && (
              <div className="absolute top-11 left-0 z-20 bg-surface border border-outline rounded-lg shadow-lg py-1 min-w-[260px]">
                {snapshots.map(s => (
                  <button key={s.id} onClick={() => { setSelectedSnap(s.id); setSnapDropOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-surface-variant"
                    style={{ color: s.id === selectedSnap ? '#1976D2' : '#212121', fontWeight: s.id === selectedSnap ? 600 : 400 }}>
                    <span className="text-sm block">{s.label}</span>
                    {s.comment && <span className="text-xs text-on-surface-variant font-normal">{s.comment}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-on-surface ml-2">表示レベル:</span>
          <div className="flex rounded-full border border-outline overflow-hidden">
            {(['honbu', 'center', 'dept'] as const).map((level, i) => {
              const labels = { honbu: '本部', center: 'センター', dept: '部' };
              const active = viewLevel === level;
              return (
                <button key={level} onClick={() => handleViewLevel(level)}
                  className="px-4 h-9 text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: active ? '#1976D2' : 'transparent',
                    color: active ? '#fff' : '#424242',
                    borderLeft: i > 0 ? '1px solid #E0E0E0' : 'none',
                  }}>
                  {labels[level]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 人員推移グラフ ── */}
        <div className="bg-surface border border-outline rounded-lg p-5 flex flex-col gap-3">

          {/* グラフヘッダー */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-medium text-on-surface">{chartTitle}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* 凡例 */}
              <div className="flex items-center gap-1.5">
                <svg width="24" height="12"><line x1="1" y1="6" x2="23" y2="6" stroke="#1976D2" strokeWidth="2.5" strokeLinecap="round" /></svg>
                <span className="text-xs text-on-surface-variant">計画（実績期間）</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="12"><line x1="1" y1="6" x2="23" y2="6" stroke="#1976D2" strokeWidth="2" strokeDasharray="5,3" strokeLinecap="round" /></svg>
                <span className="text-xs text-on-surface-variant">計画（予測）</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="12"><line x1="1" y1="6" x2="23" y2="6" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" /></svg>
                <span className="text-xs text-on-surface-variant">実人員</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14">
                  <polygon points="7,1 13,7 7,13 1,7" fill="#00897B" stroke="white" strokeWidth="1.5" />
                </svg>
                <span className="text-xs text-on-surface-variant">将来登録済み</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14">
                  <circle cx="7" cy="7" r="5" fill="#FF9800" opacity="0.3" />
                  <circle cx="7" cy="7" r="3" fill="#FF9800" />
                </svg>
                <span className="text-xs text-on-surface-variant">選択時点</span>
              </div>
              {/* 将来人数登録ボタン */}
              <button
                onClick={() => setShowFutureModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-full border ml-1"
                style={{ borderColor: '#00897B', color: '#00897B' }}>
                <Icon name="edit_calendar" size={15} />将来人数を登録
              </button>
            </div>
          </div>

          {/* 将来登録済みポイントのサマリー */}
          {chartFuturePoints.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {futurePoints
                .filter(p => p.orgId === selectedOrgId)
                .sort((a, b) => a.monthIdx - b.monthIdx)
                .map(p => (
                  <div key={p.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border"
                    style={{ backgroundColor: '#E0F2F1', borderColor: '#80CBC4', color: '#00695C' }}>
                    <Icon name="edit_calendar" size={13} />
                    <span className="font-medium">{ALL_MONTH_LABELS[p.monthIdx]}</span>
                    <span>: {p.count}名</span>
                    {p.comment && <span className="text-on-surface-variant">（{p.comment}）</span>}
                    <button
                      onClick={() => setFuturePoints(prev => prev.filter(x => x.id !== p.id))}
                      className="ml-0.5 opacity-60 hover:opacity-100">
                      <Icon name="close" size={13} />
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* SVG チャート */}
          <LineChart
            planData={chartData.plan}
            actualData={chartData.actual}
            selectedIdx={selectedFutureIdx}
            futurePoints={chartFuturePoints}
            baselinePoint={baselinePoint}
          />

          {/* スライダー：グラフのX軸（未来部分）に重なるよう配置 */}
          <div style={{ paddingLeft: SLIDER_LEFT_PCT, paddingRight: SLIDER_RIGHT_PCT, marginTop: -6 }}>
            <input
              type="range"
              min={FUTURE_START}
              max={TOTAL_MONTHS - 1}
              value={selectedFutureIdx}
              onChange={e => setSelectedFutureIdx(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#FF9800', cursor: 'pointer' }}
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant mt-0.5">
              <span>{ALL_MONTH_LABELS[FUTURE_START]}</span>
              <span>{ALL_MONTH_LABELS[TOTAL_MONTHS - 1]}</span>
            </div>
          </div>

          {/* 差分サマリーカード */}
          <div className="flex items-center gap-4 p-4 rounded-lg border flex-wrap"
            style={{ backgroundColor: '#FFF8E1', borderColor: '#FFE082' }}>
            {/* 比較基準 */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center"
                style={{ backgroundColor: latestApplicable ? '#00897B' : '#388E3C' }}>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant">
                  {latestApplicable ? '比較基準（登録済み将来人数）' : '比較基準（最新実績）'}
                </div>
                <div className="text-sm font-medium text-on-surface">
                  {latestApplicable
                    ? <>{ALL_MONTH_LABELS[latestApplicable.monthIdx]}：<span className="text-base font-bold">{latestApplicable.count}</span>名</>
                    : <>{currentSnap.label}：<span className="text-base font-bold">{actualLast}</span>名</>
                  }
                </div>
              </div>
            </div>

            <Icon name="arrow_forward" size={18} className="text-on-surface-variant shrink-0" />

            {/* 選択時点計画 */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#FF9800' }} />
              <div>
                <div className="text-xs text-on-surface-variant">選択時点（計画）</div>
                <div className="text-sm font-medium text-on-surface">
                  {ALL_MONTH_LABELS[selectedFutureIdx]}：<span className="text-base font-bold">{planAtSelected}</span>名
                </div>
              </div>
            </div>

            {/* 差分 */}
            <div className="ml-auto flex items-center gap-3 pl-4 border-l border-[#FFE082]">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-on-surface-variant">差分</div>
                <DiffBadge diff={futureDiff} />
              </div>
              {futureDiff !== 0 && (
                <p className="text-xs text-on-surface-variant max-w-[200px]">
                  {futureDiff < 0
                    ? `現在より${Math.abs(futureDiff)}名減少する見込み`
                    : `現在より${futureDiff}名増加する見込み`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 差分テーブル ── */}
        <div className="bg-surface border border-outline rounded-lg overflow-hidden">
          <div className="flex items-center bg-surface-variant px-4 h-12">
            <div className="flex-1 text-xs font-medium text-on-surface-variant min-w-[200px]">組織</div>
            {['実人員','転出予定','転入予定','退職予定','採用予定','計画後人員','差分'].map(label => (
              <div key={label} className="w-24 text-xs font-medium text-on-surface-variant text-center shrink-0">{label}</div>
            ))}
            <div className="w-14 text-xs font-medium text-on-surface-variant text-center shrink-0">詳細</div>
          </div>

          {visibleRows.map(row => {
            const isHonbu    = row.level === 'honbu';
            const isCenter   = row.level === 'center';
            const isSelected = row.id === selectedOrgId;
            const indent     = isHonbu ? 'pl-4' : isCenter ? 'pl-10' : 'pl-16';
            const rowBg      = isSelected ? '#BBDEFB' : isHonbu ? '#E3F2FD' : 'transparent';
            return (
              <div key={row.id}
                onClick={() => setSelectedOrgId(row.id)}
                className={`flex items-center px-4 border-b border-outline last:border-b-0 cursor-pointer transition-colors ${isHonbu ? 'h-[52px]' : 'h-12'}`}
                style={{ backgroundColor: rowBg }}>
                <div className={`flex-1 flex items-center gap-2 min-w-[200px] ${indent}`}>
                  <Icon name={row.icon} size={16}
                    className={isHonbu || isSelected ? 'text-[#1976D2]' : 'text-on-surface-variant'} />
                  <span className={`text-on-surface ${isHonbu || isSelected ? 'text-sm font-medium' : 'text-sm'}`}>
                    {row.name}
                  </span>
                  {isSelected && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full ml-1"
                      style={{ backgroundColor: '#1976D2', color: '#fff' }}>選択中</span>
                  )}
                </div>
                <div className="w-24 text-center text-sm font-medium text-on-surface shrink-0">{row.actual}</div>
                <div className="w-24 text-center text-sm shrink-0" style={{ color: '#D32F2F' }}>{row.transferOut}</div>
                <div className="w-24 text-center text-sm shrink-0" style={{ color: '#1565C0' }}>+{row.transferIn}</div>
                <div className="w-24 text-center text-sm shrink-0" style={{ color: '#D32F2F' }}>{row.retirement}</div>
                <div className="w-24 text-center text-sm shrink-0" style={{ color: '#388E3C' }}>+{row.hiring}</div>
                <div className="w-24 text-center text-sm font-medium text-on-surface shrink-0">{row.planned}</div>
                <div className="w-24 flex items-center justify-center shrink-0">
                  <DiffBadge diff={row.diff} />
                </div>
                <div className="w-14 flex items-center justify-center shrink-0">
                  <button onClick={e => e.stopPropagation()}
                    className="p-1 rounded hover:bg-surface-variant text-primary">
                    <Icon name="chevron_right" size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── バイネーム差分（一致行を除外・差分のみ） ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-on-surface">{nameDiffTitle}</h2>
              <span className="text-xs text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-variant">
                差分のみ表示
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {([
                { key: 'all' as const,  label: '全て' },
                { key: '転出' as const, label: '転出のみ' },
                { key: '転入' as const, label: '転入のみ' },
                { key: '退職' as const, label: '退職' },
                { key: '採用' as const, label: '採用' },
              ]).map(({ key, label }) => {
                const active = nameFilter === key;
                return (
                  <button key={key} onClick={() => setNameFilter(key)}
                    className="px-3.5 h-8 rounded-full text-[13px] font-medium border transition-colors"
                    style={active
                      ? { backgroundColor: '#1976D2', color: '#fff', borderColor: '#1976D2' }
                      : { backgroundColor: 'transparent', color: '#424242', borderColor: '#BDBDBD' }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface border border-outline rounded-lg overflow-hidden">
            <div className="flex items-center bg-surface-variant px-4 h-11">
              <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">社員番号</div>
              <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">氏名</div>
              <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">現所属</div>
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">種別</div>
              <div className="flex-1 text-xs font-medium text-on-surface-variant min-w-[120px]">異動先 / 備考</div>
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">時期</div>
              <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">差分区分</div>
            </div>

            {filteredNames.map(row => {
              const rowBg = row.diffKind === '実績のみ' ? '#FFF8E1' : '';
              return (
                <div key={row.id}
                  className="flex items-center px-4 h-12 border-b border-outline last:border-b-0"
                  style={{ backgroundColor: rowBg || undefined }}>
                  <div className="w-28 text-sm text-on-surface-variant shrink-0">{row.empNo}</div>
                  <div className="w-32 text-sm font-medium shrink-0"
                    style={{ color: row.type === '採用' ? '#388E3C' : '#212121' }}>
                    {row.name}
                  </div>
                  <div className="w-32 text-sm text-on-surface-variant shrink-0">{row.dept}</div>
                  <div className="w-24 shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: KIND_STYLE[row.type].bg, color: KIND_STYLE[row.type].color }}>
                      {row.type}
                    </span>
                  </div>
                  <div className="flex-1 text-sm text-on-surface-variant min-w-[120px] truncate pr-2">{row.dest}</div>
                  <div className="w-24 text-sm text-on-surface-variant shrink-0">{row.date}</div>
                  <div className="w-28 shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: DIFF_KIND_STYLE[row.diffKind].bg, color: DIFF_KIND_STYLE[row.diffKind].color }}>
                      {row.diffKind}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredNames.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
                <Icon name="check_circle" size={36} className="text-[#388E3C]" />
                <p className="text-sm">差分はありません</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && <SnapshotModal onClose={() => setShowModal(false)} onSave={saveSnapshot} />}
      {showFutureModal && selectedRow && (
        <FuturePointModal
          orgName={selectedRow.name}
          onClose={() => setShowFutureModal(false)}
          onSave={saveFuturePoint}
        />
      )}

      <style jsx global>{`
        .snap-input {
          padding: 8px 12px;
          border: 1px solid #BDBDBD;
          border-radius: 4px;
          font-size: 14px;
          color: #212121;
          background: #FFFFFF;
          outline: none;
          width: 100%;
        }
        .snap-input:focus { border-color: #1976D2; }
      `}</style>
    </div>
  );
}
