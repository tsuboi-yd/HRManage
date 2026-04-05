'use client';
import CenterPageShell from '@/components/CenterPageShell';
import Icon from '@/components/Icon';
import { useState } from 'react';

// ================================================================
// データ型
// ================================================================
type ItemType = '転出（異動）' | '退職' | '本部外転入' | '本部内転入' | '新卒採用' | '中途採用' | '契約採用';
type RowStatus = '要確認' | '確認済み' | '差戻中' | 'センター長追加';

interface ReviewItem {
  id: string;
  dept: string;
  name: string;
  empNo: string;
  type: ItemType;
  direction: string;
  date: string;
  status: RowStatus;
  isCenterAdded: boolean;
  isConfidential: boolean; // 秘匿フラグ
}

interface ConfidentialForm {
  name: string;
  empNo: string;
  type: ItemType;
  direction: string;
  date: string;
  comment: string;
}

const EMPTY_CONF_FORM: ConfidentialForm = {
  name: '', empNo: '', type: '転出（異動）', direction: '', date: '2026年7月', comment: '',
};

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

const CONFIDENTIAL_TYPES: ItemType[] = ['転出（異動）', '退職', '本部内転入', '本部外転入'];
const DEPT_FILTERS = ['全部門', '第一開発部', '第二開発部', '品質管理部', 'インフラ部'];
const DEPTS = ['第一開発部', '第二開発部', 'インフラ部', '品質管理部', '品質保証部', '地域管理部', '西日本地域部'];
const MONTHS = [
  '2026年4月', '2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月',
  '2026年10月', '2026年11月', '2026年12月', '2027年1月', '2027年2月', '2027年3月',
];

