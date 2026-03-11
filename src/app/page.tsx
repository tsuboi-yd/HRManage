import Link from 'next/link';

const SCREENS = [
  {
    href: '/members',
    title: '部員一覧',
    desc: '部長View — チームメンバーの一覧・ステータス確認',
    icon: 'groups',
    role: '部長',
    color: '#1976D2',
  },
  {
    href: '/transfer-plans',
    title: '異動計画入力',
    desc: '部長View — 異動計画の作成・編集',
    icon: 'swap_horiz',
    role: '部長',
    color: '#1976D2',
  },
  {
    href: '/center-review',
    title: 'センター長確認・修正',
    desc: '全部門の異動計画を確認・修正・承認',
    icon: 'shield_person',
    role: 'センター長',
    color: '#7B1FA2',
  },
  {
    href: '/dest-approval',
    title: '受入異動 承認',
    desc: '異動先部長View — 受入候補の承認・差戻',
    icon: 'how_to_reg',
    role: '異動先部長',
    color: '#1976D2',
  },
  {
    href: '/hr-approval',
    title: '人事 最終承認',
    desc: '全センターの最終承認・却下',
    icon: 'admin_panel_settings',
    role: '人事部',
    color: '#1976D2',
  },
  {
    href: '/snapshot',
    title: '人員スナップショット・差分分析',
    desc: '実人員と計画の差分をドリルダウン確認',
    icon: 'analytics',
    role: '人事部',
    color: '#1976D2',
  },
];

function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      className="material-symbols-rounded"
      style={{ fontSize: size, width: size, height: size, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header
        className="flex items-center px-6 gap-4"
        style={{ backgroundColor: '#1976D2', height: 64 }}
      >
        <Icon name="menu" size={24} />
        <span className="text-white text-xl font-medium">人員計画管理</span>
      </header>
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-medium text-on-surface mb-2">画面一覧</h1>
        <p className="text-sm text-on-surface-variant mb-8">各ロール・ワークフローの画面を選択してください</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCREENS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block bg-surface border border-outline rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: s.color }}
              >
                <Icon name={s.icon} size={20} />
              </div>
              <div
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: '#E3F2FD', color: s.color }}
              >
                {s.role}
              </div>
              <h2 className="text-base font-medium text-on-surface mb-1">{s.title}</h2>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
