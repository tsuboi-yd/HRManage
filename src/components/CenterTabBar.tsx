'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: '部員一覧',       href: '/center-manager/members' },
  { label: '異動計画 確認・修正', href: '/center-manager' },
];

export default function CenterTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="flex items-end px-6 shrink-0"
      style={{ backgroundColor: '#1976D2', height: 48 }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center h-12 px-5 text-sm font-medium"
            style={{
              color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
              boxShadow: active ? 'inset 0 -3px 0 0 #FFFFFF' : 'none',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
