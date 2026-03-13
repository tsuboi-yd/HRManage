'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: '転出・退職計画', href: '/members' },
  { label: '転入・採用計画', href: '/retirement-plans' },
  { label: '異動計画詳細', href: '/transfer-plans' },
  { label: '承認状況', href: '/approvals' },
];

export default function TabBar() {
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
