"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  height?: number;
  months: string[]; // ["7월","8월",...]
  current: number[]; // 올해
  lastYear: number[]; // 작년
  district: number[]; // 구로구 등
  seoul: number[]; // 서울시
  districtLabel: string;
  currentLabel?: string;
  lastYearLabel?: string;
  seoulLabel?: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function roundedTopRectPath(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.max(0, Math.min(r, w / 2, h));
  const x0 = x;
  const x1 = x + w;
  const y0 = y;
  const y1 = y + h;
  // bottom corners are square; only top corners are rounded
  return [
    `M ${x0} ${y1}`,
    `L ${x0} ${y0 + rr}`,
    `Q ${x0} ${y0} ${x0 + rr} ${y0}`,
    `L ${x1 - rr} ${y0}`,
    `Q ${x1} ${y0} ${x1} ${y0 + rr}`,
    `L ${x1} ${y1}`,
    "Z",
  ].join(" ");
}

export default function MonthlyElectricComboChart({
  height = 320,
  months,
  current,
  lastYear,
  district,
  seoul,
  districtLabel,
  currentLabel = "올해",
  lastYearLabel = "작년",
  seoulLabel = "서울시",
}: Props) {
  const n = Math.min(months.length, current.length, lastYear.length, district.length, seoul.length);
  const M = months.slice(0, n);
  const C = current.slice(0, n);
  const L = lastYear.slice(0, n);
  const D = district.slice(0, n);
  const S = seoul.slice(0, n);

  const W = 720;
  const H = 360;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 42;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const groupW = chartW / Math.max(1, n);

  const dataMax = Math.max(...C, ...L, ...D, ...S, 1);
  // Add headroom so the chart doesn't look "packed"
  const maxV = Math.ceil(dataMax * 1.2);
  const minV = 0;
  const range = Math.max(1, maxV - minV);
  const yFor = (v: number) => padT + (chartH - ((v - minV) / range) * chartH);

  const barW = Math.min(26, groupW * 0.22);
  const gap = 0; // remove space between the two bars in a month

  // Better contrast
  // Bars should match HourlyUsageChart palette
  const colBarThis = "#0EA5E9"; // 오늘
  const colBarLast = "#94A3B8"; // 지난주
  const colLineDistrict = "#FF6F5A"; // coral (district)
  const colLineSeoul = "#FFE5B1"; // sand (seoul)
  const colLineSeoulOutline = "#3D9AAE"; // teal outline to keep seoul visible

  const ptsDistrict = useMemo(
    () => D.map((v, i) => ({ x: padL + i * groupW + groupW / 2, y: yFor(v) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, maxV]
  );
  const ptsSeoul = useMemo(
    () => S.map((v, i) => ({ x: padL + i * groupW + groupW / 2, y: yFor(v) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, maxV]
  );
  const polyDistrict = ptsDistrict.map((p) => `${p.x},${p.y}`).join(" ");
  const polySeoul = ptsSeoul.map((p) => `${p.x},${p.y}`).join(" ");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverI, setHoverI] = useState<number | null>(null);

  function clientToSvgX(clientX: number) {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width) return null;
    return ((clientX - r.left) / r.width) * W;
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const x = clientToSvgX(e.clientX);
    if (x === null) return;
    const i = Math.floor((x - padL) / groupW);
    setHoverI(clamp(i, 0, n - 1));
  }

  const axisText = "#475569";
  const grid = "#E2E8F0";

  const baselineY = padT + chartH;
  function pickStep(span: number) {
    // Prefer 10/50/100-like steps
    const candidates = [10, 20, 50, 100, 200, 500, 1000];
    const target = span / 5; // aim for ~5 grid lines
    let best = candidates[0]!;
    let bestDiff = Infinity;
    for (const c of candidates) {
      const diff = Math.abs(c - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = c;
      }
    }
    return best;
  }

  const step = pickStep(maxV - minV);
  const yTicks: { v: number; y: number }[] = [];
  for (let v = 0; v <= maxV + 0.0001; v += step) {
    const vv = Math.round(v);
    yTicks.push({ v: vv, y: yFor(vv) });
  }

  // gradients removed per request

  return (
    <div style={{ height, borderRadius: 14, background: "#FFFFFF", overflow: "hidden" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-label="monthly electric combo chart"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverI(null)}
      >
        <defs>
          <filter id="neonDistrict" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.0" floodColor={colLineDistrict} floodOpacity="0.55" />
            <feDropShadow dx="0" dy="0" stdDeviation="5.0" floodColor={colLineDistrict} floodOpacity="0.22" />
          </filter>
          <filter id="neonSeoul" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.0" floodColor={colLineSeoulOutline} floodOpacity="0.40" />
            <feDropShadow dx="0" dy="0" stdDeviation="5.0" floodColor={colLineSeoulOutline} floodOpacity="0.18" />
          </filter>
        </defs>

        {/* y-axis */}
        <line x1={padL} x2={padL} y1={padT} y2={baselineY} stroke="#CBD5E1" strokeWidth="1" />
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke={grid} strokeWidth="1" />
            <text x={padL - 8} y={t.y + 4} textAnchor="end" style={{ fontSize: 10, fontWeight: 800, fill: axisText }}>
              {t.v}
            </text>
          </g>
        ))}

        {/* (grid handled by yTicks to align with y-axis) */}

        {/* bars */}
        {M.map((mo, i) => {
          const baseX = padL + i * groupW;
          const cx = baseX + groupW / 2;

          const curH = ((C[i] ?? 0) / maxV) * chartH;
          const lastH = ((L[i] ?? 0) / maxV) * chartH;
          const yCur = padT + (chartH - curH);
          const yLast = padT + (chartH - lastH);

          // touching bars
          const effectiveBarW = Math.min(34, groupW * 0.44); // thicker bars
          const leftX = cx - effectiveBarW;
          const rightX = cx;
          const r = 7; // top-only rounding

          const pLast = roundedTopRectPath(leftX, yLast, effectiveBarW, lastH, r);
          const pCur = roundedTopRectPath(rightX, yCur, effectiveBarW, curH, r);

          return (
            <g key={`${mo}-${i}`}>
              {pLast ? <path d={pLast} fill={colBarLast} /> : null}
              {pCur ? <path d={pCur} fill={colBarThis} /> : null}

              {/* bar markers (small dots on top) */}
              <circle cx={leftX + effectiveBarW / 2} cy={yLast} r="3.6" fill={colBarLast} opacity={0.95} />
              <circle cx={rightX + effectiveBarW / 2} cy={yCur} r="3.6" fill={colBarThis} opacity={0.95} />

              <text x={cx} y={H - 10} textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: axisText }}>
                {mo}
              </text>
            </g>
          );
        })}

        {/* dotted lines */}
        {/* seoul: add outline for readability */}
        <polyline
          points={polySeoul}
          fill="none"
          stroke={colLineSeoulOutline}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.35}
        />
        <polyline
          points={polyDistrict}
          fill="none"
          stroke={colLineDistrict}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.95}
        />
        <polyline
          points={polySeoul}
          fill="none"
          stroke={colLineSeoul}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.95}
        />

        {/* month dots on lines */}
        {ptsDistrict.map((p, i) => (
          <g key={`d-${i}`}>
            <circle cx={p.x} cy={p.y} r="7.2" fill={colLineDistrict} opacity={0.14} filter="url(#neonDistrict)" />
            <circle cx={p.x} cy={p.y} r="5.0" fill={colLineDistrict} opacity={0.20} />
            <circle cx={p.x} cy={p.y} r="3.6" fill={colLineDistrict} stroke="#ffffff" strokeWidth="1.8" filter="url(#neonDistrict)" />
          </g>
        ))}
        {ptsSeoul.map((p, i) => (
          <g key={`s-${i}`}>
            <circle cx={p.x} cy={p.y} r="7.2" fill={colLineSeoulOutline} opacity={0.14} filter="url(#neonSeoul)" />
            <circle cx={p.x} cy={p.y} r="5.0" fill={colLineSeoul} opacity={0.22} />
            <circle cx={p.x} cy={p.y} r="3.6" fill={colLineSeoul} stroke={colLineSeoulOutline} strokeWidth="1.6" filter="url(#neonSeoul)" />
          </g>
        ))}

        {/* hover tooltip */}
        {hoverI !== null ? (() => {
          const mo = M[hoverI] ?? "";
          const cx = padL + hoverI * groupW + groupW / 2;
          const tipW = 280;
          const tipH = 72;
          const tipX = clamp(cx - tipW / 2, padL, W - padR - tipW);
          const tipY = padT + 6;

          const colText = "#e2e8f0";
          const row1Y = tipY + 34;
          const row2Y = tipY + 54;
          const col1X = tipX + 12;
          const col2X = tipX + 148;

          return (
            <g>
              <line x1={cx} x2={cx} y1={padT} y2={padT + chartH} stroke="#94A3B8" strokeWidth="1" opacity="0.45" />
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="12" ry="12" fill="#0f172a" opacity="0.92" />
              <text x={tipX + 12} y={tipY + 18} style={{ fontSize: 11, fontWeight: 900, fill: "#ffffff" }}>
                {mo}
              </text>

              {/* 2x2 tooltip layout */}
              <g>
                <circle cx={col1X + 4} cy={row1Y - 4} r="4" fill={colBarLast} />
                <text x={col1X + 14} y={row1Y} style={{ fontSize: 11, fontWeight: 800, fill: colText }}>
                  {lastYearLabel}: {L[hoverI] ?? 0}
                </text>
              </g>
              <g>
                <circle cx={col2X + 4} cy={row1Y - 4} r="4" fill={colBarThis} />
                <text x={col2X + 14} y={row1Y} style={{ fontSize: 11, fontWeight: 800, fill: colText }}>
                  {currentLabel}: {C[hoverI] ?? 0}
                </text>
              </g>
              <g>
                <circle cx={col1X + 4} cy={row2Y - 4} r="4" fill={colLineDistrict} />
                <text x={col1X + 14} y={row2Y} style={{ fontSize: 11, fontWeight: 800, fill: colText }}>
                  {districtLabel}: {D[hoverI] ?? 0}
                </text>
              </g>
              <g>
                <circle cx={col2X + 4} cy={row2Y - 4} r="4" fill={colLineSeoul} stroke={colLineSeoulOutline} strokeWidth="1.5" />
                <text x={col2X + 14} y={row2Y} style={{ fontSize: 11, fontWeight: 800, fill: colText }}>
                  {seoulLabel}: {S[hoverI] ?? 0}
                </text>
              </g>
            </g>
          );
        })() : null}
      </svg>
    </div>
  );
}


