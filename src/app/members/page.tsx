'use client';
import DeptPageShell from '@/components/DeptPageShell';
import StatusBadge from '@/components/StatusBadge';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { usePlanDeltas, getFiscalYear } from '@/contexts/PlanDeltaContext';

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

// ---------- 次年度末フィルター ----------
const NEXT_FY_MONTHS = [
  '2026年4月', '2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月',
  '2026年10月', '2026年11月', '2026年12月', '2027年1月', '2027年2月', '2027年3月',
];

function countByType(members: Member[], type: string) {
  return members.filter(
    (m) => m.transferType === type && NEXT_FY_MONTHS.includes(m.transferDate)
  ).length;
}

// ---------- 組織マスタ ----------
const CENTER_OPTIONS = ['開発センター', '地域センター', '品質センター'];
const DEPT_OPTIONS: Record<string, string[]> = {
  '開発センター': ['第一開発部', '第二開発部', 'インフラ部'],
  '地域センター': ['地域管理部', '西日本地域部'],
  '品質センター': ['品質管理部', '品質保証部'],
};

// ---------- 型 ----------
interface Member {
  id: string;
  empNo: string;
  name: string;
  dept: string;
  rank: string;
  transferType: string;    // 転出/転入/退職 (内部管理用)
  destDept: string;
  transferDate: string;
  comment: string;
  approvalStatus: string;  // 承認ステータス（表示用）
  retirementDate: string;  // 定年退職予定年月
}

interface PlanForm {
  transferType: string;
  scope: '本部内' | '本部外';
  center: string;
  destDept: string;
  destFreeText: string;
  transferDate: string;
  comment: string;
}

const OWN_DEPT = '第一開発部';
const EMPTY_FORM: PlanForm = {
  transferType: '転出（異動）',
  scope: '本部内',
  center: CENTER_OPTIONS[0],
  destDept: (DEPT_OPTIONS[CENTER_OPTIONS[0]] ?? []).filter(d => d !== OWN_DEPT)[0] ?? '',
  destFreeText: '',
  transferDate: '2026年7月',
  comment: '',
};

