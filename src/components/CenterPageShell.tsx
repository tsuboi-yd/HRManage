'use client';
import AppBar from './AppBar';
import CenterTabBar from './CenterTabBar';

interface Props {
  children: React.ReactNode;
}

export default function CenterPageShell({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar roleIcon="shield_person" roleLabel="センター長：山本部長" showNotification />
      <CenterTabBar />
      {children}
    </div>
  );
}
