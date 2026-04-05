'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// 年度別 [管理職, 一般正社員, 非正規] のデルタ
type YearDeltas = Record<string, [number, number, number]>;
// ソース別（'members', 'hiring', 'transferin'）
type AllDeltas = Record<string, YearDeltas>;

interface PlanDeltaContextType {
  deltas: AllDeltas;
  setSourceDeltas: (source: string, yearDeltas: YearDeltas) => void;
  /** 全ソース合算の年度別デルタ */
  aggregated: YearDeltas;
}

const PlanDeltaContext = createContext<PlanDeltaContextType>({
  deltas: {},
  setSourceDeltas: () => {},
  aggregated: {},
});

/** 日付文字列（例: '2026年7月'）から年度を返す */
export function getFiscalYear(dateStr: string): string | null {
  const m = dateStr.match(/(\d{4})年(\d{1,2})月/);
  if (!m) return null;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  return String(month >= 4 ? year : year - 1);
}

export function PlanDeltaProvider({ children, initialDeltas }: { children: React.ReactNode; initialDeltas?: AllDeltas }) {
  const [deltas, setDeltas] = useState<AllDeltas>(initialDeltas ?? {});

  const setSourceDeltas = useCallback((source: string, yearDeltas: YearDeltas) => {
    setDeltas(prev => {
      const next = { ...prev, [source]: yearDeltas };
      return next;
    });
  }, []);

  const aggregated = useMemo(() => {
    const result: YearDeltas = {};
    for (const source of Object.values(deltas)) {
      for (const [year, [m, s, n]] of Object.entries(source)) {
        if (!result[year]) result[year] = [0, 0, 0];
        result[year][0] += m;
        result[year][1] += s;
        result[year][2] += n;
      }
    }
    return result;
  }, [deltas]);

  return (
    <PlanDeltaContext.Provider value={{ deltas, setSourceDeltas, aggregated }}>
      {children}
    </PlanDeltaContext.Provider>
  );
}

export function usePlanDeltas() {
  return useContext(PlanDeltaContext);
}
