"use client";

type Props = {
  height: number;
  months: string[];
  current: number[];
  lastYear: number[];
  currentColor?: string;     // 올해 색
  lastYearColor?: string;    // 작년 색(옅은 회색톤)
  currentSide?: "left" | "right"; // 올해 막대 위치
};

export default function CompareBarChart({
  height = 140,
  months = ["10", "11", "12"],
  current = [72, 80, 78],
  lastYear = [68, 76, 74],

  // ✅ 여기서 실제로 props를 “받고”
  currentColor = "#0EA5E9",  // 올해(진한)
  lastYearColor = "#CBD5E1", // 작년(회색기+옅게)
  currentSide = "right",     // ✅ 올해는 오른쪽
}: Props) {
  // ✅ 길이 안전장치 (months 기준으로 정렬)
  const n = Math.min(months.length, current.length, lastYear.length);
  const M = months.slice(0, n);
  const C = current.slice(0, n);
  const L = lastYear.slice(0, n);

  const W = 520;
  const H = height;

  const padL = 18;
  const padR = 12;
  const padT = 10;
  const padB = 26;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxV = Math.max(...C, ...L, 1);
  const scaleY = (v: number) => (v / maxV) * chartH;

  const groupW = chartW / Math.max(1, n);

  const barW = Math.min(38, groupW * 0.28);
  const gap = Math.min(14, groupW * 0.12);

  // ✅ 이 색이 실제로 사용되도록 연결
  const curFill = currentColor;
  const lastFill = lastYearColor;

  const grid = "#E2E8F0";
  const axisText = "#475569";

  const gridLines = 4;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: "block",
        borderRadius: 14,
        border: "1px solid #E7E5E4",
        background: "#FFFFFF",
      }}
      aria-label="compare bar chart"
    >
      {/* grid */}
      {Array.from({ length: gridLines }).map((_, i) => {
        const y = padT + (chartH * (i + 1)) / gridLines;
        return <line key={i} x1={padL} x2={W - padR} y1={y} y2={y} stroke={grid} strokeWidth="1" />;
      })}

      {/* bars */}
      {M.map((mo, i) => {
        const baseX = padL + i * groupW;
        const cx = baseX + groupW / 2;

        const curH = scaleY(C[i] ?? 0);
        const lastH = scaleY(L[i] ?? 0);

        const yCur = padT + (chartH - curH);
        const yLast = padT + (chartH - lastH);

        const r = 10;

        // ✅ 막대 좌우 위치 결정: 올해가 오른쪽이면
        // 왼쪽=작년, 오른쪽=올해
        const leftX = cx - (barW + gap / 2);
        const rightX = cx + gap / 2;

        const curX = currentSide === "right" ? rightX : leftX;
        const lastX = currentSide === "right" ? leftX : rightX;

        return (
          <g key={`${mo}-${i}`}>
            {/* 작년 */}
            <rect x={lastX} y={yLast} width={barW} height={lastH} rx={r} ry={r} fill={lastFill} />
            {/* 올해 */}
            <rect x={curX} y={yCur} width={barW} height={curH} rx={r} ry={r} fill={curFill} />

            <text x={cx} y={H - 8} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: axisText }}>
              {mo}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
