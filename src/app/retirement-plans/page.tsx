'use client';
import DeptPageShell from '@/components/DeptPageShell';
import StatusBadge from '@/components/StatusBadge';
import { useState, useEffect } from 'react';
import { usePlanDeltas, getFiscalYear } from '@/contexts/PlanDeltaContext';

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

const DEPT_LIST = ['第一開発部', '第二開発部', 'インフラ部', '品質管理部', '品質保証部', '地域管理部', '西日本地域部'];
const OWN_DEPT = '第一開発部'; // 部長画面：自部署固定

// サマリ用：転出・退職メンバーデータ（members/page.tsxと同じデータソース）
const OUTGOING_MEMBERS = [
  { rank: '主任',   transferType: '転出（異動）', transferDate: '2026年7月' },
  { rank: '一般',   transferType: '退職',         transferDate: '2026年6月' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '主任',   transferType: '',             transferDate: '' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '主任',   transferType: '転出（異動）', transferDate: '2026年7月' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '課長',   transferType: '退職',         transferDate: '2026年9月' },
  { rank: '一般',   transferType: '退職',         transferDate: '2026年8月' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '主任',   transferType: '転出（異動）', transferDate: '2026年9月' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '一般',   transferType: '',             transferDate: '' },
  { rank: '副主任', transferType: '転出（異動）', transferDate: '2026年9月' },
];

const MONTHS = [
  '2026年4月', '2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月',
  '2026年10月', '2026年11月', '2026年12月', '2027年1月', '2027年2月', '2027年3月',
];

const NEXT_FY_MONTHS = new Set(MONTHS);

// ================================================================
// 採用計画
// ================================================================
interface HiringPlan {
  id: string;
  no: string;
  position: string;
  dept: string;
  type: '新卒' | '中途' | '契約';
  count: number;
  targetDate: string;
  status: string;
  note: string;
}

type HiringForm = Omit<HiringPlan, 'id' | 'no' | 'status'>;

const HIRE_TYPES: Array<HiringPlan['type']> = ['新卒', '中途', '契約'];

const HIRE_STYLE: Record<string, { bg: string; color: string }> = {
  新卒: { bg: '#E3F2FD', color: '#1976D2' },
  中途: { bg: '#E8F5E9', color: '#388E3C' },
  契約: { bg: '#FFF3E0', color: '#F57C00' },
};

const EMPTY_HIRING: HiringForm = { position: '', dept: OWN_DEPT, type: '中途', count: 1, targetDate: '2026年4月', note: '' };

const INIT_HIRING: HiringPlan[] = [
  { id: '1', no: 'REC-001', position: 'ソフトウェアエンジニア', dept: '第一開発部', type: '中途', count: 2, targetDate: '2026年6月', status: '承認申請中', note: 'バックエンド経験3年以上' },
  { id: '2', no: 'REC-002', position: 'インフラエンジニア',     dept: '第二開発部', type: '中途', count: 1, targetDate: '2026年7月', status: '下書き保存', note: 'クラウド経験必須' },
  { id: '3', no: 'REC-003', position: '新卒エンジニア（26卒）', dept: '第一開発部', type: '新卒', count: 3, targetDate: '2027年3月', status: '承認済み',   note: '情報系学部卒業予定' },
  { id: '4', no: 'REC-004', position: '品質管理スタッフ',       dept: '品質管理部', type: '中途', count: 1, targetDate: '2026年8月', status: '下書き保存', note: 'QA経験者優遇' },
  { id: '5', no: 'REC-005', position: '業務委託エンジニア',     dept: '第一開発部', type: '契約', count: 2, targetDate: '2026年5月', status: '承認申請中', note: '6ヶ月契約・更新あり' },
];

