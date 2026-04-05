'use client';
import DeptPageShell from '@/components/DeptPageShell';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

// ================================================================
// データ型 (discriminated union)
// ================================================================
interface TransferOutPlan {
  kind: 'out';
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

interface IncomingItem {
  kind: 'in';
  id: string;
  label: string;     // 氏名 or ポジション名
  subLabel: string;  // 管理No.
  itemType: string;  // 本部外転入 / 本部内転入 / 新卒採用 / 中途採用 / 契約採用
  srcDept: string;   // 異動元（採用は '—'）
  destDept: string;
  date: string;
  status: string;
  comment: string;
}

type AnyPlan = TransferOutPlan | IncomingItem;

// ================================================================
// マスタ
// ================================================================
const TRANSFER_TYPES = ['転出（異動）', '退職'];
const DEPTS = ['第一開発部', '第二開発部', 'インフラ部', '品質管理部', '品質保証部', '地域管理部', '西日本地域部'];
const MONTHS = [
  '2026年4月', '2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月',
  '2026年10月', '2026年11月', '2026年12月', '2027年1月', '2027年2月', '2027年3月',
];

const ITEM_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  '転出（異動）': { bg: '#FFF3E0', color: '#E65100' },
  '退職':         { bg: '#FFEBEE', color: '#D32F2F' },
  '本部外転入':   { bg: '#FFF3E0', color: '#E65100' },
  '本部内転入':   { bg: '#EDE7F6', color: '#6A1B9A' },
  '新卒採用':     { bg: '#E3F2FD', color: '#1976D2' },
  '中途採用':     { bg: '#E8F5E9', color: '#388E3C' },
  '契約採用':     { bg: '#FFF3E0', color: '#F57C00' },
};

// ================================================================
// モックデータ
// ================================================================
const INIT_TRANSFER_OUT: TransferOutPlan[] = [
  { kind: 'out', id: 'o1', empName: '佐藤 一郎',   empNo: 'EMP-001', currentDept: '第一開発部', destDept: '第二開発部',  transferType: '転出（異動）', date: '2026年7月', status: '承認申請中', comment: 'スキル活用のため' },
  { kind: 'out', id: 'o2', empName: '田中 花子',   empNo: 'EMP-002', currentDept: '第一開発部', destDept: '—',           transferType: '退職',         date: '2026年6月', status: '下書き保存', comment: '一身上の都合' },
  { kind: 'out', id: 'o3', empName: '鈴木 健二',   empNo: 'EMP-006', currentDept: '第一開発部', destDept: '品質管理部',   transferType: '転出（異動）', date: '2026年7月', status: '下書き保存', comment: '品質部門強化のため' },
  { kind: 'out', id: 'o4', empName: '松本 真由美', empNo: 'EMP-009', currentDept: '第一開発部', destDept: '—',           transferType: '退職',         date: '2026年8月', status: '承認申請中', comment: '産休・退職' },
  { kind: 'out', id: 'o5', empName: '渡辺 浩二',   empNo: 'EMP-008', currentDept: '第一開発部', destDept: '—',           transferType: '退職',         date: '2026年9月', status: '下書き保存', comment: '定年退職' },
  { kind: 'out', id: 'o6', empName: '加藤 裕',     empNo: 'EMP-011', currentDept: '第一開発部', destDept: 'インフラ部',   transferType: '転出（異動）', date: '2026年9月', status: '差戻中',    comment: '部門横断プロジェクト対応' },
  { kind: 'out', id: 'o7', empName: '岡田 恵',     empNo: 'EMP-015', currentDept: '第一開発部', destDept: '西日本地域部', transferType: '転出（異動）', date: '2026年9月', status: '下書き保存', comment: '地域強化施策' },
];

const INIT_INCOMING: IncomingItem[] = [
  // 転入
  { kind: 'in', id: 'i1', label: '田村 健一',           subLabel: 'TIN-001', itemType: '本部外転入', srcDept: '東日本システム部', destDept: '第一開発部', date: '2026年9月',  status: '承認申請中', comment: 'プロジェクトリード候補' },
  { kind: 'in', id: 'i2', label: '鈴木 花子',           subLabel: 'TIN-003', itemType: '本部内転入', srcDept: '品質管理部',       destDept: '第一開発部', date: '2026年10月', status: '承認待ち',  comment: '品質管理の知見を活用' },
  { kind: 'in', id: 'i3', label: '山田 誠',             subLabel: 'TIN-004', itemType: '本部内転入', srcDept: 'インフラ部',       destDept: '第二開発部', date: '2027年1月',  status: '承認待ち',  comment: 'インフラ兼務予定' },
  { kind: 'in', id: 'i4', label: '佐々木 亮',           subLabel: 'TIN-005', itemType: '本部内転入', srcDept: '地域管理部', destDept: '第一開発部', date: '2026年7月',  status: '承認済み',   comment: '異動確定' },
  // 採用（承認済み・申請中のみ掲載）
  { kind: 'in', id: 'h1', label: 'ソフトウェアエンジニア', subLabel: 'REC-001', itemType: '中途採用', srcDept: '—', destDept: '第一開発部', date: '2026年6月',  status: '承認申請中', comment: 'バックエンド経験3年以上' },
  { kind: 'in', id: 'h2', label: '新卒エンジニア（26卒）', subLabel: 'REC-003', itemType: '新卒採用', srcDept: '—', destDept: '第一開発部', date: '2027年3月',  status: '承認済み',   comment: '情報系学部卒業予定' },
  { kind: 'in', id: 'h3', label: '業務委託エンジニア',     subLabel: 'REC-005', itemType: '契約採用', srcDept: '—', destDept: '第一開発部', date: '2026年5月',  status: '承認申請中', comment: '6ヶ月契約・更新あり' },
];

