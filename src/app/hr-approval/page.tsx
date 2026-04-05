'use client';
import AppBar from '@/components/AppBar';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';
import Icon from '@/components/Icon';

interface ApprovalItem {
  id: string;
  center: string;
  dept: string;
  name: string;
  empNo: string;
  type: string;
  destDept: string;
  grade: string;
  targetDate: string;
  status: string;
}

const ITEMS: ApprovalItem[] = [
  { id: '1', center: '代用', dept: '第一開発部', name: '佐藤 一郎', empNo: 'EMP-001', type: '異動',   destDept: '第二開発部', grade: 'A等',   targetDate: '2026年5月', status: '承認申請中' },
  { id: '2', center: '第一', dept: '第一開発部', name: '高橋 達美', empNo: 'EMP-003', type: '退職',   destDept: '—',          grade: '—',     targetDate: '2026年6月', status: '承認申請中' },
  { id: '3', center: '地域', dept: '地域管理部', name: '木下 光雄', empNo: 'NEW-01',  type: '採用',   destDept: '地域管理部', grade: 'B等',   targetDate: '2026年4月', status: '承認申請中' },
];

const STEPS = [
  { label: '部長申請',     done: true  },
  { label: 'センター長確認', done: true  },
  { label: '異動先承認',   done: true  },
  { label: '人事最終承認', done: false },
];

export default function HrApprovalPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(ITEMS.map((i) => [i.id, i.status]))
  );

  const toggleAll = () => {
    if (selected.size === ITEMS.length) setSelected(new Set());
    else setSelected(new Set(ITEMS.map((i) => i.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const approve = (id: string) => setStatuses((prev) => ({ ...prev, [id]: '承認済み' }));
  const reject = (id: string) => setStatuses((prev) => ({ ...prev, [id]: '差戻中' }));

  const approveAll = () => {
    const next = { ...statuses };
    selected.forEach((id) => { next[id] = '承認済み'; });
    setStatuses(next);
    setSelected(new Set());
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="admin_panel_settings" roleLabel="人事部：加藤恵子" />

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-on-surface">人事 最終承認</h1>
            <p className="text-sm text-on-surface-variant mt-1">全センターの異動・退職・採用計画の最終確認</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm text-on-surface px-4 h-10 rounded-full border border-outline hover:bg-surface-variant">
              <Icon name="download" size={18} className="text-on-surface-variant" />
              CSV出力
            </button>
            <button
              onClick={approveAll}
              disabled={selected.size === 0}
              className="flex items-center gap-2 text-sm font-medium text-on-primary px-6 h-10 rounded-full disabled:opacity-40"
              style={{ backgroundColor: '#1976D2' }}
            >
              <Icon name="done_all" size={18} className="text-on-primary" />
              一括承認 {selected.size > 0 && `(${selected.size}件)`}
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div
          className="bg-surface border border-outline rounded-lg flex items-center justify-center gap-3 py-4 px-6"
        >
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            const isCurrent = !step.done;
            return (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: step.done || isCurrent ? (step.done ? '#388E3C' : '#1976D2') : '#E0E0E0',
                      color: step.done || isCurrent ? '#FFFFFF' : '#757575',
                    }}
                  >
                    {step.done ? (
                      <Icon name="check" size={16} className="text-white" />
                    ) : (
                      String(i + 1)
                    )}
                  </div>
                  <span
                    className="text-xs whitespace-nowrap"
                    style={{
                      color: step.done ? '#388E3C' : isCurrent ? '#1976D2' : '#757575',
                      fontWeight: isCurrent ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className="w-20 h-0.5 mb-4"
                    style={{ backgroundColor: step.done ? '#388E3C' : '#1976D2' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Approval table */}
        <div className="bg-surface border border-outline rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center bg-surface-variant px-4 h-12">
            <div className="w-12 flex items-center justify-center shrink-0">
              <input
                type="checkbox"
                checked={selected.size === ITEMS.length}
                onChange={toggleAll}
                className="w-4 h-4 accent-primary"
              />
            </div>
            <div className="w-16 text-xs font-medium text-on-surface-variant shrink-0">センター</div>
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">部門</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">氏名</div>
            <div className="w-20 text-xs font-medium text-on-surface-variant shrink-0">種別</div>
            <div className="w-36 text-xs font-medium text-on-surface-variant shrink-0">異動先/採用先</div>
            <div className="w-16 text-xs font-medium text-on-surface-variant shrink-0">職級</div>
            <div className="flex-1 text-xs font-medium text-on-surface-variant">完了目標日</div>
            <div className="w-32 text-xs font-medium text-on-surface-variant text-center shrink-0">アクション</div>
          </div>

          {/* Rows */}
          {ITEMS.map((item) => {
            const status = statuses[item.id];
            return (
              <div
                key={item.id}
                className="flex items-center px-4 h-[52px] border-b border-outline last:border-b-0 hover:bg-[#F8F9FF]"
              >
                <div className="w-12 flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>
                <div className="w-16 text-sm text-on-surface-variant shrink-0">{item.center}</div>
                <div className="w-24 text-sm text-on-surface-variant shrink-0">{item.dept}</div>
                <div className="w-28 flex flex-col shrink-0">
                  <span className="text-sm font-medium text-on-surface">{item.name}</span>
                  <span className="text-xs text-on-surface-variant">{item.empNo}</span>
                </div>
                <div className="w-20 shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: item.type === '採用' ? '#E8F5E9' : item.type === '退職' ? '#FFEBEE' : '#E3F2FD',
                      color: item.type === '採用' ? '#388E3C' : item.type === '退職' ? '#D32F2F' : '#1976D2',
                    }}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="w-36 text-sm text-on-surface shrink-0">{item.destDept}</div>
                <div className="w-16 text-sm text-on-surface-variant shrink-0">{item.grade}</div>
                <div className="flex-1 text-sm text-on-surface-variant">{item.targetDate}</div>
                <div className="w-32 flex items-center justify-center gap-2 shrink-0">
                  {status === '承認申請中' ? (
                    <>
                      <button
                        onClick={() => approve(item.id)}
                        className="text-xs font-medium text-on-primary px-3 h-7 rounded"
                        style={{ backgroundColor: '#388E3C' }}
                      >
                        承認
                      </button>
                      <button
                        onClick={() => reject(item.id)}
                        className="text-xs font-medium text-on-primary px-3 h-7 rounded"
                        style={{ backgroundColor: '#D32F2F' }}
                      >
                        却下
                      </button>
                    </>
                  ) : (
                    <StatusBadge status={status} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
