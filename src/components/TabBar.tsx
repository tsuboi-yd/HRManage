'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS: { label: string; href: string; badge?: { text: string; color: string } }[] = [
  { label: '転出・退職計画', href: '/members' },
  { label: '転入・採用計画', href: '/retirement-plans', badge: { text: '!', color: '#F57C00' } },
  { label: '異動計画一覧', href: '/transfer-plans' },
  { label: '承認状況', href: '/approvals', badge: { text: '3', color: '#D32F2F' } },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="flex items-center px-6 shrink-0"
      style={{ backgroundColor: '#37474F', height: 48 }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            scroll={false}
            className="flex items-center gap-1.5 h-12 px-5 text-sm transition-colors"
            style={{
              color: active ? '#FFFFFF' : '#90A4AE',
              fontWeight: active ? 600 : 500,
              backgroundColor: active ? '#455A64' : 'transparent',
              borderRadius: active ? '6px 6px 0 0' : undefined,
              boxShadow: active ? 'inset 0 -3px 0 0 #64B5F6' : 'none',
            }}
          >
            {tab.label}
            {tab.badge && !active && (
              <span
                className="flex items-center justify-center text-[11px] font-bold text-white px-1.5 py-px rounded-lg"
                style={{ backgroundColor: tab.badge.color, opacity: 0.9, minWidth: 18 }}
              >
                {tab.badge.text}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
