'use client';
import CenterPageShell from '@/components/CenterPageShell';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import { useState } from 'react';

// ================================================================
// データ型
// ================================================================
interface CenterMember {
  id: string;
  empNo: string;
  name: string;
  dept: string;
  rank: string;
  transferType: string;
  destDept: string;
  transferDate: string;
  approvalStatus: string;
  isConfidential: boolean; // センター長のみ閲覧可
  // ── 個人情報拡張 ──
  jobResponsibility: string;       // 職責
  jobGrade: string;                // 職階 A1-A7
  groupType: string;               // 群類
  spec: string;                    // スペック
  age: number | null;              // 年齢
  mandatoryRetirementDate: string; // 定年退職日
  salaryRegion: string;            // 給与管理地区
  isInactive: boolean;             // 戦力外フラグ
  returnDate: string;              // 戦力復帰時期
}

// ================================================================
// マスタ
// ================================================================
const DEPT_FILTERS = ['全部門', '第一開発部', '第二開発部', '品質管理部', 'インフラ部'];

const TRANSFER_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  '転出（異動）': { bg: '#FFF3E0', color: '#E65100' },
  '退職':         { bg: '#FFEBEE', color: '#D32F2F' },
  '転入予定':     { bg: '#E1F5FE', color: '#0288D1' },
};

// ================================================================
// モックデータ（全センター部員）
// ================================================================
// ヘルパー: 個人情報拡張データのデフォルト値
type Ext = Pick<CenterMember, 'jobResponsibility' | 'jobGrade' | 'groupType' | 'spec' | 'age' | 'mandatoryRetirementDate' | 'salaryRegion' | 'isInactive' | 'returnDate'>;
const ext = (jobResponsibility: string, jobGrade: string, groupType: string, spec: string, age: number, mandatoryRetirementDate: string, salaryRegion = '東京', isInactive = false, returnDate = ''): Ext =>
  ({ jobResponsibility, jobGrade, groupType, spec, age, mandatoryRetirementDate, salaryRegion, isInactive, returnDate });

