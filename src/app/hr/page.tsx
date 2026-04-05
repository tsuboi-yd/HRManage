'use client';
import AppBar from '@/components/AppBar';
import { useState } from 'react';
import Icon from '@/components/Icon';

// ================================================================
// データ型
// ================================================================
type ItemType = '転出（異動）' | '退職' | '本部外転入' | '本部内転入' | '新卒採用' | '中途採用' | '契約採用';
type ApprovalState = '最終承認待ち' | '異動先未承認' | '承認済み' | '差戻中';

interface HRItem {
  id: string;
  sector: string;   // センター名
  dept: string;
  name: string;
  empNo: string;
  type: ItemType;
  detail: string;   // 異動先内容
  date: string;
  state: ApprovalState;
  checked: boolean;
}

// ================================================================
// マスタ
// ================================================================
const TYPE_STYLE: Record<ItemType, { bg: string; color: string }> = {
  '転出（異動）': { bg: '#FFF3E0', color: '#E65100' },
  '退職':         { bg: '#FFEBEE', color: '#D32F2F' },
  '本部外転入':   { bg: '#FFF3E0', color: '#E65100' },
  '本部内転入':   { bg: '#EDE7F6', color: '#6A1B9A' },
  '新卒採用':     { bg: '#E3F2FD', color: '#1976D2' },
  '中途採用':     { bg: '#E8F5E9', color: '#388E3C' },
  '契約採用':     { bg: '#FFF3E0', color: '#F57C00' },
};

const FLOW_STEPS = ['部長申請', 'センター長確認', '異動先承認', '人事最終承認'];

// ================================================================
// モックデータ
// ================================================================
const INIT_ITEMS: HRItem[] = [
  { id: 'h1', sector: '開発', dept: '第一', name: '佐藤 一郎',           empNo: 'EMP-001', type: '転出（異動）', detail: '第二開発部',   date: '2026年7月',  state: '最終承認待ち', checked: true  },
  { id: 'h2', sector: '開発', dept: '第一', name: '高橋 健太',           empNo: 'EMP-007', type: '退職',         detail: '—',           date: '2026年9月',  state: '最終承認待ち', checked: false },
  { id: 'h3', sector: '開発', dept: '第一', name: '山田 美咲',           empNo: 'EMP-014', type: '転出（異動）', detail: '品質管理部',   date: '2026年10月', state: '異動先未承認', checked: false },
  { id: 'h4', sector: '開発', dept: '第一', name: '鈴木 花子',           empNo: 'TIN-003', type: '本部内転入',   detail: '品質管理部 →', date: '2026年10月', state: '最終承認待ち', checked: false },
  { id: 'h5', sector: '開発', dept: '第一', name: '佐々木 亮',           empNo: 'TIN-005', type: '本部内転入',   detail: '地域管理部 →', date: '2026年7月',  state: '承認済み',    checked: false },
  { id: 'h6', sector: '開発', dept: '第一', name: '新卒エンジニア（26卒）', empNo: 'REC-003', type: '新卒採用',  detail: '第一開発部',   date: '2027年3月',  state: '最終承認待ち', checked: false },
  { id: 'h7', sector: '開発', dept: '第二', name: '木村 誠',             empNo: 'EMP-021', type: '転出（異動）', detail: '品質保証部',   date: '2026年8月',  state: '最終承認待ち', checked: false },
  { id: 'h8', sector: '品質', dept: '品質管理', name: '林 由美子',       empNo: 'EMP-033', type: '退職',         detail: '—',           date: '2026年7月',  state: '最終承認待ち', checked: false },
  { id: 'h9', sector: '品質', dept: '品質管理', name: '渡辺 正志',       empNo: 'EMP-040', type: '転出（異動）', detail: 'インフラ部',   date: '2026年9月',  state: '異動先未承認', checked: false },
];

