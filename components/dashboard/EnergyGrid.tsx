"use client";

import CompareBarChart from "./CompareBarChart"; // ✅ 같은 폴더면 이게 제일 안전함

export type MetricKey = "electric" | "water" | "gas" | "solar";

const METRICS: { key: MetricKey; title: string }[] = [
  { key: "electric", title: "전기 사용량" },
  { key: "water", title: "수도 사용량" },
  { key: "gas", title: "가스 사용량" },
  { key: "solar", title: "태양광 발전량" },
];

const MONTHS = ["10", "11", "12"];

const CARD_H = 220;
const GAP = 12;

function LegendDot({ color }: { color: string }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color }} />;
}

function MetricCard({
  title,
  onClick,
}: {
  title: string;
  onClick?: () => void;
}) {
  // ✅ 차트와 동일한 색 정의
  const COLOR_THIS_YEAR = "#0EA5E9";  // 올해 (진한)
  const COLOR_LAST_YEAR = "#CBD5E1";  // 작년 (옅은 회색톤)

  return (
    <div
      onClick={onClick}
      style={{
        height: CARD_H,
        border: "1px solid #E7E5E4",
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
          {title}
        </div>

        {/* ✅ 범례 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 11,
            color: "#334155",
            fontWeight: 700,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LegendDot color={COLOR_LAST_YEAR} />
            작년
          </span>

          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LegendDot color={COLOR_THIS_YEAR} />
            올해
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, marginTop: 10 }}>
        <CompareBarChart
          height={140}
          months={MONTHS}
          current={[72, 80, 78]}
          lastYear={[68, 76, 74]}
          currentColor={COLOR_THIS_YEAR}
          lastYearColor={COLOR_LAST_YEAR}
          currentSide="right"
        />
      </div>
    </div>
  );
}


export default function EnergyGrid({
  onSelect,
}: {
  onSelect?: (metric: MetricKey) => void;
}) {
  return (
    <div
      style={{
        height: CARD_H * 2 + GAP, // ✅ 이 높이가 왼쪽 카드와 맞아야 함
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gridAutoRows: `${CARD_H}px`,
        gap: GAP,
        minWidth: 0,
      }}
    >
      {METRICS.map((m) => (
        <MetricCard key={m.key} title={m.title} onClick={() => onSelect?.(m.key)} />
      ))}
    </div>
  );
}
