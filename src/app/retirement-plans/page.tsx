'use client';
import AppBar from '@/components/AppBar';
import TabBar from '@/components/TabBar';

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

export default function RetirementPlansPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="person" roleLabel="部長：田中太郎" />
      <TabBar />
      <main className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
        <Icon name="construction" size={48} className="text-on-surface-variant" />
        <p className="text-on-surface-variant text-sm">退職・採用計画 ページは準備中です</p>
      </main>
    </div>
  );
}
