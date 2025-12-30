"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  height?: number;
  labels: string[]; // x labels (e.g. ["8월","9월",...])
  a: number[]; // series A
  b: number[]; // series B
  aLabel: string;
  bLabel: string;
  aColor?: string;
  bColor?: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function TwoLineChart({
  height = 140,
  labels,
  a,
  b,
  aLabel,
  bLabel,
  aColor = "#0EA5E9",
  bColor = "#8B5CF6",
}: Props) {
  const n = Math.min(labels.length, a.length, b.length);
  const L = labels.slice(0, n);
  const A = a.slice(0, n);
  const B = b.slice(0, n);

  const W = 520;
  const H = 220;
  const padL = 34;
  const padR = 12;
  const padT = 12;
  const padB = 34;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minV = Math.min(...A, ...B, 0);
  const maxV = Math.max(...A, ...B, 1);
  const range = Math.max(1, maxV - minV);

  const stepX = chartW / Math.max(1, n - 1);
  const yFor = (v: number) => padT + (chartH - ((v - minV) / range) * chartH);

  const ptsA = useMemo(() => A.map((v, i) => ({ x: padL + i * stepX, y: yFor(v) })), [n, minV, maxV, range]);
  const ptsB = useMemo(() => B.map((v, i) => ({ x: padL + i * stepX, y: yFor(v) })), [n, minV, maxV, range]);
  const polyA = ptsA.map((p) => `${p.x},${p.y}`).join(" ");
  const polyB = ptsB.map((p) => `${p.x},${p.y}`).join(" ");

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
    const i = Math.round((x - padL) / stepX);
    setHoverI(clamp(i, 0, n - 1));
  }

  return (
    <div style={{ height, borderRadius: 14, border: "1px solid #E7E5E4", background: "#FFFFFF", overflow: "hidden" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-label="two line chart"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverI(null)}
      >
        {/* grid */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = padT + chartH * t;
          return <line key={t} x1={padL} x2={W - padR} y1={y} y2={y} stroke="#E2E8F0" strokeWidth="1" />;
        })}

        <polyline points={polyB} fill="none" stroke={bColor} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" opacity={0.95} />
        <polyline points={polyA} fill="none" stroke={aColor} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />

        {/* x labels */}
        {L.map((txt, i) => {
          const x = padL + i * stepX;
          const show = n <= 8 ? true : i % 2 === 0 || i === n - 1;
          if (!show) return null;
          return (
            <text key={txt} x={x} y={H - 10} textAnchor="middle" style={{ fontSize: 10, fontWeight: 800, fill: "#475569" }}>
              {txt}
            </text>
          );
        })}

        {/* hover tooltip */}
        {hoverI !== null ? (() => {
          const x = padL + hoverI * stepX;
          const tipW = 210;
          const tipH = 46;
          const tipX = clamp(x - tipW / 2, padL, W - padR - tipW);
          const tipY = padT + 6;
          const aV = A[hoverI] ?? 0;
          const bV = B[hoverI] ?? 0;
          return (
            <g>
              <line x1={x} x2={x} y1={padT} y2={padT + chartH} stroke="#94A3B8" strokeWidth="1" opacity="0.45" />
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="12" ry="12" fill="#0f172a" opacity="0.92" />
              <text x={tipX + 12} y={tipY + 18} style={{ fontSize: 11, fontWeight: 900, fill: "#ffffff" }}>
                {L[hoverI]}
              </text>
              <g>
                <circle cx={tipX + 14} cy={tipY + 30} r="4" fill={aColor} />
                <text x={tipX + 24} y={tipY + 34} style={{ fontSize: 11, fontWeight: 800, fill: "#e2e8f0" }}>
                  {aLabel}: {aV}
                </text>
              </g>
              <g>
                <circle cx={tipX + 114} cy={tipY + 30} r="4" fill={bColor} />
                <text x={tipX + 124} y={tipY + 34} style={{ fontSize: 11, fontWeight: 800, fill: "#e2e8f0" }}>
                  {bLabel}: {bV}
                </text>
              </g>
            </g>
          );
        })() : null}
      </svg>
    </div>
  );
}