// ---------- モックデータ ----------
const INIT_MEMBERS: Member[] = [
  { id: '1',  empNo: 'EMP-001', name: '佐藤 一郎',   dept: '第一開発部', rank: '主任',   transferType: '転出（異動）', destDept: '第二開発部',  transferDate: '2026年7月', comment: 'スキル活用のため',         approvalStatus: '承認申請中', retirementDate: '2031年3月' },
  { id: '2',  empNo: 'EMP-002', name: '田中 花子',   dept: '第一開発部', rank: '一般',   transferType: '退職',         destDept: '—',           transferDate: '2026年6月', comment: '一身上の都合',             approvalStatus: '下書き保存',  retirementDate: '' },
  { id: '3',  empNo: 'EMP-003', name: '高橋 達大',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2038年3月' },
  { id: '4',  empNo: 'EMP-004', name: '山田 悠明',   dept: '第一開発部', rank: '主任',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2029年3月' },
  { id: '5',  empNo: 'EMP-005', name: '中村 大樹',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
  { id: '6',  empNo: 'EMP-006', name: '鈴木 健二',   dept: '第一開発部', rank: '主任',   transferType: '転出（異動）', destDept: '品質管理部',  transferDate: '2026年7月', comment: '品質部門強化のため',       approvalStatus: '下書き保存',  retirementDate: '2027年3月' },
  { id: '7',  empNo: 'EMP-007', name: '伊藤 美咲',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
  { id: '8',  empNo: 'EMP-008', name: '渡辺 浩二',   dept: '第一開発部', rank: '課長',   transferType: '退職',         destDept: '—',           transferDate: '2026年9月', comment: '定年退職',                 approvalStatus: '下書き保存',  retirementDate: '2026年9月' },
  { id: '9',  empNo: 'EMP-009', name: '松本 真由美', dept: '第一開発部', rank: '一般',   transferType: '退職',         destDept: '—',           transferDate: '2026年8月', comment: '産休・退職',               approvalStatus: '承認申請中', retirementDate: '' },
  { id: '10', empNo: 'EMP-010', name: '小林 純',     dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2033年3月' },
  { id: '11', empNo: 'EMP-011', name: '加藤 裕',     dept: '第一開発部', rank: '主任',   transferType: '転出（異動）', destDept: 'インフラ部',  transferDate: '2026年9月', comment: '部門横断プロジェクト対応', approvalStatus: '差戻中',     retirementDate: '2028年3月' },
  { id: '12', empNo: 'EMP-012', name: '中島 由紀',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
  { id: '13', empNo: 'EMP-013', name: '前田 光',     dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
  { id: '14', empNo: 'EMP-014', name: '藤田 誠',     dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2030年3月' },
  { id: '15', empNo: 'EMP-015', name: '岡田 恵',     dept: '第一開発部', rank: '副主任', transferType: '転出（異動）', destDept: '西日本地域部', transferDate: '2026年9月', comment: '地域強化施策',             approvalStatus: '下書き保存',  retirementDate: '2032年3月' },
];

const FISCAL_YEAR_RANGE = '〜 2027年3月末';

const TRANSFER_TYPES = ['転出（異動）', '退職'];
const MONTHS = [
  '2026年4月', '2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月',
  '2026年10月', '2026年11月', '2026年12月', '2027年1月', '2027年2月', '2027年3月',
  '2027年4月', '2027年5月', '2027年6月', '2027年7月', '2027年8月', '2027年9月',
  '2027年10月', '2027年11月', '2027年12月', '2028年1月', '2028年2月', '2028年3月',
  '2028年4月', '2028年5月', '2028年6月', '2028年7月', '2028年8月', '2028年9月',
  '2028年10月', '2028年11月', '2028年12月', '2029年1月', '2029年2月', '2029年3月',
];

// ---------- 異動計画モーダル（入力・編集共用） ----------
function PlanModal({
  member,
  initial,
  isEdit,
  onClose,
  onSave,
  onDelete,
  onDetail,
}: {
  member: Member;
  initial: PlanForm;
  isEdit: boolean;
  onClose: () => void;
  onSave: (form: PlanForm) => void;
  onDelete?: () => void;
  onDetail: () => void;
}) {
  const [form, setForm] = useState<PlanForm>(initial);
  const ownDept = member.dept;
  const deptList = (DEPT_OPTIONS[form.center] ?? []).filter(d => d !== ownDept);

  const handleCenterChange = (center: string) => {
    const filtered = (DEPT_OPTIONS[center] ?? []).filter(d => d !== ownDept);
    setForm({ ...form, center, destDept: filtered[0] ?? '' });
  };

  const resolvedDest =
    form.scope === '本部外'
      ? form.destFreeText
      : `${form.center} / ${form.destDept}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-outline shrink-0">
          <div>
            <span className="text-base font-medium text-on-surface">
              {isEdit ? '異動計画 編集' : '異動計画 入力'}
            </span>
            <span className="ml-2 text-sm text-on-surface-variant">{member.name}（{member.empNo}）</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          <Field label="異動種別">
            <select className="select-base" value={form.transferType}
              onChange={(e) => setForm({ ...form, transferType: e.target.value })}>
              {TRANSFER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-on-surface-variant">異動先部署</span>
            <div className="flex border border-outline rounded-lg overflow-hidden w-fit">
              {(['本部内', '本部外'] as const).map((s) => (
                <button key={s} onClick={() => setForm({ ...form, scope: s })}
                  className="px-5 h-8 text-sm transition-colors"
                  style={{ backgroundColor: form.scope === s ? '#1976D2' : '#FFFFFF', color: form.scope === s ? '#FFFFFF' : '#212121' }}>
                  {s}
                </button>
              ))}
            </div>

            {form.scope === '本部内' ? (
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant">センター</label>
                  <select className="select-base" value={form.center} onChange={(e) => handleCenterChange(e.target.value)}>
                    {CENTER_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-on-surface-variant">部</label>
                  <select className="select-base" value={form.destDept}
                    onChange={(e) => setForm({ ...form, destDept: e.target.value })}>
                    {deptList.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant">社名 / 組織名（本部外）</label>
                <input className="input-base" placeholder="例: ABC株式会社 開発部"
                  value={form.destFreeText} onChange={(e) => setForm({ ...form, destFreeText: e.target.value })} />
              </div>
            )}

            {resolvedDest && (
              <p className="text-xs text-on-surface-variant">
                選択中: <span className="font-medium text-primary">{resolvedDest}</span>
              </p>
            )}
          </div>

          <Field label="異動時期">
            <select className="select-base" value={form.transferDate}
              onChange={(e) => setForm({ ...form, transferDate: e.target.value })}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>

          <Field label="コメント・備考">
            <textarea className="input-base resize-none" rows={2}
              placeholder="異動の理由や備考を入力..."
              value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-outline shrink-0">
          {/* 左：詳細 + 削除 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDetail}
              className="flex items-center gap-1.5 text-sm text-primary px-4 h-9 rounded-full border border-primary hover:bg-primary-container"
            >
              <Icon name="open_in_new" size={16} className="text-primary" />
              詳細
            </button>
            {isEdit && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 text-sm text-error px-4 h-9 rounded-full border border-error hover:bg-error-container"
              >
                <Icon name="delete" size={16} className="text-error" />
                取消
              </button>
            )}
          </div>
          {/* 右：操作ボタン群 */}
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="text-sm text-on-surface-variant px-4 h-9 rounded-full border border-outline hover:bg-surface-variant">
              キャンセル
            </button>
            <button onClick={() => onSave({ ...form })}
              className="text-sm font-medium text-primary px-4 h-9 rounded-full border border-primary hover:bg-primary-container">
              下書き保存
            </button>
            <button onClick={() => onSave({ ...form })}
              className="text-sm font-medium text-on-primary px-4 h-9 rounded-full"
              style={{ backgroundColor: '#1976D2' }}>
              承認申請
            </button>
          </div>
        </div>
      </div>
    </div>
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

// ---------- メインページ ----------
export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(INIT_MEMBERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [modalMember, setModalMember] = useState<Member | null>(null);
  const [modalIsEdit, setModalIsEdit] = useState(false);

  // サマリへデルタを発行
  const MANAGER_RANKS = useMemo(() => new Set(['課長', '部長', '次長']), []);
  const { setSourceDeltas } = usePlanDeltas();
  useEffect(() => {
    const deltas: Record<string, [number, number, number]> = {};
    for (const m of members) {
      if (!m.transferType || !m.transferDate) continue;
      const fy = getFiscalYear(m.transferDate);
      if (!fy) continue;
      if (!deltas[fy]) deltas[fy] = [0, 0, 0];
      const isManager = MANAGER_RANKS.has(m.rank);
      // 転出・退職はマイナス
      if (m.transferType === '転出（異動）' || m.transferType === '退職') {
        deltas[fy][isManager ? 0 : 1] -= 1;
      }
    }
    setSourceDeltas('members', deltas);
  }, [members, setSourceDeltas, MANAGER_RANKS]);

  const filtered = members.filter(
    (m) => m.name.includes(search) || m.empNo.includes(search) || m.dept.includes(search)
  );

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((m) => m.id)));
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // 選択中の「下書き保存」件数
  const draftSelected = Array.from(selected).filter(
    (id) => members.find((m) => m.id === id)?.approvalStatus === '下書き保存'
  );

  const bulkSubmit = () => {
    const targets = draftSelected.length > 0
      ? draftSelected
      : members.filter((m) => m.approvalStatus === '下書き保存').map((m) => m.id);
    setMembers((prev) =>
      prev.map((m) =>
        targets.includes(m.id) ? { ...m, approvalStatus: '承認申請中' } : m
      )
    );
    setSelected(new Set());
  };

  const totalDraft = members.filter((m) => m.approvalStatus === '下書き保存').length;

  const openModal = (member: Member, isEdit: boolean) => {
    setModalMember(member);
    setModalIsEdit(isEdit);
  };
  const closeModal = () => setModalMember(null);
  const savePlan = (form: PlanForm) => {
    const dest = form.scope === '本部外' ? form.destFreeText : `${form.center} / ${form.destDept}`;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === modalMember!.id
          ? { ...m, transferType: form.transferType, destDept: dest, transferDate: form.transferDate, comment: form.comment, approvalStatus: '下書き保存' }
          : m
      )
    );
    closeModal();
  };
  const deletePlan = () => {
    if (!modalMember) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === modalMember.id
          ? { ...m, transferType: '', destDept: '', transferDate: '', comment: '', approvalStatus: '' }
          : m
      )
    );
    closeModal();
  };

  const getInitialForm = (member: Member): PlanForm => ({
    transferType: member.transferType || '転出（異動）',
    scope: '本部内',
    center: CENTER_OPTIONS[0],
    destDept: DEPT_OPTIONS[CENTER_OPTIONS[0]][0],
    destFreeText: '',
    transferDate: member.transferDate || MONTHS[3],
    comment: member.comment || '',
  });

  return (
    <DeptPageShell>
      <main className="flex flex-col gap-6 p-6">
        {/* Page header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-medium text-on-surface">転出・退職計画</h1>
            <p className="text-sm text-on-surface-variant mt-1">2026年度 人員計画</p>
          </div>
          <button
            onClick={bulkSubmit}
            disabled={totalDraft === 0}
            className="flex items-center gap-2 text-sm font-medium text-on-primary px-5 h-10 rounded-full disabled:opacity-40"
            style={{ backgroundColor: '#1976D2' }}
            title={draftSelected.length > 0 ? `選択中 ${draftSelected.length}件を申請` : `下書き ${totalDraft}件をまとめて申請`}
          >
            <Icon name="send" size={16} className="text-on-primary" />
            まとめて申請
            {totalDraft > 0 && (
              <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {draftSelected.length > 0 ? draftSelected.length : totalDraft}
              </span>
            )}
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          {/* 現在部員数 — 期間対象外 */}
          <div className="bg-surface border border-outline rounded-lg p-5 flex flex-col gap-2">
            <span className="text-[13px] text-on-surface-variant">現在部員数</span>
            <span className="text-[28px] font-medium leading-none text-on-surface">{members.length}名</span>
          </div>
          {/* 期間ありメトリクス */}
          {[
            { label: '転出予定',     count: countByType(members, '転出（異動）'), color: '#F57C00' },
            { label: '退職予定',     count: countByType(members, '退職'),         color: '#D32F2F' },
            { label: '定年退職予定', count: members.filter((m) => m.retirementDate && NEXT_FY_MONTHS.includes(m.retirementDate)).length, color: '#7B1FA2' },
          ].map((m) => (
            <div key={m.label} className="bg-surface border border-outline rounded-lg p-5 flex flex-col justify-between gap-1">
              <span className="text-[13px] text-on-surface-variant">{m.label}</span>
              <span className="text-[28px] font-medium leading-none" style={{ color: m.color }}>
                {m.count}名
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 12 }}>calendar_today</span>
                <span className="text-[11px] text-on-surface-variant">{FISCAL_YEAR_RANGE}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table card — flex-1 で残り高さを埋め、内部スクロール */}
        <div className="bg-surface border border-outline rounded-lg flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-outline shrink-0">
            <div className="flex items-center gap-2 bg-surface-variant rounded px-3 h-10 w-72">
              <Icon name="search" size={18} className="text-on-surface-variant" />
              <input
                className="bg-transparent text-sm outline-none w-full text-on-surface placeholder:text-on-surface-variant"
                placeholder="氏名・社員番号で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              {selected.size > 0 && (
                <span className="text-sm text-on-surface-variant">{selected.size}件選択中</span>
              )}
              <button className="flex items-center gap-1.5 text-sm text-on-surface-variant px-3 h-8 border border-outline rounded hover:bg-surface-variant">
                <Icon name="filter_list" size={16} className="text-on-surface-variant" />
                ステータス
              </button>
              <button className="flex items-center gap-1.5 text-sm text-on-surface-variant px-3 h-8 border border-outline rounded hover:bg-surface-variant">
                <Icon name="tune" size={16} className="text-on-surface-variant" />
                絞り込み
              </button>
            </div>
          </div>

          {/* Scrollable table area */}
          <div className="overflow-auto">
            {/* Sticky header */}
            <div className="flex items-center bg-surface-variant px-4 h-12 sticky top-0 z-10 min-w-[1100px]">
              <div className="w-12 flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">社員番号</div>
              <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">氏名</div>
              <div className="w-28 text-xs font-medium text-on-surface-variant shrink-0">部署</div>
              <div className="w-20 text-xs font-medium text-on-surface-variant shrink-0">役職</div>
              <div className="w-32 text-xs font-medium text-on-surface-variant shrink-0">承認ステータス</div>
              <div className="w-44 text-xs font-medium text-on-surface-variant shrink-0">異動先</div>
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">異動時期</div>
              <div className="flex-1 text-xs font-medium text-on-surface-variant min-w-[120px]">コメント</div>
              <div className="w-24 text-xs font-medium text-on-surface-variant shrink-0">定年退職</div>
              <div className="w-28 text-xs font-medium text-on-surface-variant text-center shrink-0">アクション</div>
            </div>

            {/* Data rows */}
            {filtered.map((m) => {
              const hasPlan = !!m.transferType;
              return (
                <div
                  key={m.id}
                  className="flex items-center px-4 h-[52px] border-b border-outline last:border-b-0 hover:bg-[#F8F9FF] min-w-[1100px]"
                >
                  <div className="w-12 flex items-center justify-center shrink-0">
                    <input
                      type="checkbox"
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="w-24 text-sm text-on-surface-variant shrink-0">{m.empNo}</div>
                  <div className="w-32 text-sm font-medium text-on-surface shrink-0">{m.name}</div>
                  <div className="w-28 text-sm text-on-surface-variant shrink-0">{m.dept}</div>
                  <div className="w-20 text-sm text-on-surface-variant shrink-0">{m.rank}</div>
                  {/* 承認ステータス */}
                  <div className="w-32 shrink-0">
                    {m.approvalStatus ? <StatusBadge status={m.approvalStatus} /> : <span />}
                  </div>
                  {/* 異動先 */}
                  <div className="w-44 shrink-0">
                    {hasPlan
                      ? <span className="text-sm font-medium text-on-surface">{m.destDept}</span>
                      : <span className="text-sm text-on-surface-variant">—</span>}
                  </div>
                  {/* 異動時期 */}
                  <div className="w-24 shrink-0">
                    <span className="text-sm text-on-surface-variant">{m.transferDate || '—'}</span>
                  </div>
                  {/* コメント */}
                  <div className="flex-1 min-w-[120px]">
                    <span className="text-sm text-on-surface-variant line-clamp-1">{m.comment || '—'}</span>
                  </div>
                  {/* 定年退職 */}
                  <div className="w-24 shrink-0">
                    {m.retirementDate ? (
                      <span className="text-sm text-on-surface-variant">{m.retirementDate}</span>
                    ) : (
                      <span className="text-sm text-on-surface-variant">—</span>
                    )}
                  </div>
                  {/* アクション */}
                  <div className="w-28 flex items-center justify-center gap-2 shrink-0">
                    {hasPlan ? (
                      <>
                        <button
                          onClick={() => openModal(m, true)}
                          className="flex items-center gap-1 text-xs font-medium text-on-primary px-3 h-7 rounded"
                          style={{ backgroundColor: '#1976D2' }}
                        >
                          <Icon name="edit" size={14} className="text-on-primary" />
                          編集
                        </button>
                        <button
                          onClick={() => {
                            setMembers((prev) =>
                              prev.map((x) =>
                                x.id === m.id
                                  ? { ...x, transferType: '', destDept: '', transferDate: '', comment: '', approvalStatus: '' }
                                  : x
                              )
                            );
                          }}
                          className="p-1 rounded hover:bg-error-container text-on-surface-variant hover:text-error"
                          title="異動情報を取消"
                        >
                          <Icon name="delete" size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openModal(m, false)}
                        className="flex items-center gap-1 text-xs font-medium text-primary px-3 h-7 rounded border border-primary hover:bg-primary-container"
                      >
                        <Icon name="add" size={14} className="text-primary" />
                        異動入力
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Count only, no pagination */}
          <div className="flex items-center px-4 h-10 border-t border-outline shrink-0">
            <span className="text-[13px] text-on-surface-variant">{filtered.length}件表示 / 全{members.length}件</span>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalMember && (
        <PlanModal
          member={modalMember}
          initial={getInitialForm(modalMember)}
          isEdit={modalIsEdit}
          onClose={closeModal}
          onSave={savePlan}
          onDelete={modalIsEdit ? deletePlan : undefined}
          onDetail={() => { closeModal(); router.push('/transfer-plans'); }}
        />
      )}

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
