'use client';
import AppBar from '@/components/AppBar';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';
import Icon from '@/components/Icon';

interface ReviewItem {
  id: string;
  dept: string;
  name: string;
  empNo: string;
  currentRank: string;
  destPlan: string;
  transferDate: string;
  status: string;
  locked: boolean;
}

const REVIEWS: ReviewItem[] = [
  { id: '1', dept: '第一開発部', name: '佐藤 一郎', empNo: 'EMP-001', currentRank: '一般',   destPlan: '第二開発部',  transferDate: '2026年1月', status: '承認申請中', locked: false },
  { id: '2', dept: '第一開発部', name: '高橋 達美', empNo: 'EMP-003', currentRank: '退職',   destPlan: '—',           transferDate: '2026年1月', status: '承認申請中', locked: false },
  { id: '3', dept: '品質管理部', name: '伊藤 清志', empNo: 'EMP-015', currentRank: '学生',   destPlan: 'カレッジ赴任', transferDate: '2026年5月', status: '差戻中',     locked: true  },
];

const DEPT_FILTERS = ['全部門', '第一開発部', '第二開発部', '品質管理部'];

export default function CenterReviewPage() {
  const [activeFilter, setActiveFilter] = useState('全部門');

  const filtered = activeFilter === '全部門'
    ? REVIEWS
    : REVIEWS.filter((r) => r.dept === activeFilter);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="shield_person" roleLabel="センター長：山本部長" />

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-on-surface">異動計画 確認・修正</h1>
            <p className="text-sm text-on-surface-variant mt-1">開発センター 全部門の異動計画を確認</p>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-medium text-on-primary px-6 h-10 rounded-full"
            style={{ backgroundColor: '#7B1FA2' }}
          >
            <Icon name="check_circle" size={18} className="text-on-primary" />
            修正確定を提出
          </button>
        </div>

        {/* Dept filter chips */}
        <div className="flex items-center gap-2">
          {DEPT_FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="flex items-center px-3.5 h-8 rounded-full text-[13px]"
                style={
                  active
                    ? { backgroundColor: '#1976D2', color: '#FFFFFF' }
                    : { border: '1px solid #E0E0E0', color: '#212121', backgroundColor: '#FFFFFF' }
                }
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Review table */}
        <div className="bg-surface border border-outline rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center bg-surface-variant px-4 h-12">
            <div className="w-14 text-xs font-medium text-on-surface-variant shrink-0">部門</div>
            <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">氏名</div>
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">現役職</div>
            <div className="w-36 text-xs font-medium text-on-surface-variant shrink-0">異動先（計画）</div>
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">異動時期</div>
            <div className="flex-1 text-xs font-medium text-on-surface-variant">スコープ</div>
            <div className="w-40 text-xs font-medium text-on-surface-variant text-center shrink-0">アクション</div>
          </div>

          {/* Rows */}
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-4 h-14 border-b border-outline last:border-b-0"
              style={item.locked ? { backgroundColor: '#F3E5F5' } : undefined}
            >
              <div className="w-14 text-sm text-on-surface-variant shrink-0">{item.dept.slice(0, 2)}</div>
              <div className="w-32 flex flex-col shrink-0">
                <span className="text-sm font-medium text-on-surface">{item.name}</span>
                <span className="text-xs text-on-surface-variant">{item.empNo}</span>
              </div>
              <div className="w-24 text-sm text-on-surface-variant shrink-0">{item.currentRank}</div>
              <div className="w-36 text-sm text-on-surface shrink-0">{item.destPlan}</div>
              <div className="w-24 text-sm text-on-surface-variant shrink-0">{item.transferDate}</div>
              <div className="flex-1">
                <StatusBadge status={item.status} />
              </div>
              <div className="w-40 flex items-center justify-center gap-2 shrink-0">
                {item.locked ? (
                  <Icon name="lock" size={18} className="text-on-surface-variant" />
                ) : (
                  <>
                    <button
                      className="text-xs font-medium text-on-primary px-3 h-7 rounded"
                      style={{ backgroundColor: '#388E3C' }}
                    >
                      承認
                    </button>
                    <button
                      className="text-xs font-medium text-on-primary px-3 h-7 rounded"
                      style={{ backgroundColor: '#D32F2F' }}
                    >
                      差戻
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