// ================================================================
// 右パネル: 転出・退職 編集フォーム
// ================================================================
interface OutFormState {
  empName: string;
  transferType: string;
  destDept: string;
  date: string;
  comment: string;
}

function OutDetailPanel({
  plan,
  onClose,
}: {
  plan: TransferOutPlan;
  onClose: () => void;
}) {
  const [form, setForm] = useState<OutFormState>({
    empName: `${plan.empName}（${plan.empNo}）`,
    transferType: plan.transferType,
    destDept: plan.destDept,
    date: plan.date,
    comment: plan.comment,
  });

  return (
    <>
      <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-on-surface">転出・退職計画 編集</span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: ITEM_TYPE_STYLE[plan.transferType]?.bg, color: ITEM_TYPE_STYLE[plan.transferType]?.color }}
          >
            {plan.transferType}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-5 p-5 overflow-y-auto flex-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-on-surface-variant font-medium">対象者</label>
          <input
            className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none bg-surface-variant"
            value={form.empName} readOnly
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-on-surface-variant font-medium">異動種別</label>
          <select
            className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none bg-surface appearance-none"
            value={form.transferType}
            onChange={(e) => setForm({ ...form, transferType: e.target.value })}
          >
            {TRANSFER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {form.transferType !== '退職' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-on-surface-variant font-medium">異動先 / 部署</label>
            <select
              className="h-10 px-3 border border-primary rounded text-sm text-on-surface outline-none bg-[#E3F2FD] appearance-none"
              value={form.destDept}
              onChange={(e) => setForm({ ...form, destDept: e.target.value })}
            >
              {DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-on-surface-variant font-medium">異動時期</label>
          <select
            className="h-10 px-3 border border-outline-variant rounded text-sm text-on-surface outline-none bg-surface appearance-none"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          >
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-on-surface-variant font-medium">コメント・備考</label>
          <textarea
            className="p-3 border border-outline-variant rounded text-sm text-on-surface outline-none resize-none"
            rows={3}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-outline shrink-0">
        <button onClick={onClose} className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">キャンセル</button>
        <button className="text-sm font-medium text-primary px-4 h-9 rounded-full border border-primary hover:bg-primary-container">下書き保存</button>
        <button className="text-sm font-medium text-on-primary px-4 h-9 rounded-full" style={{ backgroundColor: '#1976D2' }}>承認申請</button>
      </div>
    </>
  );
}

// ================================================================
// 右パネル: 転入・採用 詳細（読み取り専用）
// ================================================================
function InDetailPanel({ plan, onClose }: { plan: IncomingItem; onClose: () => void }) {
  const style = ITEM_TYPE_STYLE[plan.itemType] ?? { bg: '#F5F5F5', color: '#757575' };
  const isTransferIn = plan.itemType.includes('転入');
  return (
    <>
      <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-on-surface">
            {isTransferIn ? '転入情報 詳細' : '採用計画 詳細'}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: style.bg, color: style.color }}>
            {plan.itemType}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-0 p-5 overflow-y-auto flex-1">
        <div className="flex flex-col divide-y divide-outline">
          <InfoRow label={isTransferIn ? '転入者名' : 'ポジション / 職種'} value={plan.label || '未定'} />
          <InfoRow label="管理No." value={plan.subLabel} />
          {plan.srcDept !== '—' && <InfoRow label="異動元組織" value={plan.srcDept} />}
          <InfoRow label="配属先部署" value={plan.destDept} />
          <InfoRow label={isTransferIn ? '転入予定時期' : '採用予定時期'} value={plan.date} />
          <div className="flex items-center gap-3 py-3.5">
            <span className="text-[13px] text-on-surface-variant w-32 shrink-0">ステータス</span>
            <StatusBadge status={plan.status} />
          </div>
          {plan.comment && <InfoRow label="コメント" value={plan.comment} />}
        </div>

        <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-variant text-[12px] text-on-surface-variant">
          <Icon name="info" size={15} />
          <span>編集は「転入・採用計画」ページから行えます</span>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="text-[13px] text-on-surface-variant w-32 shrink-0">{label}</span>
      <span className="text-sm text-on-surface">{value}</span>
    </div>
  );
}

// ================================================================
// 左パネルカード
// ================================================================
function OutCard({ plan, active, onClick }: { plan: TransferOutPlan; active: boolean; onClick: () => void }) {
  const ts = ITEM_TYPE_STYLE[plan.transferType];
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface rounded-lg p-4 flex flex-col gap-2.5 shrink-0 transition-shadow"
      style={{ border: active ? '2px solid #1976D2' : '1px solid #E0E0E0' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-on-surface">{plan.empName}</span>
          <span className="ml-2 text-xs text-on-surface-variant">{plan.empNo}</span>
        </div>
        <StatusBadge status={plan.status} />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-outline flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: ts?.bg, color: ts?.color }}>{plan.transferType}</span>
        {plan.destDept !== '—' && (
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Icon name="arrow_forward" size={12} />{plan.destDept}
          </span>
        )}
        <span className="text-xs text-on-surface-variant ml-auto">{plan.date}</span>
      </div>
    </button>
  );
}

