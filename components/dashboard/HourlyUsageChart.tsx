"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  height?: number;
  hours?: number[]; // ex) [6..20]
  // today / 7-days-ago
  today?: number[]; // same length as hours
  weekAgo?: number[]; // same length as hours
  todayColor?: string;
  weekAgoColor?: string;
  dateLabel?: string; // ex) "12월 28일"
  /**
   * If true, only render up to (current hour - 1) to avoid showing "future" usage.
   * Defaults to true.
   */
  limitToPreviousHour?: boolean;
};

function defaultHours() {
  return Array.from({ length: 15 }, (_, i) => 6 + i); // 6..20
}

function mockValues(n: number) {
  // deterministic-ish profile: morning ramp -> noon peak -> afternoon taper
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1); // 0..1
    const peak = Math.exp(-Math.pow((t - 0.55) / 0.22, 2)); // gaussian-ish
    const wave = 0.35 * Math.sin(i * 0.9) + 0.2 * Math.cos(i * 0.55);
    const v = 18 + 32 * peak + 8 * wave;
    return Math.max(2, Math.round(v));
  });
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function HourlyUsageChart({
  height = 220,
  hours = defaultHours(),
  today,
  weekAgo,
  todayColor = "#0EA5E9",
  weekAgoColor = "#94A3B8",
  dateLabel = "12월 28일",
  limitToPreviousHour = true,
}: Props) {
  // Keep x-axis fixed (6~20) but limit ONLY today's series to (currentHour - 1).
  const baseN = Math.min(hours.length, today?.length ?? hours.length, weekAgo?.length ?? hours.length);
  const H = hours.slice(0, baseN);
  const n = H.length;

  const cutoffHour = useMemo(() => {
    if (!limitToPreviousHour) return Infinity;
    const now = new Date();
    return now.getHours() - 1; // 오늘은 1시간 전까지만
  }, [limitToPreviousHour]);

  const lastTodayIndex = useMemo(() => {
    let last = -1;
    for (let i = 0; i < H.length; i++) {
      if ((H[i] ?? 0) <= cutoffHour) last = i;
    }
    return last;
  }, [H, cutoffHour]);

  const T = (today?.slice(0, baseN) ?? mockValues(baseN)).map((x) => (Number.isFinite(x) ? x : 0));
  // Make week-ago line visibly different (still plausible): lower overall + slightly different shape.
  const W7 = (
    weekAgo?.slice(0, baseN) ??
    mockValues(baseN).map((v, i) => {
      const wave = 6 * Math.sin(i * 0.75) - 4 * Math.cos(i * 0.35);
      return Math.max(1, Math.round(v * 0.78 + 8 + wave));
    })
  ).map((x) => (Number.isFinite(x) ? x : 0));

  const W = 520;
  const viewH = 240;
  const padL = 38;
  const padR = 12;
  const padT = 14;
  const padB = 38;

  const chartW = W - padL - padR;
  const chartH = viewH - padT - padB;

  // Y-axis padding: show min a bit lower so variation reads better.
  // Scale should be based on visible data (today up to cutoff) + full weekAgo.
  const TScale = lastTodayIndex >= 0 ? T.slice(0, lastTodayIndex + 1) : [];
  const rawMin = Math.min(...TScale, ...W7, 0);
  const minV = Math.max(0, rawMin - 5);
  const maxV = Math.max(...TScale, ...W7, 1);
  const range = Math.max(1, maxV - minV);
  const scaleY = (v: number) => ((v - minV) / range) * chartH;

  const grid = "#E2E8F0";
  const axisText = "#475569";

  function pickStep(span: number) {
    // Prefer 10/50/100-like steps
    const candidates = [1, 2, 5, 10, 20, 50, 100, 200, 500];
    // target about 4~6 lines
    const target = span / 5;
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
  const startTick = Math.ceil(minV / step) * step;
  const ticks: number[] = [];
  for (let v = startTick; v <= maxV + 0.0001; v += step) ticks.push(Math.round(v));

  const stepX = chartW / Math.max(1, n - 1);
  const ptsToday = useMemo(
    () =>
      H.map((_, i) => {
        const x = padL + i * stepX;
        const y = padT + (chartH - scaleY(T[i] ?? 0));
        return { x, y };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, chartW, chartH, minV, maxV]
  );
  const ptsWeekAgo = useMemo(
    () =>
      H.map((_, i) => {
        const x = padL + i * stepX;
        const y = padT + (chartH - scaleY(W7[i] ?? 0));
        return { x, y };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, chartW, chartH, minV, maxV]
  );

  const polyToday = ptsToday.map((p) => `${p.x},${p.y}`).join(" ");
  const polyWeekAgo = ptsWeekAgo.map((p) => `${p.x},${p.y}`).join(" ");

  const polyTodayLimited = useMemo(() => {
    if (lastTodayIndex < 0) return "";
    return ptsToday.slice(0, lastTodayIndex + 1).map((p) => `${p.x},${p.y}`).join(" ");
  }, [ptsToday, lastTodayIndex]);

  // NOTE: area fill removed per UI request (keep only lines)

  // Peak band should be based on week-ago peak (요구사항)
  const peakIndex = useMemo(() => {
    let bestI = 0;
    let bestV = -Infinity;
    for (let i = 0; i < W7.length; i++) {
      const v = W7[i] ?? 0;
      if (v > bestV) {
        bestV = v;
        bestI = i;
      }
    }
    return bestI;
  }, [W7]);

  // Highlight band: peak hour ± 1h => [i-1, i+1] in x-space
  const peakBand = useMemo(() => {
    const xCenter = padL + peakIndex * stepX;
    const x0 = clamp(xCenter - stepX, padL, padL + chartW);
    const x1 = clamp(xCenter + stepX, padL, padL + chartW);
    return { x0, x1, hour: H[peakIndex] ?? null };
  }, [H, peakIndex, stepX]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverI, setHoverI] = useState<number | null>(null);

  function clientToSvgX(clientX: number) {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width) return null;
    const x = ((clientX - r.left) / r.width) * W;
    return x;
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const x = clientToSvgX(e.clientX);
    if (x === null) return;
    const i = Math.round((x - padL) / stepX);
    setHoverI(clamp(i, 0, n - 1));
  }

  function onLeave() {
    setHoverI(null);
  }

  return (
    <div
      style={{
        height,
        borderRadius: 14,
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${viewH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-label="hourly usage chart"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* peak band highlight */}
        <rect x={peakBand.x0} y={padT} width={peakBand.x1 - peakBand.x0} height={chartH} fill="#FDE68A" opacity="0.35" />

        {/* y grid + labels (10/50/100-like) */}
        {ticks.map((v) => {
          const y = padT + (chartH - scaleY(v));
          return (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={grid} strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10, fontWeight: 800, fill: axisText }}>
                {v}
              </text>
            </g>
          );
        })}

        {/* lines (weekAgo behind, today on top) */}
        <polyline points={polyWeekAgo} fill="none" stroke={weekAgoColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity={0.95} />
        {polyTodayLimited ? (
          <polyline points={polyTodayLimited} fill="none" stroke={todayColor} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        ) : null}

        {/* points + x ticks */}
        {H.map((hr, i) => {
          const pT = ptsToday[i];
          const pW = ptsWeekAgo[i];
          const showTick = hr === 6 || hr === 20 || hr % 2 === 0;
          if (!pT || !pW) return null;
          return (
            <g key={hr}>
              {/* week ago point */}
              <circle cx={pW.x} cy={pW.y} r="4.2" fill={weekAgoColor} opacity={0.22} />
              <circle cx={pW.x} cy={pW.y} r="2.4" fill={weekAgoColor} opacity={0.95} />

              {/* today point */}
              {i <= lastTodayIndex ? (
                <>
                  <circle cx={pT.x} cy={pT.y} r="5" fill={todayColor} opacity={0.22} />
                  <circle cx={pT.x} cy={pT.y} r="2.8" fill={todayColor} />
                </>
              ) : null}

              {showTick ? (
                <text x={pT.x} y={viewH - 14} textAnchor="middle" style={{ fontSize: 10, fontWeight: 900, fill: axisText }}>
                  {hr}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* hover guide + tooltip */}
        {hoverI !== null ? (() => {
          const hr = H[hoverI] ?? null;
          const x = padL + hoverI * stepX;
          const yT = ptsToday[hoverI]?.y ?? padT;
          const yW = ptsWeekAgo[hoverI]?.y ?? padT;
          const vT = hoverI <= lastTodayIndex ? (T[hoverI] ?? 0) : null;
          const vW = W7[hoverI] ?? 0;

          const tipW = 180;
          const tipH = 56;
          const tipX = clamp(x + 12, padL, W - padR - tipW);
          const tipY = clamp(Math.min(yT, yW) - (tipH + 10), padT, padT + chartH - tipH);

          return (
            <g>
              <line x1={x} x2={x} y1={padT} y2={padT + chartH} stroke="#94A3B8" strokeWidth="1" opacity="0.55" />

              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="12" ry="12" fill="#0f172a" opacity="0.92" />
              <text x={tipX + 12} y={tipY + 20} style={{ fontSize: 11, fontWeight: 900, fill: "#ffffff" }}>
                {dateLabel} · {hr}시
              </text>

              <g>
                <circle cx={tipX + 14} cy={tipY + 34} r="4" fill={todayColor} />
                <text x={tipX + 24} y={tipY + 38} style={{ fontSize: 11, fontWeight: 800, fill: "#e2e8f0" }}>
                  오늘: {vT === null ? "—" : `${vT} kWh`}
                </text>
              </g>

              <g>
                <circle cx={tipX + 14} cy={tipY + 48} r="4" fill={weekAgoColor} />
                <text x={tipX + 24} y={tipY + 52} style={{ fontSize: 11, fontWeight: 800, fill: "#e2e8f0" }}>
                  지난주: {vW} kWh
                </text>
              </g>
            </g>
          );
        })() : null}

        {/* x axis label removed (keep chart clean) */}
      </svg>
    </div>
  );
}


