'use client';
import AppBar from '@/components/AppBar';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-on-surface-variant text-sm">—</span>;
  const isPos = value > 0;
  return (
    <span
      className="text-sm font-medium"
      style={{ color: isPos ? '#D32F2F' : '#388E3C' }}
    >
      {isPos ? '+' : ''}{value}
    </span>
  );
}

interface DiffRow {
  org: string;
  indent: boolean;
  actual: number;
  transferOut: number;
  deltaOut: number;
  transferIn: number;
  deltaIn: number;
  resign: number;
  deltaResign: number;
  hire: number;
  deltaHire: number;
  net: number;
  diff: number;
}

const DIFF_ROWS: DiffRow[] = [
  { org: '開発本部（合計）', indent: false, actual: 186, transferOut: -8, deltaOut: 0, transferIn: 5, deltaIn: 0, resign: -3, deltaResign: 0, hire: 4, deltaHire: 0, net: 184, diff: 0 },
  { org: '地域センター',      indent: true,  actual: 98,  transferOut: -5, deltaOut: 0, transferIn: 2, deltaIn: 0, resign: -1, deltaResign: 0, hire: 2, deltaHire: 0, net: 96,  diff: -1 },
  { org: '品質センター',      indent: true,  actual: 59,  transferOut: -3, deltaOut: 0, transferIn: 3, deltaIn: 0, resign: -2, deltaResign: 0, hire: 2, deltaHire: 0, net: 57,  diff: -1 },
];

interface NameDiffRow {
  empNo: string;
  name: string;
  type: string;
  dept: string;
  date: string;
  status: string;
}

const NAME_ROWS: NameDiffRow[] = [
  { empNo: 'EMP-001', name: '佐藤 一郎', type: '異動転出', dept: '→ 第二開発部',   date: '2026年7月', status: '承認申請中' },
  { empNo: 'EMP-003', name: '黒田 健太', type: '退職予定', dept: '第一開発部',       date: '2026年5月', status: '承認申請中' },
  { empNo: 'NEW-01',  name: '(採用予定)', type: '採用予定', dept: '→ 地域管理部',   date: '2026年4月', status: '採用予定' },
];

const VIEW_LEVELS = ['本部', 'センター', '部'];
const SNAPSHOTS = ['2026年3月1日時点', '2026年2月1日時点', '2026年1月1日時点'];

