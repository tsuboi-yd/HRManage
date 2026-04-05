import Link from 'next/link';

const ROLES = [
  {
    role: '部長',
    color: '#1976D2',
    bg: '#E3F2FD',
    icon: 'person',
    screens: [
      { href: '/members',          title: '転出・退職計画',   desc: 'チームメンバーの異動・退職計画を入力',     icon: 'group' },
      { href: '/retirement-plans', title: '転入・採用計画',   desc: '転入受入・採用計画を登録・管理',           icon: 'person_add' },
      { href: '/transfer-plans',   title: '異動計画一覧',     desc: '転出・転入をまとめて一覧確認',             icon: 'swap_horiz' },
      { href: '/approvals',        title: '承認状況',         desc: '申請した計画の承認フローを確認・操作',     icon: 'approval' },
    ],
  },
  {
    role: 'センター長',
    color: '#7B1FA2',
    bg: '#EDE7F6',
    icon: 'shield_person',
    screens: [
      { href: '/center-manager/members', title: '部員一覧',         desc: '全部門のメンバーと計画を横断確認',         icon: 'groups' },
      { href: '/center-manager',         title: '異動計画 確認・修正', desc: '部門横断の異動計画を確認・承認・秘匿登録', icon: 'fact_check' },
      { href: '/analytics',              title: '分析',             desc: 'スナップショットで計画と実績の差分を分析', icon: 'analytics' },
    ],
  },
  {
    role: '企画',
    color: '#E65100',
    bg: '#FBE9E7',
    icon: 'insights',
    screens: [
      { href: '/analytics', title: '分析', desc: 'スナップショットで計画と実績の差分を分析', icon: 'analytics' },
    ],
  },
  {
    role: '人事部',
    color: '#00796B',
    bg: '#E0F2F1',
    icon: 'admin_panel_settings',
    screens: [
      { href: '/hr',        title: '人事 最終承認', desc: '全センターの異動・採用計画に最終承認',         icon: 'how_to_reg' },
      { href: '/analytics', title: '分析',         desc: 'スナップショットで計画と実績の差分を分析', icon: 'analytics' },
    ],
  },
];

import Icon from '@/components/Icon';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header
        className="flex items-center px-6 gap-4"
        style={{ backgroundColor: '#1976D2', height: 64 }}
      >
        <span className="text-white"><Icon name="menu" /></span>
        <span className="text-white text-xl font-medium">人員計画管理</span>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-medium text-on-surface mb-1">画面一覧</h1>
        <p className="text-sm text-on-surface-variant mb-8">ロールを選択して画面に進んでください</p>

        <div className="flex flex-col gap-8">
          {ROLES.map((r) => (
            <section key={r.role}>
              {/* ロールヘッダー */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: r.color }}
                >
                  <span className="text-white"><Icon name={r.icon} size={16} /></span>
                </div>
                <span className="text-base font-semibold" style={{ color: r.color }}>{r.role}</span>
              </div>

              {/* スクリーンカード */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {r.screens.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex flex-col gap-2 bg-surface border border-outline rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: r.bg }}
                    >
                      <span style={{ color: r.color }}><Icon name={s.icon} size={18} /></span>
                    </div>
                    <p className="text-sm font-medium text-on-surface leading-snug">{s.title}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