// ================================================================
// モックデータ
// ================================================================
const INIT_ITEMS: ReviewItem[] = [
  // 部長申請済み（要確認）
  { id: 'c1',  dept: '第一開発部', name: '佐藤 一郎',          empNo: 'EMP-001', type: '転出（異動）', direction: '→ 第二開発部',       date: '2026年7月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c2',  dept: '第一開発部', name: '高橋 健太',          empNo: 'EMP-007', type: '退職',         direction: '—',                    date: '2026年9月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c3',  dept: '第一開発部', name: '松本 真由美',        empNo: 'EMP-009', type: '退職',         direction: '—',                    date: '2026年8月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c4',  dept: '第一開発部', name: '田村 健一',          empNo: 'TIN-001', type: '本部外転入',   direction: '東日本システム部 →',    date: '2026年9月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c5',  dept: '第一開発部', name: 'ソフトウェアエンジニア', empNo: 'REC-001', type: '中途採用', direction: '→ 第一開発部',         date: '2026年6月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c6',  dept: '第一開発部', name: '業務委託エンジニア',  empNo: 'REC-005', type: '契約採用',   direction: '→ 第一開発部',           date: '2026年5月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c7',  dept: '第二開発部', name: '木村 誠',            empNo: 'EMP-021', type: '転出（異動）', direction: '→ 品質保証部',          date: '2026年8月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  { id: 'c8',  dept: '品質管理部', name: '林 由美子',          empNo: 'EMP-033', type: '退職',         direction: '—',                    date: '2026年7月',  status: '要確認',   isCenterAdded: false, isConfidential: false },
  // センター長が登録した秘匿情報（紫背景・ロックアイコン）
  { id: 'c9',  dept: '第一開発部', name: '伊藤 次郎',          empNo: 'TIN-008', type: '本部内転入',   direction: '品質管理部 →',         date: '2026年10月', status: 'センター長追加', isCenterAdded: true, isConfidential: true },
  { id: 'c10', dept: '第二開発部', name: '山田 美咲',          empNo: 'TIN-009', type: '本部内転入',   direction: 'インフラ部 →',         date: '2026年11月', status: 'センター長追加', isCenterAdded: true, isConfidential: true },
  // 確認済み
  { id: 'c11', dept: '第一開発部', name: '鈴木 花子',          empNo: 'TIN-003', type: '本部内転入',   direction: '品質管理部 →',         date: '2026年10月', status: '確認済み', isCenterAdded: false, isConfidential: false },
  { id: 'c12', dept: '第二開発部', name: '山田 誠',            empNo: 'TIN-004', type: '本部内転入',   direction: 'インフラ部 →',         date: '2027年1月',  status: '確認済み', isCenterAdded: false, isConfidential: false },
  { id: 'c13', dept: '第一開発部', name: '佐々木 亮',          empNo: 'TIN-005', type: '本部内転入',   direction: '地域管理部 →',         date: '2026年7月',  status: '確認済み', isCenterAdded: false, isConfidential: false },
  { id: 'c14', dept: '第一開発部', name: '新卒エンジニア（26卒）', empNo: 'REC-003', type: '新卒採用', direction: '→ 第一開発部',         date: '2027年3月',  status: '確認済み', isCenterAdded: false, isConfidential: false },
];

// ================================================================
// 秘匿情報登録モーダル
// ================================================================
function ConfidentialModal({
  onClose,
  onRegister,
}: {
  onClose: () => void;
  onRegister: (form: ConfidentialForm) => void;
}) {
  const [form, setForm] = useState<ConfidentialForm>(EMPTY_CONF_FORM);
  const needsDest = form.type === '転出（異動）' || form.type === '本部外転入' || form.type === '本部内転入';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="lock" size={20} className="text-[#7B1FA2]" />
            <span className="text-base font-medium text-on-surface">秘匿異動情報の登録</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* 秘匿警告バナー */}
        <div className="flex items-start gap-2 mx-5 mt-5 px-4 py-3 rounded-lg" style={{ backgroundColor: '#EDE7F6' }}>
          <Icon name="visibility_off" size={18} className="shrink-0 mt-0.5 text-[#7B1FA2]" />
          <div>
            <p className="text-sm font-semibold text-[#7B1FA2]">秘匿情報として登録されます</p>
            <p className="text-xs text-[#7B1FA2] mt-0.5">この情報は部長・本人には表示されません。センター長と人事のみ閲覧できます。</p>
          </div>
        </div>

        {/* フォーム */}
        <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">対象者名 <span className="text-red-500">*</span></label>
              <input
                className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-[#7B1FA2]"
                placeholder="氏名を入力"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">社員No（任意）</label>
              <input
                className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-[#7B1FA2]"
                placeholder="EMP-XXX"
                value={form.empNo}
                onChange={(e) => setForm({ ...form, empNo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">異動種別 <span className="text-red-500">*</span></label>
            <select
              className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none bg-surface appearance-none focus:border-[#7B1FA2]"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ItemType, direction: '' })}
            >
              {CONFIDENTIAL_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {needsDest && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">
                {form.type === '本部外転入' ? '異動元組織' : '異動先部署'} <span className="text-red-500">*</span>
              </label>
              {form.type === '本部外転入' ? (
                <input
                  className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none focus:border-[#7B1FA2]"
                  placeholder="組織名を入力"
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value })}
                />
              ) : (
                <select
                  className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none bg-surface appearance-none focus:border-[#7B1FA2]"
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value })}
                >
                  <option value="">— 選択してください —</option>
                  {DEPTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">異動時期 <span className="text-red-500">*</span></label>
            <select
              className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none bg-surface appearance-none focus:border-[#7B1FA2]"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            >
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">秘匿コメント</label>
            <textarea
              className="p-3 border border-outline-variant rounded text-sm text-on-surface outline-none resize-none focus:border-[#7B1FA2]"
              rows={3}
              placeholder="秘匿理由や補足を入力"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-outline shrink-0">
          <button onClick={onClose} className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">
            キャンセル
          </button>
          <button
            onClick={() => { if (form.name.trim()) onRegister(form); }}
            disabled={!form.name.trim()}
            className="text-sm font-medium text-white px-5 h-9 rounded-full disabled:opacity-40"
            style={{ backgroundColor: '#7B1FA2' }}
          >
            <span className="flex items-center gap-1.5">
              <Icon name="lock" size={16} />
              秘匿情報を登録
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// ステータスチップ
// ================================================================
function StatusChip({ status }: { status: RowStatus }) {
  const styles: Record<RowStatus, { bg: string; color: string }> = {
    '要確認':        { bg: '#E3F2FD', color: '#1976D2' },
    '確認済み':      { bg: '#E8F5E9', color: '#388E3C' },
    '差戻中':        { bg: '#FFEBEE', color: '#D32F2F' },
    'センター長追加': { bg: '#EDE7F6', color: '#7B1FA2' },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
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
let nextId = 100;

export default function CenterManagerPage() {
  const [items, setItems]     = useState<ReviewItem[]>(INIT_ITEMS);
  const [deptFilter, setDeptFilter] = useState('全部門');
  const [showModal, setShowModal]   = useState(false);

  const filtered = deptFilter === '全部門' ? items : items.filter((i) => i.dept === deptFilter);
  const pendingCount      = items.filter((i) => i.status === '要確認').length;
  const doneCount         = items.filter((i) => i.status === '確認済み').length;
  const confidentialCount = items.filter((i) => i.isConfidential).length;

  const handleApprove = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '確認済み' } : i)));

  const handleReturn = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '差戻中' } : i)));

  const handleBulkApprove = () =>
    setItems((prev) => prev.map((i) => (i.status === '要確認' ? { ...i, status: '確認済み' } : i)));

  const handleRegisterConfidential = (form: ConfidentialForm) => {
    const newItem: ReviewItem = {
      id: `conf-${nextId++}`,
      dept: '第一開発部',
      name: form.name,
      empNo: form.empNo || `CONF-${nextId}`,
      type: form.type,
      direction: form.direction || '—',
      date: form.date,
      status: 'センター長追加',
      isCenterAdded: true,
      isConfidential: true,
    };
    setItems((prev) => [...prev, newItem]);
    setShowModal(false);
  };

  return (
    <CenterPageShell>

      {showModal && (
        <ConfidentialModal
          onClose={() => setShowModal(false)}
          onRegister={handleRegisterConfidential}
        />
      )}

      <main className="flex flex-col gap-6 p-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-normal text-on-surface">異動計画 確認・修正</h1>
            <p className="text-sm text-on-surface-variant">
              開発センター 全部門の異動計画を確認
              {confidentialCount > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 text-xs text-[#7B1FA2]">
                  <Icon name="lock" size={13} />
                  秘匿情報 {confidentialCount}件
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">
              要確認 <strong>{pendingCount}</strong>件 ／ 確認済み <strong>{doneCount}</strong>件
            </span>
            {/* 秘匿登録ボタン */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 h-10 rounded-full text-sm font-medium border border-[#7B1FA2] text-[#7B1FA2] hover:bg-[#F3E5F5] transition-colors"
            >
              <Icon name="lock_add" size={18} />
              秘匿情報を追加
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={pendingCount === 0}
              className="flex items-center gap-2 px-5 h-10 rounded-full text-sm font-medium text-white disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: '#7B1FA2' }}
            >
              <Icon name="done_all" size={18} />
              一括確認を完了
            </button>
          </div>
        </div>

        {/* 部門フィルターチップ */}
        <div className="flex items-center gap-2 flex-wrap">
          {DEPT_FILTERS.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className="h-8 px-4 rounded-full text-sm font-medium transition-colors"
              style={
                deptFilter === dept
                  ? { backgroundColor: '#1976D2', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', color: '#424242', border: '1px solid #E0E0E0' }
              }
            >
              {dept}
            </button>
          ))}
        </div>

        {/* テーブル */}
        <div className="bg-surface rounded-lg overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
          {/* ヘッダー行 */}
          <div className="flex items-center h-12 px-4 gap-4 bg-surface-variant">
            <Cell w={64}><TH>部門</TH></Cell>
            <Cell w={160}><TH>氏名</TH></Cell>
            <Cell w={120}><TH>種別</TH></Cell>
            <Cell w={180}><TH>異動元 / 異動先</TH></Cell>
            <Cell w={110}><TH>月度</TH></Cell>
            <Cell flex><TH>ステータス</TH></Cell>
            <Cell w={196} center><TH>アクション</TH></Cell>
          </div>

          {/* データ行 */}
          {filtered.map((item) => {
            const ts = TYPE_STYLE[item.type];
            return (
              <div
                key={item.id}
                className="flex items-center h-14 px-4 gap-4"
                style={{
                  backgroundColor: item.isConfidential ? '#F3E5F5' : undefined,
                  borderTop: '1px solid #E0E0E0',
                }}
              >
                <Cell w={64}>
                  {item.isConfidential ? (
                    <Icon name="lock" size={18} className="text-[#7B1FA2]" />
                  ) : (
                    <span className="text-xs text-on-surface-variant">{item.dept}</span>
                  )}
                </Cell>
                <Cell w={160}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-on-surface truncate">{item.name}</span>
                    <span className="text-xs text-on-surface-variant">{item.empNo}</span>
                  </div>
                </Cell>
                <Cell w={120}>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ backgroundColor: ts.bg, color: ts.color }}
                  >
                    {item.type}
                  </span>
                </Cell>
                <Cell w={180}>
                  <span className="text-sm text-on-surface truncate">{item.direction}</span>
                </Cell>
                <Cell w={110}>
                  <span className="text-sm text-on-surface">{item.date}</span>
                </Cell>
                <Cell flex>
                  <StatusChip status={item.status} />
                </Cell>
                <Cell w={196} center>
                  {item.status === '要確認' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="text-xs font-medium text-white px-3 h-8 rounded-full"
                        style={{ backgroundColor: '#388E3C' }}
                      >
                        承認
                      </button>
                      <button
                        onClick={() => handleReturn(item.id)}
                        className="text-xs font-medium px-3 h-8 rounded-full border"
                        style={{ borderColor: '#E0E0E0', color: '#424242' }}
                      >
                        差戻
                      </button>
                    </div>
                  )}
                  {item.isConfidential && (
                    <div className="flex gap-2">
                      <button
                        className="text-xs font-medium px-3 h-8 rounded-full border"
                        style={{ borderColor: '#7B1FA2', color: '#7B1FA2' }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="text-xs font-medium px-3 h-8 rounded-full border"
                        style={{ borderColor: '#D32F2F', color: '#D32F2F' }}
                      >
                        削除
                      </button>
                    </div>
                  )}
                  {(item.status === '確認済み' || item.status === '差戻中') && !item.isConfidential && (
                    <span className="text-xs text-on-surface-variant">—</span>
                  )}
                </Cell>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-on-surface-variant">
              対象の計画がありません
            </div>
          )}

          <div className="flex items-center justify-between px-4 h-12 border-t border-outline bg-surface-variant">
            <span className="text-xs text-on-surface-variant">全 {filtered.length} 件</span>
          </div>
        </div>
      </main>
    </CenterPageShell>
  );
}