function InCard({ plan, active, onClick }: { plan: IncomingItem; active: boolean; onClick: () => void }) {
  const ts = ITEM_TYPE_STYLE[plan.itemType];
  const isTransferIn = plan.itemType.includes('転入');
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface rounded-lg p-4 flex flex-col gap-2.5 shrink-0 transition-shadow"
      style={{ border: active ? '2px solid #0288D1' : '1px solid #E0E0E0' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-on-surface">{plan.label || <span className="italic text-on-surface-variant">未定</span>}</span>
          <span className="ml-2 text-xs text-on-surface-variant">{plan.subLabel}</span>
        </div>
        <StatusBadge status={plan.status} />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-outline flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: ts?.bg, color: ts?.color }}>{plan.itemType}</span>
        {isTransferIn && plan.srcDept !== '—' && (
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            {plan.srcDept}<Icon name="arrow_forward" size={12} />{plan.destDept}
          </span>
        )}
        {!isTransferIn && (
          <span className="text-xs text-on-surface-variant">{plan.destDept}</span>
        )}
        <span className="text-xs text-on-surface-variant ml-auto">{plan.date}</span>
      </div>
    </button>
  );
}

// ================================================================
// メインページ
// ================================================================
type FilterKey = 'all' | 'out' | 'in';

export default function TransferPlansPage() {
  const [transferOuts] = useState<TransferOutPlan[]>(INIT_TRANSFER_OUT);
  const [incoming] = useState<IncomingItem[]>(INIT_INCOMING);
  const [selected, setSelected] = useState<AnyPlan | null>(INIT_TRANSFER_OUT[0]);
  const [filter, setFilter] = useState<FilterKey>('all');

  const allPlans: AnyPlan[] = [...transferOuts, ...incoming].sort((a, b) => a.date.localeCompare(b.date));

  const filtered = allPlans.filter((p) => {
    if (filter === 'out') return p.kind === 'out';
    if (filter === 'in') return p.kind === 'in';
    return true;
  });

  const outCount = allPlans.filter((p) => p.kind === 'out').length;
  const inCount  = allPlans.filter((p) => p.kind === 'in').length;

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: `全て（${allPlans.length}）` },
    { key: 'out', label: `転出・退職（${outCount}）` },
    { key: 'in',  label: `転入・採用（${inCount}）` },
  ];

  return (
    <DeptPageShell>

      <main
        className="flex gap-6 p-6"
      >
        {/* ── 左パネル ── */}
        <div className="flex flex-col gap-3 w-[360px] shrink-0">
          {/* ヘッダー */}
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-xl font-medium text-on-surface">異動計画 一覧</h2>
          </div>

          {/* フィルター */}
          <div className="flex gap-1 bg-surface-variant rounded-lg p-1 shrink-0">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex-1 h-7 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                style={filter === key
                  ? { backgroundColor: '#FFFFFF', color: '#1976D2', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                  : { color: '#757575' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* リスト */}
          <div className="flex flex-col gap-2 pr-0.5">
            {filtered.map((plan) =>
              plan.kind === 'out' ? (
                <OutCard key={plan.id} plan={plan} active={selected?.id === plan.id} onClick={() => setSelected(plan)} />
              ) : (
                <InCard key={plan.id} plan={plan} active={selected?.id === plan.id} onClick={() => setSelected(plan)} />
              )
            )}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-on-surface-variant">
                <Icon name="search_off" size={40} />
                <p className="text-sm">計画がありません</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 右パネル ── */}
        <div className="flex-1 bg-surface border border-outline rounded-lg flex flex-col">
          {!selected && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-on-surface-variant">
              <Icon name="list_alt" size={48} />
              <p className="text-sm">左のリストから計画を選択してください</p>
            </div>
          )}

          {selected?.kind === 'out' && (
            <OutDetailPanel plan={selected} onClose={() => setSelected(null)} />
          )}

          {selected?.kind === 'in' && (
            <InDetailPanel plan={selected} onClose={() => setSelected(null)} />
          )}
        </div>
      </main>
    </DeptPageShell>
  );
}