const INIT_MEMBERS: CenterMember[] = [
  // ── 第一開発部 ──
  { id: '1',  empNo: 'EMP-001', name: '佐藤 一郎',   dept: '第一開発部', rank: '主任',   transferType: '転出（異動）', destDept: '第二開発部', transferDate: '2026年7月', approvalStatus: '承認申請中', isConfidential: false, ...ext('グループ長', 'A4', 'GR3', 'GR3以上', 40, '2050-04-12') },
  { id: '2',  empNo: 'EMP-002', name: '田中 花子',   dept: '第一開発部', rank: '一般',   transferType: '退職',         destDept: '—',          transferDate: '2026年6月', approvalStatus: '下書き保存', isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 30, '2060-08-20') },
  { id: '3',  empNo: 'EMP-003', name: '高橋 達大',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A2', 'GR2', 'GR1/2', 27, '2063-02-15') },
  { id: '4',  empNo: 'EMP-004', name: '山田 悠明',   dept: '第一開発部', rank: '主任',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('グループ長', 'A4', 'GR3', 'GR3以上', 37, '2053-11-03') },
  { id: '5',  empNo: 'EMP-005', name: '中村 大樹',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A3', 'GR2', 'GR1/2', 33, '2057-06-25', '神奈川') },
  { id: '6',  empNo: 'EMP-006', name: '鈴木 健二',   dept: '第一開発部', rank: '主任',   transferType: '転出（異動）', destDept: '品質管理部', transferDate: '2026年7月', approvalStatus: '下書き保存', isConfidential: false, ...ext('グループ長', 'A5', 'GR3', 'GR3以上', 45, '2045-09-08') },
  { id: '7',  empNo: 'EMP-007', name: '伊藤 美咲',   dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 29, '2061-12-01') },
  { id: '8',  empNo: 'EMP-008', name: '渡辺 浩二',   dept: '第一開発部', rank: '課長',   transferType: '退職',         destDept: '—',          transferDate: '2026年9月', approvalStatus: '下書き保存', isConfidential: false, ...ext('課長', 'A6', '管理職', '60歳以上', 60, '2026-09-15') },
  { id: '9',  empNo: 'EMP-009', name: '松本 真由美', dept: '第一開発部', rank: '一般',   transferType: '退職',         destDept: '—',          transferDate: '2026年8月', approvalStatus: '承認申請中', isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 32, '2058-03-30', '東京', true, '2027年4月') },
  { id: '10', empNo: 'EMP-010', name: '小林 純',     dept: '第一開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A3', 'GR2', 'GR1/2', 35, '2055-07-18', '埼玉') },
  { id: '11', empNo: 'EMP-011', name: '加藤 裕',     dept: '第一開発部', rank: '主任',   transferType: '転出（異動）', destDept: 'インフラ部', transferDate: '2026年9月', approvalStatus: '差戻中',    isConfidential: false, ...ext('グループ長', 'A4', 'GR3', 'GR3以上', 39, '2051-01-22') },
  { id: '12', empNo: 'EMP-014', name: '藤田 誠',     dept: '第一開発部', rank: '副主任', transferType: '転出（異動）', destDept: '品質保証部', transferDate: '2026年12月', approvalStatus: 'センター長追加', isConfidential: true,  ...ext('', 'A3', 'GR2', 'GR1/2', 36, '2054-12-28') },
  { id: '13', empNo: 'EMP-015', name: '岡田 恵',     dept: '第一開発部', rank: '副主任', transferType: '転出（異動）', destDept: '西日本地域部', transferDate: '2026年9月', approvalStatus: '下書き保存', isConfidential: false, ...ext('', 'A3', 'GR3', 'GR3以上', 38, '2052-08-14') },

  // ── 第二開発部 ──
  { id: '21', empNo: 'EMP-021', name: '木村 誠',     dept: '第二開発部', rank: '主任',   transferType: '転出（異動）', destDept: '品質保証部', transferDate: '2026年8月', approvalStatus: '承認申請中', isConfidential: false, ...ext('グループ長', 'A4', 'GR3', 'GR3以上', 42, '2048-05-20') },
  { id: '22', empNo: 'EMP-022', name: '田口 優子',   dept: '第二開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 28, '2062-04-12') },
  { id: '23', empNo: 'EMP-023', name: '橋本 太郎',   dept: '第二開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A3', 'GR2', 'GR1/2', 34, '2056-10-02') },
  { id: '24', empNo: 'EMP-024', name: '中島 美穂',   dept: '第二開発部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 26, '2064-07-15') },
  { id: '25', empNo: 'TIN-009', name: '山田 美咲',   dept: '第二開発部', rank: '—',      transferType: '転入予定',     destDept: 'インフラ部', transferDate: '2026年11月', approvalStatus: 'センター長追加', isConfidential: true,  ...ext('', '—', '契約社員', '契約社員', 31, '') },

  // ── 品質管理部 ──
  { id: '31', empNo: 'EMP-031', name: '石田 一郎',   dept: '品質管理部', rank: '課長',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('課長', 'A6', '管理職', 'GR3以上', 52, '2034-03-10') },
  { id: '32', empNo: 'EMP-032', name: '坂本 和子',   dept: '品質管理部', rank: '主任',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('グループ長', 'A4', 'GR3', 'GR3以上', 41, '2049-09-22') },
  { id: '33', empNo: 'EMP-033', name: '林 由美子',   dept: '品質管理部', rank: '一般',   transferType: '退職',         destDept: '—',          transferDate: '2026年7月', approvalStatus: '承認申請中', isConfidential: false, ...ext('', 'A3', 'GR2', 'GR1/2', 36, '2054-11-08') },
  { id: '34', empNo: 'EMP-034', name: '竹内 誠',     dept: '品質管理部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 25, '2065-02-01') },

  // ── インフラ部 ──
  { id: '41', empNo: 'EMP-041', name: '大野 健二',   dept: 'インフラ部', rank: '課長',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('課長', 'A7', '管理職', '65歳以上', 65, '2025-12-31') },
  { id: '42', empNo: 'EMP-042', name: '福田 光',     dept: 'インフラ部', rank: '主任',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('グループ長', 'A4', 'GR3', 'GR3以上', 43, '2047-06-18') },
  { id: '43', empNo: 'EMP-043', name: '岡本 恵子',   dept: 'インフラ部', rank: '一般',   transferType: '',             destDept: '',           transferDate: '',          approvalStatus: '',          isConfidential: false, ...ext('', 'A2', 'GR1', 'GR1/2', 27, '2063-08-30') },
];

// ================================================================
// メインページ
// ================================================================
export default function CenterMembersPage() {
  const [members] = useState<CenterMember[]>(INIT_MEMBERS);
  const [deptFilter, setDeptFilter] = useState('全部門');
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    const matchDept = deptFilter === '全部門' || m.dept === deptFilter;
    const matchSearch = !search || m.name.includes(search) || m.empNo.includes(search);
    return matchDept && matchSearch;
  });

  const hasPlanCount      = members.filter((m) => !!m.transferType && !m.isConfidential).length;
  const confidentialCount = members.filter((m) => m.isConfidential).length;
  const totalCount        = members.length;

  return (
    <CenterPageShell>

      <main className="flex flex-col gap-6 p-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-normal text-on-surface">部員一覧</h1>
            <p className="text-sm text-on-surface-variant">開発センター 全部門の在籍メンバー</p>
          </div>
        </div>

        {/* メトリクス */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard label="在籍中" count={totalCount} color="#1976D2" bg="#E3F2FD" icon="groups" />
          <MetricCard label="異動計画あり" count={hasPlanCount} color="#E65100" bg="#FFF3E0" icon="swap_horiz" />
          <MetricCard label="退職予定" count={members.filter((m) => m.transferType === '退職').length} color="#D32F2F" bg="#FFEBEE" icon="person_off" />
          <MetricCard label="秘匿情報" count={confidentialCount} color="#7B1FA2" bg="#EDE7F6" icon="lock" />
        </div>

        {/* フィルター行 */}
        <div className="flex items-center justify-between gap-4">
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
          {/* 検索 */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-surface" style={{ border: '1px solid #E0E0E0', minWidth: 220 }}>
            <Icon name="search" size={18} className="text-on-surface-variant shrink-0" />
            <input
              className="flex-1 text-sm text-on-surface outline-none bg-transparent"
              placeholder="氏名・社員Noで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-surface rounded-lg overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
          <div className="overflow-x-auto">
          {/* ヘッダー行 */}
          <div className="flex items-center h-12 px-5 gap-3 bg-surface-variant" style={{ minWidth: 1700 }}>
            <span className="w-5 shrink-0" />
            <span className="text-xs font-medium text-on-surface-variant w-[90px] shrink-0">社員No</span>
            <span className="text-xs font-medium text-on-surface-variant w-[110px] shrink-0">氏名</span>
            <span className="text-xs font-medium text-on-surface-variant w-[100px] shrink-0">部門</span>
            <span className="text-xs font-medium text-on-surface-variant w-[60px] shrink-0">役職</span>
            <span className="text-xs font-medium text-on-surface-variant w-[80px] shrink-0">職責</span>
            <span className="text-xs font-medium text-on-surface-variant w-[50px] shrink-0">職階</span>
            <span className="text-xs font-medium text-on-surface-variant w-[60px] shrink-0">群類</span>
            <span className="text-xs font-medium text-on-surface-variant w-[80px] shrink-0">スペック</span>
            <span className="text-xs font-medium text-on-surface-variant w-[50px] shrink-0 text-right">年齢</span>
            <span className="text-xs font-medium text-on-surface-variant w-[100px] shrink-0">定年退職日</span>
            <span className="text-xs font-medium text-on-surface-variant w-[80px] shrink-0">給与地区</span>
            <span className="text-xs font-medium text-on-surface-variant w-[70px] shrink-0">戦力外</span>
            <span className="text-xs font-medium text-on-surface-variant w-[90px] shrink-0">異動計画</span>
            <span className="text-xs font-medium text-on-surface-variant w-[90px] shrink-0">時期</span>
            <span className="text-xs font-medium text-on-surface-variant w-[120px] shrink-0">承認状況</span>
          </div>

          {/* データ行 */}
          {filtered.map((m) => {
            const hasPlan = !!m.transferType;
            const ts = m.transferType ? TRANSFER_TYPE_STYLE[m.transferType] : null;

            return (
              <div
                key={m.id}
                className="flex items-center h-14 px-5 gap-3"
                style={{
                  borderTop: '1px solid #E0E0E0',
                  backgroundColor: m.isConfidential ? '#F3E5F5' : undefined,
                  minWidth: 1700,
                }}
              >
                <span className="w-5 shrink-0 flex items-center justify-center">
                  {m.isConfidential && <Icon name="lock" size={16} className="text-[#7B1FA2]" />}
                </span>
                <span className="text-xs text-on-surface-variant w-[90px] shrink-0">{m.empNo}</span>
                <span className="text-sm font-medium text-on-surface w-[110px] shrink-0 truncate">{m.name}</span>
                <span className="text-sm text-on-surface-variant w-[100px] shrink-0 truncate">{m.dept}</span>
                <span className="text-sm text-on-surface-variant w-[60px] shrink-0">{m.rank}</span>
                <span className="text-xs text-on-surface w-[80px] shrink-0 truncate">{m.jobResponsibility || '—'}</span>
                <span className="text-xs text-on-surface w-[50px] shrink-0">{m.jobGrade || '—'}</span>
                <span className="text-xs text-on-surface w-[60px] shrink-0 truncate">{m.groupType || '—'}</span>
                <span className="text-xs text-on-surface w-[80px] shrink-0 truncate" title={m.spec}>{m.spec || '—'}</span>
                <span className="text-xs text-on-surface w-[50px] shrink-0 text-right">{m.age ?? '—'}</span>
                <span className="text-xs text-on-surface-variant w-[100px] shrink-0">{m.mandatoryRetirementDate || '—'}</span>
                <span className="text-xs text-on-surface-variant w-[80px] shrink-0">{m.salaryRegion || '—'}</span>
                <div className="w-[70px] shrink-0">
                  {m.isInactive ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#FFEBEE', color: '#D32F2F' }} title={m.returnDate ? `復帰: ${m.returnDate}` : ''}>
                      戦力外
                    </span>
                  ) : (
                    <span className="text-xs text-on-surface-variant">—</span>
                  )}
                </div>

                {/* 異動計画 */}
                <div className="flex items-center gap-1 w-[90px] shrink-0 min-w-0">
                  {hasPlan && ts ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ backgroundColor: ts.bg, color: ts.color }}
                    >
                      {m.transferType}
                    </span>
                  ) : (
                    <span className="text-sm text-on-surface-variant">—</span>
                  )}
                </div>

                {/* 時期 */}
                <span className="text-sm text-on-surface w-[90px] shrink-0">{m.transferDate || '—'}</span>

                {/* 承認状況 */}
                <div className="w-[120px] shrink-0">
                  {m.approvalStatus === 'センター長追加' ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: '#EDE7F6', color: '#7B1FA2' }}
                    >
                      <Icon name="lock" size={11} />
                      センター長追加
                    </span>
                  ) : m.approvalStatus ? (
                    <StatusBadge status={m.approvalStatus} />
                  ) : (
                    <span className="text-sm text-on-surface-variant">—</span>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-on-surface-variant">
              <Icon name="search_off" size={40} />
              <p className="text-sm">該当する部員がいません</p>
            </div>
          )}

          {/* フッター */}
          <div className="flex items-center justify-between px-5 h-12 border-t border-outline bg-surface-variant">
            <span className="text-xs text-on-surface-variant">全 {filtered.length} 件</span>
            {confidentialCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-[#7B1FA2]">
                <Icon name="lock" size={13} />
                秘匿情報 {confidentialCount}件を含む
              </span>
            )}
          </div>
        </div>
      </main>
    </CenterPageShell>
  );
}

function MetricCard({
  label, count, color, bg, icon,
}: {
  label: string; count: number; color: string; bg: string; icon: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-lg" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: color + '22' }}>
        <span className={`material-symbols-rounded`} style={{ fontSize: 22, lineHeight: 1, color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color }}>{count}</p>
        <p className="text-xs font-medium" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}
