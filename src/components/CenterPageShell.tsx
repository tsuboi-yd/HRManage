'use client';
import { useEffect, useRef } from 'react';
import AppBar from './AppBar';
import CenterTabBar from './CenterTabBar';
import QuotaSummarySection from './QuotaSummarySection';
import { PlanDeltaProvider, usePlanDeltas } from '@/contexts/PlanDeltaContext';

interface Props {
  children: React.ReactNode;
}

// APIから初期デルタを取得してContextに反映
function DeltaLoader() {
  const { setSourceDeltas } = usePlanDeltas();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    fetch('/api/plan-deltas?orgId=d1')
      .then(r => r.json())
      .then(data => {
        if (data.members) setSourceDeltas('members', data.members);
        if (data.hiring) setSourceDeltas('hiring', data.hiring);
        if (data.transferin) setSourceDeltas('transferin', data.transferin);
      })
      .catch(e => console.error('plan-deltas fetch failed:', e));
  }, [setSourceDeltas]);

  return null;
}

export default function CenterPageShell({ children }: Props) {
  return (
    <PlanDeltaProvider>
      <DeltaLoader />
      <div className="flex flex-col min-h-screen bg-background">
        <AppBar roleIcon="shield_person" roleLabel="センター長：山本部長" showNotification />
        <QuotaSummarySection deptName="開発センター" />
        <CenterTabBar />
        {children}
      </div>
    </PlanDeltaProvider>
  );
}
