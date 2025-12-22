"use client";

import type { ReactNode } from "react";
import CarbonCard from "@/components/dashboard/CarbonCard";

export default function DashboardTopPanel({ children }: { children: ReactNode }) {
  const GAP = 12;
  const RIGHT_CARD_H = 220;
  const TOTAL_H = RIGHT_CARD_H * 2 + GAP;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(320px, 720px) 1fr",
        gap: GAP,
        alignItems: "stretch",
        width: "100%",
      }}
    >
      {/* 왼쪽 카드 */}
      <CarbonCard
        emittedKg={50}
        reducedKg={40}
        tempC={3}
        heightPx={TOTAL_H}
      />

      {/* 오른쪽 영역 (로그인 / 대시보드 내용) */}
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
