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

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * ✅ 카드 더미 데이터(월별) 생성
 * - 전기/수도/가스/태양광이 “비슷한 모양”으로 보이지 않도록
 *   지표별로 레벨/진폭/계절성을 다르게 부여한다.
 * - 완전 랜덤은 피하고(사용자 경험상 불안정), 월값 기반으로 결정적(deterministic)으로 만든다.
 */
function metricMiniSeries(metric: MetricKey, months: string[]) {
  const ms = months.map((m) => clamp(Number(m), 1, 12));

  const cur = ms.map((m, i) => {
    // 0..1
    const t = (m - 1) / 12;
    // small deterministic jitter per month index
    const jitter = 1.8 * Math.sin((i + 1) * 1.7 + m * 0.35) + 1.2 * Math.cos((i + 1) * 0.9);

    if (metric === "electric") {
      // 완만한 계절성 + 약간의 파동
      const base = 72;
      const season = 6.5 * Math.cos(t * Math.PI * 2); // 겨울/여름 약간 높음
      const wave = 3.4 * Math.sin((m / 12) * Math.PI * 2 + 0.4);
      return Math.round(base + season + wave + jitter);
    }

    if (metric === "water") {
      // 수도는 상대적으로 안정적(변동폭 작게)
      const base = 64;
      const season = 2.2 * Math.sin(t * Math.PI * 2 + 0.8);
      const wave = 1.6 * Math.cos((m / 12) * Math.PI * 2);
      return Math.round(base + season + wave + jitter * 0.6);
    }

    if (metric === "gas") {
      // 가스는 겨울 높고(난방), 여름 낮음
      const base = 70;
      const winterBoost = 10 * Math.cos(t * Math.PI * 2); // 1월 근처 +
      const wave = 2.6 * Math.sin((m / 12) * Math.PI * 4 + 0.2);
      return Math.round(base + winterBoost + wave + jitter * 0.8);
    }

    // solar: 여름 높고 겨울 낮음 (발전량)
    const base = 58;
    const summerBoost = -11 * Math.cos(t * Math.PI * 2); // 7월 근처 +
    const wave = 3.2 * Math.sin((m / 12) * Math.PI * 2 - 0.6);
    return Math.round(base + summerBoost + wave + jitter * 0.7);
  });

  const lastYear = cur.map((v, i) => {
    // 작년은 대체로 조금 낮거나 비슷하되, 모양이 완전히 겹치지 않게 살짝 비틀기
    const wiggle = 2.2 * Math.sin((i + 2) * 1.25) - 1.4 * Math.cos((i + 1) * 0.6);
    const ratio =
      metric === "solar" ? 0.93 :
      metric === "gas" ? 0.90 :
      metric === "water" ? 0.95 :
      0.92;
    return Math.round(v * ratio + 4 + wiggle);
  });

  // 시각적으로 괴상한 값 방지
  return {
    current: cur.map((v) => clamp(v, 30, 98)),
    lastYear: lastYear.map((v) => clamp(v, 25, 95)),
  };
}

function LegendDot({ color }: { color: string }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color }} />;
}

function MetricCard({
  metric,
  title,
  onClick,
}: {
  metric: MetricKey;
  title: string;
  onClick?: () => void;
}) {
  // ✅ 차트와 동일한 색 정의
  const COLOR_THIS_YEAR = "#0EA5E9";  // 올해 (진한)
  const COLOR_LAST_YEAR = "#CBD5E1";  // 작년 (옅은 회색톤)

  const series = metricMiniSeries(metric, MONTHS);

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
          current={series.current}
          lastYear={series.lastYear}
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
        <MetricCard key={m.key} metric={m.key} title={m.title} onClick={() => onSelect?.(m.key)} />
      ))}
    </div>
  );
}