export default function SnapshotPage() {
  const [viewLevel, setViewLevel] = useState('センター');
  const [snapshot, setSnapshot] = useState(SNAPSHOTS[0]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="admin_panel_settings" roleLabel="人事部：加藤恵子" />

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-on-surface">人員スナップショット・差分分析</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              実人員と異動計画の差分を本部→センター→部でドリルダウン
            </p>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-medium text-on-primary px-6 h-10 rounded-full"
            style={{ backgroundColor: '#1976D2' }}
          >
            <Icon name="camera_alt" size={18} className="text-on-primary" />
            スナップショット登録
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-on-surface">スナップショット:</span>
          <div className="relative">
            <select
              className="appearance-none h-10 pl-3 pr-8 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-primary bg-surface w-52"
              value={snapshot}
              onChange={(e) => setSnapshot(e.target.value)}
            >
              {SNAPSHOTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <Icon
              name="arrow_drop_down"
              size={24}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
          </div>

          <span className="text-sm font-medium text-on-surface">表示レベル:</span>
          <div className="flex border border-outline rounded-full overflow-hidden">
            {VIEW_LEVELS.map((level, i) => {
              const active = level === viewLevel;
              const isFirst = i === 0;
              const isLast = i === VIEW_LEVELS.length - 1;
              return (
                <button
                  key={level}
                  onClick={() => setViewLevel(level)}
                  className="text-sm px-4 h-9"
                  style={{
                    backgroundColor: active ? '#1976D2' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#212121',
                    borderRadius: isFirst ? '20px 0 0 20px' : isLast ? '0 20px 20px 0' : '0',
                    borderLeft: i > 0 ? '1px solid #E0E0E0' : 'none',
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diff table */}
        <div className="bg-surface border border-outline rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center bg-surface-variant px-4 h-12">
            <div className="flex-1 text-xs font-medium text-on-surface-variant">組織</div>
            <div className="w-[100px] text-xs font-medium text-on-surface-variant text-center shrink-0">実人員</div>
            <div className="w-[100px] text-xs font-medium text-on-surface-variant text-center shrink-0">転出予定</div>
            <div className="w-[100px] text-xs font-medium text-on-surface-variant text-center shrink-0">転入予定</div>
            <div className="w-[100px] text-xs font-medium text-on-surface-variant text-center shrink-0">退職予定</div>
            <div className="w-[100px] text-xs font-medium text-on-surface-variant text-center shrink-0">採用予定</div>
            <div className="w-[100px] text-xs font-medium text-on-surface-variant text-center shrink-0">差引後人員</div>
            <div className="w-16 text-xs font-medium text-on-surface-variant text-center shrink-0">差分</div>
            <div className="w-14 text-xs font-medium text-on-surface-variant text-center shrink-0">詳細</div>
          </div>

          {DIFF_ROWS.map((row, i) => (
            <div
              key={row.org}
              className="flex items-center px-4 h-[52px] border-b border-outline last:border-b-0"
              style={{
                paddingLeft: row.indent ? 40 : 16,
                backgroundColor: i === 0 ? '#E3F2FD' : '#FFFFFF',
              }}
            >
              <div className="flex-1 flex items-center gap-2">
                {!row.indent && <Icon name="keyboard_arrow_right" size={18} className="text-on-surface-variant" />}
                <span className={`text-sm ${row.indent ? 'text-on-surface-variant' : 'font-medium text-on-surface'}`}>
                  {row.org}
                </span>
              </div>
              <div className="w-[100px] text-sm text-center text-on-surface shrink-0">{row.actual}</div>
              <div className="w-[100px] text-sm text-center shrink-0">
                <span className="text-error font-medium">{row.transferOut}</span>
              </div>
              <div className="w-[100px] text-sm text-center shrink-0">
                <span className="text-info font-medium">+{row.transferIn}</span>
              </div>
              <div className="w-[100px] text-sm text-center shrink-0">
                <span className="text-error font-medium">{row.resign}</span>
              </div>
              <div className="w-[100px] text-sm text-center shrink-0">
                <span className="text-success font-medium">+{row.hire}</span>
              </div>
              <div className="w-[100px] text-sm text-center font-medium text-on-surface shrink-0">{row.net}</div>
              <div className="w-16 text-center shrink-0">
                <Delta value={row.diff} />
              </div>
              <div className="w-14 flex items-center justify-center shrink-0">
                <button className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
                  <Icon name="chevron_right" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Individual diff section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-on-surface">バイネーム差分（開発センター）</h2>
            <div className="flex items-center gap-2">
              {['全て', '異動', '退職', '採用'].map((f) => (
                <button
                  key={f}
                  className="text-xs px-3 h-7 rounded-full border border-outline text-on-surface-variant hover:bg-surface-variant"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-outline rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center bg-surface-variant px-4 h-11">
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">社員番号</div>
              <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">氏名</div>
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">異動区分</div>
              <div className="flex-1 text-xs font-medium text-on-surface-variant">異動先/内容</div>
              <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">実施予定日</div>
              <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">ステータス</div>
              <div className="w-14 text-xs font-medium text-on-surface-variant text-center shrink-0">詳細</div>
            </div>

            {NAME_ROWS.map((row, i) => (
              <div
                key={row.empNo}
                className="flex items-center px-4 h-12 border-b border-outline last:border-b-0"
                style={{ backgroundColor: i === NAME_ROWS.length - 1 ? '#E8F5E9' : '#FFFFFF' }}
              >
                <div className="w-24 text-sm text-on-surface-variant shrink-0">{row.empNo}</div>
                <div className="w-32 text-sm font-medium text-on-surface shrink-0">{row.name}</div>
                <div className="w-24 text-sm text-on-surface-variant shrink-0">{row.type}</div>
                <div className="flex-1 text-sm text-on-surface">{row.dept}</div>
                <div className="w-28 text-sm text-on-surface-variant shrink-0">{row.date}</div>
                <div className="w-28 shrink-0">
                  <StatusBadge status={row.status} />
                </div>
                <div className="w-14 flex items-center justify-center shrink-0">
                  <button className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
                    <Icon name="chevron_right" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