// ================================================================
// 承認フロー ステッパー（人事用：常に steps 1-3 完了、step 4 がアクティブ）
// ================================================================
function HRStepper() {
  return (
    <div
      className="flex items-center justify-center gap-0 px-8 py-4 rounded-lg bg-surface shrink-0"
      style={{ border: '1px solid #E0E0E0' }}
    >
      {FLOW_STEPS.map((label, index) => {
        const done   = index < 3;
        const active = index === 3;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: done ? '#388E3C' : '#1976D2' }}
              >
                {done ? (
                  <Icon name="check" size={18} className="text-white" />
                ) : (
                  <span className="text-sm font-bold text-white">4</span>
                )}
              </div>
              <span
                className="text-[11px] font-medium whitespace-nowrap"
                style={{ color: done ? '#388E3C' : '#1976D2', fontWeight: active ? 600 : 400 }}
              >
                {label}
              </span>
            </div>
            {index < FLOW_STEPS.length - 1 && (
              <div
                className="h-0.5 mb-5"
                style={{ width: 80, backgroundColor: index < 2 ? '#388E3C' : '#1976D2', margin: '0 8px 20px' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// テーブルヘルパー
// ================================================================
function TH({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-on-surface-variant">{children}</span>;
}
function Cell({ w, flex, center, children }: { w?: number; flex?: boolean; center?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center${center ? ' justify-center' : ''}`}
      style={{ width: flex ? undefined : w, flex: flex ? 1 : undefined, minWidth: 0 }}
    >
      {children}
    </div>
  );
}

// ================================================================
// メインページ
// ================================================================
export default function HRPage() {
  const [items, setItems] = useState<HRItem[]>(INIT_ITEMS);

  const allCheckable = items.filter((i) => i.state === '最終承認待ち');
  const allChecked   = allCheckable.length > 0 && allCheckable.every((i) => i.checked);
  const checkedCount = items.filter((i) => i.checked).length;
  const pendingCount = items.filter((i) => i.state === '最終承認待ち').length;
  const approvedCount= items.filter((i) => i.state === '承認済み').length;

  const toggleAll = () => {
    const next = !allChecked;
    setItems((prev) =>
      prev.map((i) => (i.state === '最終承認待ち' ? { ...i, checked: next } : i))
    );
  };

  const toggleOne = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const handleApprove = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, state: '承認済み', checked: false } : i)));

  const handleReturn = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, state: '差戻中', checked: false } : i)));

  const handleBulkApprove = () =>
    setItems((prev) =>
      prev.map((i) => (i.checked ? { ...i, state: '承認済み', checked: false } : i))
    );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="admin_panel_settings" roleLabel="人事部：加藤恵子" />

      <main className="flex flex-col gap-6 p-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-normal text-on-surface">人事 最終承認</h1>
            <p className="text-sm text-on-surface-variant">
              全センターの異動・退職・採用計画の最終確認
              <span className="ml-3 text-xs">
                最終承認待ち <strong className="text-[#1976D2]">{pendingCount}</strong>件 ／
                承認済み <strong className="text-[#388E3C]">{approvedCount}</strong>件
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-5 h-10 rounded-full text-sm font-medium border border-outline text-on-surface hover:bg-surface-variant"
            >
              <Icon name="download" size={18} />
              CSV出力
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={checkedCount === 0}
              className="flex items-center gap-2 px-5 h-10 rounded-full text-sm font-medium text-white disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: '#1976D2' }}
            >
              <Icon name="done_all" size={18} />
              一括承認 {checkedCount > 0 && `(${checkedCount}件)`}
            </button>
          </div>
        </div>

        {/* 承認フローステッパー */}
        <HRStepper />

        {/* テーブル */}
        <div className="bg-surface rounded-lg overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
          {/* ヘッダー行 */}
          <div className="flex items-center h-12 px-4 gap-3 bg-surface-variant">
            <Cell w={48} center>
              <button
                onClick={toggleAll}
                className="w-[18px] h-[18px] rounded flex items-center justify-center"
                style={{
                  backgroundColor: allChecked ? '#1976D2' : undefined,
                  border: allChecked ? 'none' : '2px solid #9E9E9E',
                }}
              >
                {allChecked && <Icon name="check" size={14} className="text-white" />}
              </button>
            </Cell>
            <Cell w={80}><TH>センター</TH></Cell>
            <Cell w={90}><TH>部門</TH></Cell>
            <Cell w={130}><TH>氏名</TH></Cell>
            <Cell w={100}><TH>種別</TH></Cell>
            <Cell w={140}><TH>異動先 / 内容</TH></Cell>
            <Cell w={100}><TH>月度</TH></Cell>
            <Cell flex><TH>承認状況</TH></Cell>
            <Cell w={140} center><TH>アクション</TH></Cell>
          </div>

          {/* データ行 */}
          {items.map((item) => {
            const ts = TYPE_STYLE[item.type];
            const canApprove = item.state === '最終承認待ち';
            const notReady   = item.state === '異動先未承認';

            return (
              <div
                key={item.id}
                className="flex items-center h-[52px] px-4 gap-3"
                style={{ borderTop: '1px solid #E0E0E0' }}
              >
                <Cell w={48} center>
                  {canApprove ? (
                    <button
                      onClick={() => toggleOne(item.id)}
                      className="w-[18px] h-[18px] rounded flex items-center justify-center"
                      style={{
                        backgroundColor: item.checked ? '#1976D2' : undefined,
                        border: item.checked ? 'none' : '2px solid #9E9E9E',
                      }}
                    >
                      {item.checked && <Icon name="check" size={14} className="text-white" />}
                    </button>
                  ) : (
                    <div className="w-[18px] h-[18px] rounded" style={{ border: '2px solid #E0E0E0' }} />
                  )}
                </Cell>
                <Cell w={80}>
                  <span className="text-sm text-on-surface-variant">{item.sector}</span>
                </Cell>
                <Cell w={90}>
                  <span className="text-sm text-on-surface-variant">{item.dept}</span>
                </Cell>
                <Cell w={130}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-on-surface truncate">{item.name}</span>
                    <span className="text-xs text-on-surface-variant">{item.empNo}</span>
                  </div>
                </Cell>
                <Cell w={100}>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ backgroundColor: ts.bg, color: ts.color }}
                  >
                    {item.type}
                  </span>
                </Cell>
                <Cell w={140}>
                  <span className="text-sm text-on-surface truncate">{item.detail}</span>
                </Cell>
                <Cell w={100}>
                  <span className="text-sm text-on-surface">{item.date}</span>
                </Cell>
                <Cell flex>
                  {item.state === '最終承認待ち' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F5E9', color: '#388E3C' }}>
                      全承認済
                    </span>
                  )}
                  {item.state === '異動先未承認' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFF3E0', color: '#F57C00' }}>
                      異動先未承認
                    </span>
                  )}
                  {item.state === '承認済み' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>
                      <Icon name="check_circle" size={12} />
                      人事承認済
                    </span>
                  )}
                  {item.state === '差戻中' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFEBEE', color: '#D32F2F' }}>
                      差戻中
                    </span>
                  )}
                </Cell>
                <Cell w={140} center>
                  {canApprove && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="text-xs font-medium text-white px-3 h-8 rounded-full"
                        style={{ backgroundColor: '#1976D2' }}
                      >
                        最終承認
                      </button>
                      <button
                        onClick={() => handleReturn(item.id)}
                        className="text-xs font-medium px-3 h-8 rounded-full border"
                        style={{ borderColor: '#D32F2F', color: '#D32F2F' }}
                      >
                        差戻す
                      </button>
                    </div>
                  )}
                  {notReady && (
                    <span className="text-xs text-on-surface-variant">承認不可</span>
                  )}
                  {(item.state === '承認済み' || item.state === '差戻中') && (
                    <span className="text-xs text-on-surface-variant">—</span>
                  )}
                </Cell>
              </div>
            );
          })}

          {/* フッター */}
          <div className="flex items-center justify-between px-4 h-12 border-t border-outline bg-surface-variant">
            <span className="text-xs text-on-surface-variant">全 {items.length} 件</span>
            {checkedCount > 0 && (
              <span className="text-xs text-[#1976D2] font-medium">{checkedCount} 件選択中</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
