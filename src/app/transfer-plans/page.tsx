'use client';
import AppBar from '@/components/AppBar';
import TabBar from '@/components/TabBar';
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

interface Plan {
  id: string;
  empName: string;
  empNo: string;
  currentDept: string;
  destDept: string;
  transferType: string;
  date: string;
  status: string;
  comment: string;
}

const PLANS: Plan[] = [
  {
    id: '1',
    empName: '佐藤 一郎',
    empNo: 'EMP-001',
    currentDept: '第一開発部',
    destDept: '第二開発部',
    transferType: '転出（異動）',
    date: '2026年7月',
    status: '承認申請中',
    comment: 'スキルの活用を考え、新規プロジェクトのコアメンバーとして異動を希望',
  },
  {
    id: '2',
    empName: '山田 悠明',
    empNo: 'EMP-004',
    currentDept: '地域管理部',
    destDept: '第一開発部',
    transferType: '転入（受入）',
    date: '2026年7月',
    status: '下書き保存',
    comment: '地域管理部からの技術者受入要請への対応',
  },
];

const TRANSFER_TYPES = ['転出（異動）', '転入（受入）', '出向', '復帰'];
const DEPTS = ['第一開発部', '第二開発部', '品質管理部', '地域管理部', 'インフラ部'];
const MONTHS = ['2026年4月', '2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月'];

interface FormState {
  empName: string;
  transferType: string;
  destDept: string;
  date: string;
  comment: string;
}

export default function TransferPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(PLANS[0]);
  const [form, setForm] = useState<FormState>({
    empName: PLANS[0].empName + '（EMP-001）',
    transferType: PLANS[0].transferType,
    destDept: PLANS[0].destDept,
    date: PLANS[0].date,
    comment: PLANS[0].comment,
  });

  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setForm({
      empName: `${plan.empName}（${plan.empNo}）`,
      transferType: plan.transferType,
      destDept: plan.destDept,
      date: plan.date,
      comment: plan.comment,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="person" roleLabel="部長：田中太郎" />
      <TabBar />

      <main className="flex-1 p-6 flex gap-6">
        {/* Left: Plan list */}
        <div className="flex flex-col gap-4 w-[380px] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-on-surface">異動計画一覧</h2>
            <button
              className="flex items-center gap-1.5 text-sm font-medium text-on-primary px-4 h-9 rounded-full"
              style={{ backgroundColor: '#1976D2' }}
            >
              <Icon name="add" size={18} className="text-on-primary" />
              新規作成
            </button>
          </div>

          {PLANS.map((plan) => {
            const isActive = selectedPlan?.id === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => selectPlan(plan)}
                className="w-full text-left bg-surface rounded-lg p-4 flex flex-col gap-3"
                style={{
                  border: isActive ? '2px solid #1976D2' : '1px solid #E0E0E0',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-medium text-on-surface">{plan.empName}</span>
                    <span className="ml-2 text-xs text-on-surface-variant">{plan.empNo}</span>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>
                <div
                  className="flex flex-col gap-1.5 pt-3 border-t border-outline text-[13px] text-on-surface-variant"
                >
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">異動種別：</span>
                    <span className="text-on-surface">{plan.transferType}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">異動先：</span>
                    <span className="text-on-surface">{plan.destDept}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">時期：</span>
                    <span className="text-on-surface">{plan.date}</span>
                  </div>
                  {plan.comment && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0">コメント：</span>
                      <span className="text-on-surface line-clamp-2">{plan.comment}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Edit form */}
        <div className="flex-1 bg-surface border border-outline rounded-lg flex flex-col overflow-hidden max-w-xl">
          {/* Form header */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
            <span className="text-lg font-medium text-on-surface">異動計画 編集</span>
            <button className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
              <Icon name="close" size={24} />
            </button>
          </div>

          {/* Form body */}
          <div className="flex flex-col gap-5 p-5 overflow-y-auto">
            {/* 対象者 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-on-surface-variant font-medium">対象者</label>
              <input
                className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-primary"
                value={form.empName}
                onChange={(e) => setForm({ ...form, empName: e.target.value })}
                readOnly
              />
            </div>

            {/* 異動種別 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-on-surface-variant font-medium">異動種別（転出/転入）</label>
              <select
                className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-primary bg-surface appearance-none"
                value={form.transferType}
                onChange={(e) => setForm({ ...form, transferType: e.target.value })}
              >
                {TRANSFER_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 異動先/部署 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-on-surface-variant font-medium">異動先 / 部署</label>
              <select
                className="h-10 px-3 border border-primary rounded text-sm text-on-surface outline-none focus:border-primary bg-[#E3F2FD] appearance-none"
                value={form.destDept}
                onChange={(e) => setForm({ ...form, destDept: e.target.value })}
              >
                {DEPTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 異動時期 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-on-surface-variant font-medium">異動時期</label>
              <select
                className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-primary bg-surface appearance-none"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              >
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* コメント */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-on-surface-variant font-medium">コメント・備考</label>
              <textarea
                className="p-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-primary resize-none"
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline">
              <button className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">
                キャンセル
              </button>
              <button className="text-sm font-medium text-primary px-4 h-9 rounded-full border border-primary hover:bg-primary-container">
                下書き保存
              </button>
              <button
                className="text-sm font-medium text-on-primary px-4 h-9 rounded-full"
                style={{ backgroundColor: '#1976D2' }}
              >
                承認申請
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
