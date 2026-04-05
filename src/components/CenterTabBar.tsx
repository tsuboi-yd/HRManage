'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: '部員一覧',           href: '/center-manager/members' },
  { label: '異動計画 確認・修正', href: '/center-manager' },
];

export default function CenterTabBar() {
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
            className="flex items-center h-12 px-5 text-sm transition-colors"
            style={{
              color: active ? '#FFFFFF' : '#90A4AE',
              fontWeight: active ? 600 : 500,
              backgroundColor: active ? '#455A64' : 'transparent',
              borderRadius: active ? '6px 6px 0 0' : undefined,
              boxShadow: active ? 'inset 0 -3px 0 0 #64B5F6' : 'none',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
