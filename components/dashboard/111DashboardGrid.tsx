// components/dashboard/DashboardGrid.tsx
"use client";

import CarbonCard from "@/components/dashboard/CarbonCard";
import EnergyGrid from "@/components/dashboard/EnergyGrid";
import type { MetricKey } from "@/components/dashboard/types";

const GAP = 12;
const CARD_H = 220;

function SummaryCard({ title }: { title: string }) {
  return (
    <div
      style={{
        height: CARD_H,
        border: "1px solid #E7E5E4",
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#64748B" }}>내용 영역</div>
      <div style={{ flex: 1 }} />
    </div>
  );
}

export default function DashboardGrid({
  onSelect,
}: {
  onSelect?: (metric: MetricKey) => void;
}) {
  const LEFT_W = "minmax(360px, 35%)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${LEFT_W} 1fr`,
        gap: GAP,
        alignItems: "stretch",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* 1행-왼쪽: 탄소현황(큰 카드) */}
      <CarbonCard emittedKg={50} reducedKg={40} tempC={3} heightPx={CARD_H * 2 + GAP} />

      {/* 1행-오른쪽: 에너지 2×2 */}
      <div style={{ minWidth: 0 }}>
        <EnergyGrid onSelect={onSelect} />
      </div>

<div
  style={{
    gridColumn: "1 / -1", // ✅ 왼쪽+오른쪽 컬럼 모두 차지
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: GAP,
  }}
>
  <SummaryCard title="전체 요약" />
  <SummaryCard title="행동" />
  <SummaryCard title="문화" />
  <SummaryCard title="환경" />
</div>

    </div>
  );
}