function HiringModal({ plan, onClose, onSave }: {
  plan: HiringForm | null;
  onClose: () => void;
  onSave: (form: HiringForm) => void;
}) {
  const [form, setForm] = useState<HiringForm>(plan ?? EMPTY_HIRING);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
          <span className="text-base font-medium text-on-surface">{plan ? '採用計画 編集' : '採用計画 新規作成'}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          <Field label="ポジション / 職種">
            <input className="input-base" placeholder="例: ソフトウェアエンジニア" value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </Field>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="配属部署">
                <div className="input-base flex items-center" style={{ backgroundColor: '#F5F5F5' }}>{OWN_DEPT}</div>
              </Field>
            </div>
            <div className="w-28">
              <Field label="採用人数">
                <input type="number" min={1} className="input-base" value={form.count}
                  onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
          <Field label="採用種別">
            <div className="flex gap-2">
              {HIRE_TYPES.map((t) => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  className="flex-1 h-9 rounded-lg text-sm font-medium border transition-colors"
                  style={form.type === t
                    ? { backgroundColor: HIRE_STYLE[t].color, color: '#fff', borderColor: HIRE_STYLE[t].color }
                    : { backgroundColor: '#fff', color: '#757575', borderColor: '#E0E0E0' }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="採用予定時期">
            <select className="select-base" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="備考・条件">
            <textarea className="input-base resize-none" rows={2} placeholder="必要なスキルや経験、条件など"
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-outline shrink-0">
          <button onClick={onClose} className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">キャンセル</button>
          <button onClick={() => onSave(form)} className="text-sm font-medium text-primary px-4 h-9 rounded-full border border-primary hover:bg-primary-container">下書き保存</button>
          <button onClick={() => onSave(form)} className="text-sm font-medium text-on-primary px-4 h-9 rounded-full" style={{ backgroundColor: '#1976D2' }}>承認申請</button>
        </div>
      </div>
    </div>
  );
}

function HiringSection() {
  const [plans, setPlans] = useState<HiringPlan[]>(INIT_HIRING);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HiringPlan | null>(null);
  const [search, setSearch] = useState('');

  // サマリへデルタ発行（採用 = プラス）
  const { setSourceDeltas } = usePlanDeltas();
  useEffect(() => {
    const deltas: Record<string, [number, number, number]> = {};
    for (const p of plans) {
      const fy = getFiscalYear(p.targetDate);
      if (!fy) continue;
      if (!deltas[fy]) deltas[fy] = [0, 0, 0];
      // 契約 → 非正規(2)、それ以外 → 一般正社員(1)
      const catIdx = p.type === '契約' ? 2 : 1;
      deltas[fy][catIdx] += p.count;
    }
    setSourceDeltas('hiring', deltas);
  }, [plans, setSourceDeltas]);

  const filtered = plans.filter((p) => p.position.includes(search) || p.dept.includes(search) || p.no.includes(search));
  const fyPlans = plans.filter((p) => NEXT_FY_MONTHS.has(p.targetDate));
  const total    = fyPlans.reduce((s, p) => s + p.count, 0);
  const newGrad  = fyPlans.filter((p) => p.type === '新卒').reduce((s, p) => s + p.count, 0);
  const mid      = fyPlans.filter((p) => p.type === '中途').reduce((s, p) => s + p.count, 0);
  const contract = fyPlans.filter((p) => p.type === '契約').reduce((s, p) => s + p.count, 0);

  const save = (form: HiringForm) => {
    if (editTarget) {
      setPlans((prev) => prev.map((p) => p.id === editTarget.id ? { ...p, ...form } : p));
    } else {
      setPlans((prev) => [...prev, { ...form, id: String(Date.now()), no: `REC-${String(prev.length + 1).padStart(3, '0')}`, status: '下書き保存' }]);
    }
    setModalOpen(false); setEditTarget(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '採用予定（合計）', value: `${total}名`,    color: '#212121', sub: false },
          { label: '新卒採用',         value: `${newGrad}名`,  color: '#1976D2', sub: true },
          { label: '中途採用',         value: `${mid}名`,      color: '#388E3C', sub: true },
          { label: '契約・業務委託',   value: `${contract}名`, color: '#F57C00', sub: true },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-outline rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[13px] text-on-surface-variant">{m.label}</span>
            <span className="text-[26px] font-medium leading-none" style={{ color: m.color }}>{m.value}</span>
            {m.sub && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 11 }}>calendar_today</span>
                <span className="text-[11px] text-on-surface-variant">〜 2027年3月末</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline rounded-lg flex flex-col overflow-hidden" style={{ maxHeight: 400 }}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-outline shrink-0">
          <div className="flex items-center gap-2 bg-surface-variant rounded px-3 h-8 w-64">
            <Icon name="search" size={16} className="text-on-surface-variant" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-on-surface-variant"
              placeholder="ポジション・部署で検索..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-on-surface-variant">{filtered.length}件</span>
            <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 text-sm font-medium text-on-primary px-4 h-8 rounded-full"
              style={{ backgroundColor: '#1976D2' }}>
              <Icon name="add" size={16} className="text-on-primary" />新規作成
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <div className="flex items-center bg-surface-variant px-4 h-10 sticky top-0 z-10 min-w-[760px]">
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">採用No.</div>
            <div className="flex-1 text-xs font-medium text-on-surface-variant min-w-[140px]">ポジション / 職種</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">配属部署</div>
            <div className="w-20 text-xs font-medium text-on-surface-variant shrink-0">種別</div>
            <div className="w-14 text-xs font-medium text-on-surface-variant text-center shrink-0">人数</div>
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">採用時期</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">ステータス</div>
            <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">備考</div>
            <div className="w-16 text-xs font-medium text-on-surface-variant text-center shrink-0">操作</div>
          </div>
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center px-4 h-[48px] border-b border-outline last:border-b-0 hover:bg-[#F8F9FF] min-w-[760px]">
              <div className="w-24 text-sm text-on-surface-variant shrink-0">{p.no}</div>
              <div className="flex-1 text-sm font-medium text-on-surface min-w-[140px] truncate pr-2">{p.position}</div>
              <div className="w-28 text-sm text-on-surface-variant shrink-0">{p.dept}</div>
              <div className="w-20 shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: HIRE_STYLE[p.type].bg, color: HIRE_STYLE[p.type].color }}>{p.type}</span>
              </div>
              <div className="w-14 text-sm text-center font-medium shrink-0">{p.count}名</div>
              <div className="w-24 text-sm text-on-surface-variant shrink-0">{p.targetDate}</div>
              <div className="w-28 shrink-0"><StatusBadge status={p.status} /></div>
              <div className="w-32 text-sm text-on-surface-variant shrink-0 truncate pr-2">{p.note || '—'}</div>
              <div className="w-16 flex items-center justify-center gap-1 shrink-0">
                <button onClick={() => { setEditTarget(p); setModalOpen(true); }} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant" title="編集"><Icon name="edit" size={16} /></button>
                <button onClick={() => setPlans((prev) => prev.filter((x) => x.id !== p.id))} className="p-1 rounded hover:bg-error-container text-on-surface-variant hover:text-error" title="削除"><Icon name="delete" size={16} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
              <Icon name="search_off" size={36} /><p className="text-sm">該当する採用計画が見つかりません</p>
            </div>
          )}
        </div>
        <div className="flex items-center px-4 h-9 border-t border-outline shrink-0">
          <span className="text-[12px] text-on-surface-variant">{filtered.length}件表示 / 全{plans.length}件</span>
        </div>
      </div>

      {modalOpen && (
        <HiringModal
          plan={editTarget ? { position: editTarget.position, dept: editTarget.dept, type: editTarget.type, count: editTarget.count, targetDate: editTarget.targetDate, note: editTarget.note } : null}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

// ================================================================
// 転入情報
// ================================================================
interface TransferIn {
  id: string;
  no: string;
  name: string;
  sourceOrg: string;
  sourceType: '本部外' | '本部内';
  destDept: string;
  targetDate: string;
  status: string;
  comment: string;
  isInbound: boolean; // true = 他部署起案・承認依頼
}

interface TransferInForm {
  name: string;
  sourceOrg: string;
  destDept: string;
  targetDate: string;
  comment: string;
}

const SOURCE_STYLE: Record<string, { bg: string; color: string }> = {
  '本部外': { bg: '#FFF3E0', color: '#E65100' },
  '本部内': { bg: '#EDE7F6', color: '#6A1B9A' },
};

const EMPTY_TI_FORM: TransferInForm = { name: '', sourceOrg: '', destDept: OWN_DEPT, targetDate: '2026年4月', comment: '' };

const INIT_TRANSFER_INS: TransferIn[] = [
  // 自部署起案（本部外）
  { id: 't1', no: 'TIN-001', name: '田村 健一', sourceOrg: '東日本システム部', sourceType: '本部外', destDept: '第一開発部', targetDate: '2026年9月',  status: '承認申請中', comment: 'プロジェクトリード候補',  isInbound: false },
  { id: 't2', no: 'TIN-002', name: '',          sourceOrg: 'XX事業部',         sourceType: '本部外', destDept: '第二開発部', targetDate: '2026年11月', status: '下書き保存', comment: '人選調整中',           isInbound: false },
  // 他部署起案・承認依頼（本部内）
  { id: 't3', no: 'TIN-003', name: '鈴木 花子', sourceOrg: '品質管理部',       sourceType: '本部内', destDept: '第一開発部', targetDate: '2026年10月', status: '承認待ち',  comment: '品質管理の知見を活用', isInbound: true },
  { id: 't4', no: 'TIN-004', name: '山田 誠',   sourceOrg: 'インフラ部',       sourceType: '本部内', destDept: '第二開発部', targetDate: '2027年1月',  status: '承認待ち',  comment: 'インフラ兼務予定',    isInbound: true },
  { id: 't5', no: 'TIN-005', name: '佐々木 亮', sourceOrg: '地域管理部',       sourceType: '本部内', destDept: '第一開発部', targetDate: '2026年7月',  status: '承認済み',  comment: '異動確定',            isInbound: true },
];

function TransferInModal({ form: init, onClose, onSave }: {
  form: TransferInForm;
  onClose: () => void;
  onSave: (form: TransferInForm) => void;
}) {
  const [form, setForm] = useState<TransferInForm>(init);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
          <span className="text-base font-medium text-on-surface">転入情報 登録</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" size={20} />
          </button>
        </div>
        {/* 本部外のみ注記 */}
        <div className="flex items-center gap-2 mx-5 mt-4 px-3 py-2 rounded-md bg-[#FFF8E1] border border-[#FFE082]">
          <span className="material-symbols-rounded text-[#F57C00]" style={{ fontSize: 16 }}>info</span>
          <span className="text-xs text-[#E65100]">ここから登録できるのは<strong>本部外</strong>からの転入のみです。本部内転入は異動元部署の申請を承認することで反映されます。</span>
        </div>
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          <Field label="転入者名（未定の場合は空欄）">
            <input className="input-base" placeholder="例: 田村 健一" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="異動元組織 *">
            <input className="input-base" placeholder="例: 東日本システム部" value={form.sourceOrg}
              onChange={(e) => setForm({ ...form, sourceOrg: e.target.value })} />
          </Field>
          <Field label="配属先部署">
            <div className="input-base flex items-center" style={{ backgroundColor: '#F5F5F5' }}>{OWN_DEPT}</div>
          </Field>
          <Field label="転入予定時期">
            <select className="select-base" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="コメント・備考">
            <textarea className="input-base resize-none" rows={2} placeholder="転入の背景や備考など"
              value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-outline shrink-0">
          <button onClick={onClose} className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">キャンセル</button>
          <button onClick={() => onSave(form)} className="text-sm font-medium text-primary px-4 h-9 rounded-full border border-primary hover:bg-primary-container">下書き保存</button>
          <button onClick={() => onSave(form)} className="text-sm font-medium text-on-primary px-4 h-9 rounded-full" style={{ backgroundColor: '#1976D2' }}>承認申請</button>
        </div>
      </div>
    </div>
  );
}

function TransferInSection() {
  const [items, setItems] = useState<TransferIn[]>(INIT_TRANSFER_INS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransferIn | null>(null);
  const [search, setSearch] = useState('');

  // サマリへデルタ発行（転入 = プラス、一般正社員として計上）
  const { setSourceDeltas } = usePlanDeltas();
  useEffect(() => {
    const deltas: Record<string, [number, number, number]> = {};
    for (const t of items) {
      const fy = getFiscalYear(t.targetDate);
      if (!fy) continue;
      if (!deltas[fy]) deltas[fy] = [0, 0, 0];
      deltas[fy][1] += 1; // 一般正社員として+1
    }
    setSourceDeltas('transferin', deltas);
  }, [items, setSourceDeltas]);

  const filtered = items.filter((t) => t.name.includes(search) || t.sourceOrg.includes(search) || t.no.includes(search));
  const fyItems  = items.filter((t) => NEXT_FY_MONTHS.has(t.targetDate));
  const outerCnt = fyItems.filter((t) => t.sourceType === '本部外').length;
  const innerCnt = fyItems.filter((t) => t.sourceType === '本部内').length;
  const pendingCnt = items.filter((t) => t.status === '承認待ち').length;

  const save = (form: TransferInForm) => {
    if (editTarget) {
      setItems((prev) => prev.map((t) => t.id === editTarget.id ? { ...t, ...form } : t));
    } else {
      setItems((prev) => [...prev, {
        ...form, id: String(Date.now()),
        no: `TIN-${String(prev.length + 1).padStart(3, '0')}`,
        status: '下書き保存', sourceType: '本部外', isInbound: false,
      }]);
    }
    setModalOpen(false); setEditTarget(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-outline rounded-lg p-4 flex flex-col gap-1">
          <span className="text-[13px] text-on-surface-variant">転入予定（合計）</span>
          <span className="text-[26px] font-medium leading-none text-on-surface">{outerCnt + innerCnt}件</span>
          {pendingCnt > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-rounded text-[#F57C00]" style={{ fontSize: 12 }}>pending_actions</span>
              <span className="text-[11px] text-[#E65100] font-medium">承認待ち {pendingCnt}件</span>
            </div>
          )}
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 flex flex-col gap-1">
          <span className="text-[13px] text-on-surface-variant">本部外転入</span>
          <span className="text-[26px] font-medium leading-none" style={{ color: '#E65100' }}>{outerCnt}件</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 11 }}>calendar_today</span>
            <span className="text-[11px] text-on-surface-variant">〜 2027年3月末</span>
          </div>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 flex flex-col gap-1">
          <span className="text-[13px] text-on-surface-variant">本部内転入</span>
          <span className="text-[26px] font-medium leading-none" style={{ color: '#6A1B9A' }}>{innerCnt}件</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 11 }}>calendar_today</span>
            <span className="text-[11px] text-on-surface-variant">〜 2027年3月末</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline rounded-lg flex flex-col overflow-hidden" style={{ maxHeight: 400 }}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-outline shrink-0">
          <div className="flex items-center gap-2 bg-surface-variant rounded px-3 h-8 w-64">
            <Icon name="search" size={16} className="text-on-surface-variant" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-on-surface-variant"
              placeholder="氏名・異動元で検索..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-on-surface-variant">{filtered.length}件</span>
            <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 text-sm font-medium text-on-primary px-4 h-8 rounded-full"
              style={{ backgroundColor: '#1976D2' }}>
              <Icon name="add" size={16} className="text-on-primary" />転入登録（本部外）
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <div className="flex items-center bg-surface-variant px-4 h-10 sticky top-0 z-10 min-w-[860px]">
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">転入No.</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">転入者名</div>
            <div className="w-36 text-xs font-medium text-on-surface-variant shrink-0">異動元組織</div>
            <div className="w-20 text-xs font-medium text-on-surface-variant shrink-0">転入元</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">配属先部署</div>
            <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">転入予定時期</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">ステータス</div>
            <div className="flex-1 text-xs font-medium text-on-surface-variant min-w-[80px]">コメント</div>
            <div className="w-28 text-xs font-medium text-on-surface-variant text-center shrink-0">操作</div>
          </div>
          {filtered.map((t) => (
            <div key={t.id}
              className={`flex items-center px-4 h-[52px] border-b border-outline last:border-b-0 min-w-[860px] ${t.status === '承認待ち' ? 'bg-[#FFFDE7]' : 'hover:bg-[#F8F9FF]'}`}>
              <div className="w-24 text-sm text-on-surface-variant shrink-0">{t.no}</div>
              <div className="w-28 text-sm font-medium text-on-surface shrink-0 truncate pr-2">
                {t.name || <span className="italic text-on-surface-variant">未定</span>}
              </div>
              <div className="w-36 text-sm text-on-surface-variant shrink-0 truncate pr-2">{t.sourceOrg}</div>
              <div className="w-20 shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: SOURCE_STYLE[t.sourceType].bg, color: SOURCE_STYLE[t.sourceType].color }}>
                  {t.sourceType}
                </span>
              </div>
              <div className="w-28 text-sm text-on-surface-variant shrink-0">{t.destDept}</div>
              <div className="w-24 text-sm text-on-surface-variant shrink-0">{t.targetDate}</div>
              <div className="w-28 shrink-0"><StatusBadge status={t.status} /></div>
              <div className="flex-1 text-sm text-on-surface-variant min-w-[80px] truncate pr-2">{t.comment || '—'}</div>
              <div className="w-28 flex items-center justify-center gap-1 shrink-0">
                {t.isInbound ? (
                  t.status === '承認待ち' ? (
                    <>
                      <button onClick={() => setItems((prev) => prev.map((x) => x.id === t.id ? { ...x, status: '承認済み' } : x))}
                        className="text-xs font-medium text-white px-2.5 h-7 rounded"
                        style={{ backgroundColor: '#388E3C' }}>承認</button>
                      <button onClick={() => setItems((prev) => prev.map((x) => x.id === t.id ? { ...x, status: '差戻中' } : x))}
                        className="text-xs font-medium text-white px-2.5 h-7 rounded"
                        style={{ backgroundColor: '#D32F2F' }}>差戻</button>
                    </>
                  ) : (
                    <span className="text-xs text-on-surface-variant">参照のみ</span>
                  )
                ) : (
                  <>
                    <button onClick={() => { setEditTarget(t); setModalOpen(true); }}
                      className="p-1 rounded hover:bg-surface-variant text-on-surface-variant" title="編集">
                      <Icon name="edit" size={16} />
                    </button>
                    <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                      className="p-1 rounded hover:bg-error-container text-on-surface-variant hover:text-error" title="削除">
                      <Icon name="delete" size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
              <Icon name="search_off" size={36} /><p className="text-sm">該当する転入情報が見つかりません</p>
            </div>
          )}
        </div>
        <div className="flex items-center px-4 h-9 border-t border-outline shrink-0">
          <span className="text-[12px] text-on-surface-variant">{filtered.length}件表示 / 全{items.length}件</span>
        </div>
      </div>

      {modalOpen && (
        <TransferInModal
          form={editTarget ? { name: editTarget.name, sourceOrg: editTarget.sourceOrg, destDept: editTarget.destDept, targetDate: editTarget.targetDate, comment: editTarget.comment } : EMPTY_TI_FORM}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

// ================================================================
// メインページ
// ================================================================
export default function HiringPlansPage() {
  const [tab, setTab] = useState<'hiring' | 'transferin'>('hiring');

  return (
    <DeptPageShell>
      {/* サブタブバー */}
      <div
        className="flex items-center px-12 shrink-0"
        style={{ backgroundColor: '#FFFFFF', height: 40, borderBottom: '1px solid #E0E0E0' }}
      >
        {([
          { key: 'hiring',     label: '採用計画' },
          { key: 'transferin', label: '転入情報' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center h-10 px-4 text-[13px] font-medium transition-colors"
            style={{
              color: tab === key ? '#1976D2' : '#757575',
              fontWeight: tab === key ? 600 : 500,
              boxShadow: tab === key ? 'inset 0 -2px 0 0 #1976D2' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="flex flex-col gap-6 p-6" style={{ backgroundColor: '#FAFAFA' }}>
        {/* Page header */}
        <div className="shrink-0">
          <h1 className="text-2xl text-on-surface">転入・採用計画</h1>
          <p className="text-sm text-on-surface-variant mt-1">転入・採用計画の管理</p>
        </div>

        {/* Section content — 両方マウントしてデルタ発行を維持 */}
        <div className={tab === 'hiring' ? '' : 'hidden'}><HiringSection /></div>
        <div className={tab === 'transferin' ? '' : 'hidden'}><TransferInSection /></div>
      </main>

      <style jsx global>{`
        .select-base {
          height: 40px; padding: 0 36px 0 12px;
          border: 1px solid #BDBDBD; border-radius: 4px;
          font-size: 14px; color: #212121; background: #FFFFFF;
          outline: none; width: 100%; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z' fill='%23757575'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 8px center;
        }
        .select-base:focus { border-color: #1976D2; }
        .input-base {
          padding: 8px 12px; border: 1px solid #BDBDBD; border-radius: 4px;
          font-size: 14px; color: #212121; background: #FFFFFF; outline: none; width: 100%;
        }
        .input-base:focus { border-color: #1976D2; }
      `}</style>
    </DeptPageShell>
  );
}
