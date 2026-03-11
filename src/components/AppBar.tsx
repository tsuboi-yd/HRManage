'use client';
import Link from 'next/link';

interface AppBarProps {
  roleIcon?: string;
  roleLabel: string;
  showNotification?: boolean;
}

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{ fontSize: size, width: size, height: size, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

export default function AppBar({ roleIcon = 'person', roleLabel, showNotification = false }: AppBarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 shrink-0"
      style={{ backgroundColor: '#1976D2', height: 64 }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80">
          <Icon name="menu" className="text-on-primary" />
          <span className="text-on-primary text-xl font-medium">人員計画管理</span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-3 rounded-full"
          style={{ backgroundColor: '#1565C0', height: 32 }}
        >
          <Icon name={roleIcon} size={18} className="text-on-primary" />
          <span className="text-on-primary text-[13px] font-medium">{roleLabel}</span>
        </div>
        {showNotification && (
          <Icon name="notifications" className="text-on-primary" />
        )}
      </div>
    </header>
  );
}
