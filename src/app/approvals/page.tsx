'use client';
import DeptPageShell from '@/components/DeptPageShell';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';
import Icon from '@/components/Icon';

// ================================================================
// データ型
// ================================================================
type ApprovalCategory = '転出（異動）' | '退職' | '本部外転入' | '本部内転入' | '新卒採用' | '中途採用' | '契約採用';
type ApprovalStatus = '承認申請中' | '承認待ち' | '承認済み' | '差戻中';

interface ApprovalItem {
  id: string;
  category: ApprovalCategory;
  label: string;
  subLabel: string;
  detail: string;
  targetDate: string;
  submittedDate: string;
  submittedBy: string;
  status: ApprovalStatus;
  comment: string;
  completedSteps: number;   // 完了済みステップ数 (0–4)
  returnedAt?: number;      // 差戻されたステップのインデックス
  returnReason?: string;
}

// ================================================================
// マスタ
// ================================================================
const CATEGORY_STYLE: Record<ApprovalCategory, { bg: string; color: string }> = {
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
const INIT_ITEMS: ApprovalItem[] = [
  // 転出・退職
  {
    id: 'a1', category: '転出（異動）', label: '佐藤 一郎', subLabel: 'EMP-001',
    detail: '第一開発部 → 第二開発部', targetDate: '2026年7月',
    submittedDate: '2026年3月1日', submittedBy: '田中 太郎',
    status: '承認申請中', comment: 'スキル活用のため',
    completedSteps: 1,
  },
  {
    id: 'a2', category: '退職', label: '松本 真由美', subLabel: 'EMP-009',
    detail: '退職', targetDate: '2026年8月',
    submittedDate: '2026年3月5日', submittedBy: '田中 太郎',
    status: '承認申請中', comment: '産休・退職',
    completedSteps: 1,
  },
  {
    id: 'a3', category: '転出（異動）', label: '加藤 裕', subLabel: 'EMP-011',
    detail: '第一開発部 → インフラ部', targetDate: '2026年9月',
    submittedDate: '2026年2月20日', submittedBy: '田中 太郎',
    status: '差戻中', comment: '部門横断プロジェクト対応',
    completedSteps: 2, returnedAt: 2,
    returnReason: '異動時期を再検討してください。Q3のリソース不足が懸念されます。',
  },
  // 転入
  {
    id: 'a4', category: '本部外転入', label: '田村 健一', subLabel: 'TIN-001',
    detail: '東日本システム部 → 第一開発部', targetDate: '2026年9月',
    submittedDate: '2026年3月3日', submittedBy: '田中 太郎',
    status: '承認申請中', comment: 'プロジェクトリード候補',
    completedSteps: 1,
  },
  {
    id: 'a5', category: '本部内転入', label: '鈴木 花子', subLabel: 'TIN-003',
    detail: '品質管理部 → 第一開発部', targetDate: '2026年10月',
    submittedDate: '2026年2月25日', submittedBy: '品質管理部長',
    status: '承認待ち', comment: '品質管理の知見を活用',
    completedSteps: 2,
  },
  {
    id: 'a6', category: '本部内転入', label: '山田 誠', subLabel: 'TIN-004',
    detail: 'インフラ部 → 第二開発部', targetDate: '2027年1月',
    submittedDate: '2026年3月1日', submittedBy: 'インフラ部長',
    status: '承認待ち', comment: 'インフラ兼務予定',
    completedSteps: 2,
  },
  {
    id: 'a7', category: '本部内転入', label: '佐々木 亮', subLabel: 'TIN-005',
    detail: '地域管理部 → 第一開発部', targetDate: '2026年7月',
    submittedDate: '2026年2月10日', submittedBy: '地域管理部長',
    status: '承認済み', comment: '異動確定',
    completedSteps: 4,
  },
  // 採用
  {
    id: 'a8', category: '中途採用', label: 'ソフトウェアエンジニア', subLabel: 'REC-001',
    detail: 'バックエンドエンジニア', targetDate: '2026年6月',
    submittedDate: '2026年3月2日', submittedBy: '田中 太郎',
    status: '承認申請中', comment: 'バックエンド経験3年以上',
    completedSteps: 1,
  },
  {
    id: 'a9', category: '新卒採用', label: '新卒エンジニア（26卒）', subLabel: 'REC-003',
    detail: '情報系学部卒', targetDate: '2027年3月',
    submittedDate: '2026年1月15日', submittedBy: '田中 太郎',
    status: '承認済み', comment: '情報系学部卒業予定',
    completedSteps: 4,
  },
  {
    id: 'a10', category: '契約採用', label: '業務委託エンジニア', subLabel: 'REC-005',
    detail: '6ヶ月契約・更新あり', targetDate: '2026年5月',
    submittedDate: '2026年3月10日', submittedBy: '田中 太郎',
    status: '承認申請中', comment: '6ヶ月契約・更新あり',
    completedSteps: 1,
  },
];

// ================================================================
// 承認フロー ステッパー
// ================================================================
function ApprovalStepper({ completedSteps, returnedAt }: { completedSteps: number; returnedAt?: number }) {
  const isReturned = returnedAt !== undefined;

  return (
    <div className="flex items-center px-8 py-4 border-b border-outline bg-[#FAFAFA] shrink-0">
      {FLOW_STEPS.map((label, index) => {
        const done      = index < completedSteps && !(isReturned && index >= returnedAt!);
        const returned  = isReturned && index === returnedAt;
        const active    = !isReturned && index === completedSteps;
        const pending   = !done && !returned && !active;

        // 右側のコネクターライン
        const lineGreen = index < completedSteps - 1 && !(isReturned && index >= returnedAt!);
        const lineRed   = isReturned && index === returnedAt!;

        const circleStyle = done     ? { bg: '#388E3C', color: '#fff' }
                          : active   ? { bg: '#1976D2', color: '#fff' }
                          : returned ? { bg: '#D32F2F', color: '#fff' }
                          :            { bg: '#E0E0E0', color: '#9E9E9E' };

        const labelColor  = done     ? '#388E3C'
                          : active   ? '#1976D2'
                          : returned ? '#D32F2F'
                          :            '#9E9E9E';

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* ステップ */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: circleStyle.bg }}
              >
                {done ? (
                  <Icon name="check" size={18} className="text-white" />
                ) : returned ? (
                  <Icon name="close" size={18} className="text-white" />
                ) : (
                  <span className="text-sm font-bold" style={{ color: circleStyle.color }}>
                    {index + 1}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: labelColor }}>
                {label}
              </span>
            </div>

            {/* コネクターライン（最後のステップの後は不要）*/}
            {index < FLOW_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-5"
                style={{
                  backgroundColor: lineGreen ? '#388E3C' : lineRed ? '#D32F2F' : '#E0E0E0',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// 右パネル: 詳細 + アクション
// ================================================================
function DetailPanel({
  item,
  onClose,
  onApprove,
  onReturn,
}: {
  item: ApprovalItem;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReturn: (id: string, reason: string) => void;
}) {
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const cs = CATEGORY_STYLE[item.category];

  const isActionable = item.status === '承認待ち';
  const isReturned   = item.status === '差戻中';

  return (
    <>
      {/* パネルヘッダー */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-on-surface">申請詳細</span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: cs.bg, color: cs.color }}
          >
            {item.category}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
          <Icon name="close" size={24} />
        </button>
      </div>

      {/* 承認フロー ステッパー */}
      <ApprovalStepper completedSteps={item.completedSteps} returnedAt={item.returnedAt} />

      {/* コンテンツ */}
      <div className="flex flex-col gap-0 p-5">
        {/* 差戻理由バナー */}
        {isReturned && item.returnReason && (
          <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-lg bg-[#FFEBEE] text-[#D32F2F]">
            <Icon name="cancel" size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold mb-1">差戻理由</p>
              <p className="text-sm">{item.returnReason}</p>
            </div>
          </div>
        )}

        {/* 詳細テーブル */}
        <div className="flex flex-col divide-y divide-outline">
          <InfoRow label="対象者 / ポジション" value={item.label} />
          <InfoRow label="管理No." value={item.subLabel} />
          <InfoRow label="内容" value={item.detail} />
          <InfoRow label="予定時期" value={item.targetDate} />
          <InfoRow label="申請日" value={item.submittedDate} />
          <InfoRow label="申請者" value={item.submittedBy} />
          <div className="flex items-center gap-3 py-3.5">
            <span className="text-[13px] text-on-surface-variant w-36 shrink-0">ステータス</span>
            <StatusBadge status={item.status} />
          </div>
          {item.comment && <InfoRow label="コメント" value={item.comment} />}
        </div>

        {/* 承認待ち → アクションフォーム */}
        {isActionable && (
          <div className="mt-6">
            {showReturnForm ? (
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-medium text-on-surface-variant">差戻理由</label>
                <textarea
                  className="p-3 border border-outline-variant rounded text-sm text-on-surface outline-none resize-none focus:border-primary"
                  rows={3}
                  placeholder="差戻理由を入力してください"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowReturnForm(false); setReturnReason(''); }}
                    className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => { if (returnReason.trim()) { onReturn(item.id, returnReason); setShowReturnForm(false); } }}
                    disabled={!returnReason.trim()}
                    className="text-sm font-medium text-on-primary px-4 h-9 rounded-full disabled:opacity-40"
                    style={{ backgroundColor: '#D32F2F' }}
                  >
                    差し戻す
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReturnForm(true)}
                  className="text-sm font-medium px-4 h-9 rounded-full border hover:bg-surface-variant"
                  style={{ borderColor: '#D32F2F', color: '#D32F2F' }}
                >
                  差し戻す
                </button>
                <button
                  onClick={() => onApprove(item.id)}
                  className="text-sm font-medium text-on-primary px-4 h-9 rounded-full"
                  style={{ backgroundColor: '#1976D2' }}
                >
                  承認する
                </button>
              </div>
            )}
          </div>
        )}

        {/* 差戻中 → 再申請ガイド */}
        {isReturned && (
          <div className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-variant text-[12px] text-on-surface-variant">
            <Icon name="info" size={15} />
            <span>内容を修正して「異動計画詳細」または「転入・採用計画」ページから再申請してください</span>
          </div>
        )}
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="text-[13px] text-on-surface-variant w-36 shrink-0">{label}</span>
      <span className="text-sm text-on-surface">{value}</span>
    </div>
  );
}

// ================================================================
// 左パネルカード
// ================================================================
function ApprovalCard({
  item,
  active,
  onClick,
}: {
  item: ApprovalItem;
  active: boolean;
  onClick: () => void;
}) {
  const cs = CATEGORY_STYLE[item.category];
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface rounded-lg p-4 flex flex-col gap-2.5 shrink-0 transition-shadow"
      style={{ border: active ? '2px solid #1976D2' : '1px solid #E0E0E0' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium text-on-surface truncate">{item.label}</span>
          <span className="text-xs text-on-surface-variant">{item.subLabel}</span>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-outline flex-wrap">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0"
          style={{ backgroundColor: cs.bg, color: cs.color }}
        >
          {item.category}
        </span>
        <span className="text-xs text-on-surface-variant truncate flex-1">{item.detail}</span>
        <span className="text-xs text-on-surface-variant shrink-0">{item.targetDate}</span>
      </div>
    </button>
  );
}

// ================================================================
// メインページ
// ================================================================
type FilterKey = 'all' | 'action' | 'pending' | 'approved';

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(INIT_ITEMS);
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');

  const actionCount   = items.filter((i) => i.status === '承認待ち' || i.status === '差戻中').length;
  const pendingCount  = items.filter((i) => i.status === '承認申請中').length;
  const approvedCount = items.filter((i) => i.status === '承認済み').length;

  const filtered = items.filter((i) => {
    if (filter === 'action')   return i.status === '承認待ち' || i.status === '差戻中';
    if (filter === 'pending')  return i.status === '承認申請中';
    if (filter === 'approved') return i.status === '承認済み';
    return true;
  });

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all',      label: `全て（${items.length}）` },
    { key: 'action',   label: `要対応（${actionCount}）` },
    { key: 'pending',  label: `申請中（${pendingCount}）` },
    { key: 'approved', label: `承認済み（${approvedCount}）` },
  ];

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: '承認済み', completedSteps: 4 } : i))
    );
    setSelected((prev) =>
      prev?.id === id ? { ...prev, status: '承認済み', completedSteps: 4 } : prev
    );
  };

  const handleReturn = (id: string, reason: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: '差戻中', returnReason: reason, returnedAt: i.completedSteps }
          : i
      )
    );
    setSelected((prev) =>
      prev?.id === id
        ? { ...prev, status: '差戻中', returnReason: reason, returnedAt: prev.completedSteps }
        : prev
    );
  };

  return (
    <DeptPageShell>

      <main
        className="flex gap-6 p-6"
      >
        {/* ── 左パネル ── */}
        <div className="flex flex-col gap-3 w-[360px] shrink-0">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-xl font-medium text-on-surface">承認状況</h2>
          </div>

          {/* サマリーメトリクス */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <MetricCard label="要対応" count={actionCount}   color="#D32F2F" bg="#FFEBEE" />
            <MetricCard label="申請中" count={pendingCount}  color="#1976D2" bg="#E3F2FD" />
            <MetricCard label="承認済み" count={approvedCount} color="#388E3C" bg="#E8F5E9" />
          </div>

          {/* フィルター */}
          <div className="flex gap-1 bg-surface-variant rounded-lg p-1 shrink-0">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex-1 h-7 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                style={
                  filter === key
                    ? { backgroundColor: '#FFFFFF', color: '#1976D2', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                    : { color: '#757575' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* リスト */}
          <div className="flex flex-col gap-2 pr-0.5">
            {filtered.map((item) => (
              <ApprovalCard
                key={item.id}
                item={item}
                active={selected?.id === item.id}
                onClick={() => setSelected(item)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-on-surface-variant">
                <Icon name="check_circle" size={40} />
                <p className="text-sm">対象の申請はありません</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 右パネル ── */}
        <div className="flex-1 bg-surface border border-outline rounded-lg flex flex-col">
          {!selected ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-on-surface-variant">
              <Icon name="approval" size={48} />
              <p className="text-sm">左のリストから申請を選択してください</p>
            </div>
          ) : (
            <DetailPanel
              key={selected.id}
              item={selected}
              onClose={() => setSelected(null)}
              onApprove={handleApprove}
              onReturn={handleReturn}
            />
          )}
        </div>
      </main>
    </DeptPageShell>
  );
}

function MetricCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg" style={{ backgroundColor: bg }}>
      <span className="text-2xl font-bold" style={{ color }}>{count}</span>
      <span className="text-[11px] font-medium" style={{ color }}>{label}</span>
    </div>
  );
}
