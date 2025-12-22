// components/dashboard/MiniLineChart.tsx
"use client";

export default function MiniLineChart({
  data,
  height = 160,          // ✅ 기본 높이 줄임
  showMonths = true,      // ✅ 월 표시 옵션
}: {
  data: number[];
  height?: number;
  showMonths?: boolean;
}) {
  const w = 1000;
  const h = 260;          // viewBox 높이도 줄임
  const padX = 40;
  const padY = 26;
  const bottomPad = showMonths ? 36 : 18; // ✅ 월 라벨 자리
  const chartH = h - padY - bottomPad;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);

  const n = data.length;
  const step = (w - padX * 2) / Math.max(1, n - 1);

  const points = data.map((v, i) => {
    const x = padX + i * step;
    const t = (v - min) / range;
    const y = padY + (1 - t) * chartH;
    return { x, y };
  });

  const pts = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${padX},${padY + chartH} L ${pts.replaceAll(" ", " L ")} L ${w - padX},${padY + chartH} Z`;

  const grid = [0, 0.33, 0.66, 1].map((t) => {
    const y = padY + (1 - t) * chartH;
    return <line key={t} x1={padX} x2={w - padX} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="2" />;
  });

  const last = points[points.length - 1];

  // 월 라벨: 1~12 (data 길이에 맞춰)
  const monthLabels = Array.from({ length: n }, (_, i) => `${i + 1}월`);

  return (
    <div
      style={{
        height,
        borderRadius: 14,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <rect x="0" y="0" width={w} height={h} fill="#ffffff" />
        {grid}

        <path d={area} fill="#22c55e" opacity="0.10" />
        <polyline
          points={pts}
          fill="none"
          stroke="#22c55e"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 마지막 점 */}
        <circle cx={last.x} cy={last.y} r="10" fill="#22c55e" opacity="0.25" />
        <circle cx={last.x} cy={last.y} r="6" fill="#22c55e" />

        {/* ✅ 월 표시 */}
        {showMonths &&
          monthLabels.map((txt, i) => {
            const x = padX + i * step;
            const y = padY + chartH + 24;
            // 너무 촘촘하면 홀수만 표시(가독성)
            const show = n <= 8 ? true : i % 2 === 0 || i === n - 1;
            if (!show) return null;
            return (
              <text
                key={txt}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="20"
                fontWeight="800"
                fill="#64748b"
              >
                {txt}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
