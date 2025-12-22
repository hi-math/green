"use client";

export type CarbonCardProps = {
  emittedKg: number;
  reducedKg: number;
  tempC: number;
  heightPx?: number;
  maxAbsTemp?: number;
};

function formatNum(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CarbonCard({
  emittedKg,
  reducedKg,
  tempC,
  heightPx,
  maxAbsTemp = 15,
}: CarbonCardProps) {
  const border = "#E7E5E4";
  const text = "#0F172A";
  const sub = "#64748B";
  const navy = "#1F3A8A";

  const t = clamp(tempC, -maxAbsTemp, maxAbsTemp);
  const u = (t + maxAbsTemp) / (2 * maxAbsTemp);
  const ang = Math.PI * (1 - u);

  // ✅ 아래 공간 확보 + 게이지 위로
  const W = 380;
  const H = 260;
  const cx = W / 2;
  const cy = 140;
  const r = 112;

  const startX = cx - r;
  const endX = cx + r;
  const arcPath = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;
  const arcLen = Math.PI * r;

  // ✅ 두께 확실히
  const ARC_WIDTH = 34;

  const SEG = [
    { color: "#7DD3FC", frac: 0.25 },
    { color: "#60A5FA", frac: 0.25 },
    { color: "#A78BFA", frac: 0.25 },
    { color: "#FB7185", frac: 0.25 },
  ] as const;

  // needle wedge
  const outR = r + 26;
  const baseR = 26;
  const halfWidth = 9;

  const dx = Math.cos(ang);
  const dy = -Math.sin(ang);

  const tipX = cx + outR * dx;
  const tipY = cy + outR * dy;

  const baseX = cx + baseR * dx;
  const baseY = cy + baseR * dy;

  const px = -dy;
  const py = dx;

  const leftX = baseX + halfWidth * px;
  const leftY = baseY + halfWidth * py;
  const rightX = baseX - halfWidth * px;
  const rightY = baseY - halfWidth * py;

  const needlePath = `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY} Z`;
  const hubR = 11;

  return (
    <div
      style={{
        height: heightPx ? `${heightPx}px` : "100%",
        border: `1px solid ${border}`,
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: 18,
        alignItems: "stretch",
        overflow: "visible", // ✅ 잘림 방지
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: navy, marginBottom: 10 }}>탄소 현황</div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", paddingTop: 0 }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="carbon temperature gauge">
            {/* base arc */}
            <path d={arcPath} fill="none" stroke="#E5E7EB" strokeWidth={ARC_WIDTH} strokeLinecap="round" />

            {/* segmented arc */}
            {(() => {
              let acc = 0;
              return SEG.map((s, i) => {
                const segLen = arcLen * s.frac;
                const dash = `${segLen} ${arcLen - segLen}`;
                const offset = -(arcLen * acc);
                acc += s.frac;

                return (
                  <path
                    key={i}
                    d={arcPath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={ARC_WIDTH}
                    strokeLinecap="butt"
                    strokeDasharray={dash}
                    strokeDashoffset={offset}
                  />
                );
              });
            })()}

            {/* needle */}
            <path d={needlePath} fill="rgba(15,23,42,0.18)" transform="translate(2,2)" />
            <path d={needlePath} fill="#111827" />

            {/* hub */}
            <circle cx={cx} cy={cy} r={hubR} fill="#111827" />
            <circle cx={cx} cy={cy} r={hubR - 4} fill="#374151" />

            {/* label */}
            <text x={cx} y={cy + 58} textAnchor="middle" style={{ fontSize: 14, fontWeight: 800, fill: sub }}>
              오늘의 탄소온도
            </text>

            {/* number (✅ 안 잘리게) */}
            <text x={cx} y={cy + 104} textAnchor="middle" style={{ fontSize: 40, fontWeight: 950, fill: text }}>
              {Math.round(tempC)}
              <tspan style={{ fontSize: 20, fontWeight: 900, fill: text }}>°</tspan>
            </text>
          </svg>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: 14,
            padding: 16,
            background: "#FBFBFB",
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800, minWidth: 40 }}>발생</div>
            <div style={{ fontSize: 30, fontWeight: 950, color: text, letterSpacing: -0.4 }}>{formatNum(emittedKg)}</div>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800 }}>kgCO₂e</div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800, minWidth: 40 }}>절감</div>
            <div style={{ fontSize: 30, fontWeight: 950, color: "#166534", letterSpacing: -0.4 }}>
              {formatNum(reducedKg)}
            </div>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800 }}>kgCO₂e</div>
          </div>
        </div>
      </div>
    </div>
  );
}
