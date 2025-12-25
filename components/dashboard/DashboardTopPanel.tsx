// components/dashboard/DashboardTopPanel.tsx
"use client";

import type { ReactNode } from "react";
import CarbonCard from "@/components/dashboard/CarbonCard";

export default function DashboardTopPanel({
  children,
  signalSumPercent,
}: {
  children: ReactNode;
  signalSumPercent?: number | null;
}) {
  const GAP = 12;
  const RIGHT_CARD_H = 220;
  const TOTAL_H = RIGHT_CARD_H * 2 + GAP;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(360px, 35%) 1fr",
        gap: GAP,
        alignItems: "stretch",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* 왼쪽: 탄소 현황 카드 */}
      <div style={{ minWidth: 0 }}>
        <CarbonCard emittedKg={50} reducedKg={40} tempC={3} heightPx={TOTAL_H} signalSumPercent={signalSumPercent} />
      </div>

      {/* 오른쪽: 에너지 2x2 등 */}
      <div style={{ minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
