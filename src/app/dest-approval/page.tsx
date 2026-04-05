'use client';
import AppBar from '@/components/AppBar';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';
import Icon from '@/components/Icon';

interface Candidate {
  id: string;
  name: string;
  empNo: string;
  currentDept: string;
  currentRank: string;
  transferDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const initialCandidates: Candidate[] = [
  {
    id: '1',
    name: '佐藤 一郎',
    empNo: 'EMP-001',
    currentDept: '第一開発部・第一グループ',
    currentRank: '主任',
    transferDate: '2026年7月',
    reason: '長・第一開発部から 独立 勤務以上 スキルシート有り',
    status: 'pending',
  },
  {
    id: '2',
    name: '渡辺 弥生',
    empNo: 'EMP-022',
    currentDept: '地域管理部・第四グループ',
    currentRank: '一般',
    transferDate: '2026年7月',
    reason: '受け入れ部の技術者招聘リクエストへの対応（スキルセットが入居予定）',
    status: 'approved',
  },
];

export default function DestApprovalPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const approve = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
    );
  };

  const reject = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="person" roleLabel="部長：木村次長" />

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-on-surface">受入異動 承認</h1>
            <p className="text-sm text-on-surface-variant mt-1">第二開発部への異動予定者の確認と承認</p>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-medium text-on-primary px-6 h-10 rounded-full"
            style={{ backgroundColor: '#1976D2' }}
          >
            <Icon name="send" size={18} className="text-on-primary" />
            現場確認外の意見を登録
          </button>
        </div>

        {/* Candidate cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {candidates.map((c) => {
            const isApproved = c.status === 'approved';
            const isRejected = c.status === 'rejected';
            return (
              <div
                key={c.id}
                className="bg-surface rounded-lg overflow-hidden flex flex-col"
                style={{
                  border: isApproved
                    ? '2px solid #4CAF50'
                    : isRejected
                    ? '2px solid #D32F2F'
                    : '1px solid #E0E0E0',
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-outline"
                >
                  <div>
                    <span className="text-base font-medium text-on-surface">{c.name}</span>
                    <span className="ml-2 text-xs text-on-surface-variant">{c.empNo}</span>
                  </div>
                  <StatusBadge
                    status={
                      isApproved ? '承認済み' : isRejected ? '差戻中' : '承認申請中'
                    }
                  />
                </div>

                {/* Card body */}
                <div className="flex flex-col gap-3 p-4">
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <span className="text-on-surface-variant">現所属：</span>
                      <span className="text-on-surface font-medium">{c.currentDept}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">現役職：</span>
                      <span className="text-on-surface font-medium">{c.currentRank}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">異動時期：</span>
                      <span className="text-on-surface font-medium">{c.transferDate}</span>
                    </div>
                  </div>
                  <div className="text-[13px]">
                    <span className="text-on-surface-variant">備考：</span>
                    <span className="text-on-surface">{c.reason}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end pt-2 border-t border-outline">
                    {c.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => reject(c.id)}
                          className="text-sm text-on-surface-variant px-4 h-8 rounded-full border border-outline hover:bg-surface-variant"
                        >
                          差戻
                        </button>
                        <button
                          onClick={() => approve(c.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-on-primary px-4 h-8 rounded-full"
                          style={{ backgroundColor: '#388E3C' }}
                        >
                          <Icon name="check" size={16} className="text-on-primary" />
                          承認
                        </button>
                      </>
                    ) : isApproved ? (
                      <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                        <Icon name="check_circle" size={18} className="text-success" />
                        承認済み
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-error text-sm font-medium">
                        <Icon name="cancel" size={18} className="text-error" />
                        差戻済み
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
