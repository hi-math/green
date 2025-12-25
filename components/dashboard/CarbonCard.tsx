"use client";

export type CarbonCardProps = {
  emittedKg: number;
  reducedKg: number;
  tempC: number;
  heightPx?: number;
  signalSumPercent?: number | null;
};

function formatNum(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

type Light = "red" | "yellow" | "green";

export default function CarbonCard({
  emittedKg,
  reducedKg,
  tempC,
  heightPx,
  signalSumPercent,
}: CarbonCardProps) {
  const border = "#E7E5E4";
  const text = "#0F172A";
  const sub = "#64748B";
  const navy = "#1F3A8A";

  const COLORS: Record<Light, { on: string; off: string; label: string }> = {
    red: { on: "#FF2A2A", off: "#3A0B0B", label: "경고" },
    yellow: { on: "#FFC400", off: "#3A2F00", label: "주의" },
    green: { on: "#00C853", off: "#083A22", label: "좋음" },
  };

  function pickLight(): Light {
    const s = typeof signalSumPercent === "number" ? signalSumPercent : null;
    if (s === null) return "yellow";
    if (s >= 240) return "green";
    if (s >= 150) return "yellow";
    return "red";
  }
  const active = pickLight();

  const L = 32;
  const lightBase = {
    width: L,
    height: L,
    borderRadius: "50%",
    background: "#222",
  } as const;

  function glow(light: Light): string {
    const c = COLORS[light].on;
    if (light === "red")
      return `0 0 6px ${c}, 0 0 14px rgba(255,42,42,0.7), inset 0 -3px 6px rgba(0,0,0,0.35)`;
    if (light === "yellow")
      return `0 0 6px ${c}, 0 0 14px rgba(255,196,0,0.75), inset 0 -3px 6px rgba(0,0,0,0.35)`;
    return `0 0 6px ${c}, 0 0 14px rgba(0,200,83,0.7), inset 0 -3px 6px rgba(0,0,0,0.35)`;
  }

  function offLens(): string {
    return "inset 0 -3px 6px rgba(0,0,0,0.65)";
  }

  return (
    <div
      style={{
        height: heightPx ? `${heightPx}px` : "100%",
        border: `1px solid ${border}`,
        borderRadius: 18,
        padding: 16,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ===== Title (고정) ===== */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: navy,
          marginBottom: 12,
        }}
      >
        탄소 현황
      </div>

      {/* ===== Center Area ===== */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {/* 탄소 신호등 문구 */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 8,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 900, color: sub }}>
            탄소 신호등
          </span>
          <span style={{ fontSize: 12, fontWeight: 900, color: sub }}>:</span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 950,
              letterSpacing: -0.6,
              color: COLORS[active].on,
              textShadow:
                active === "yellow"
                  ? "0 1px 0 rgba(0,0,0,0.06)"
                  : "none",
            }}
          >
            {COLORS[active].label}
          </span>
        </div>

        {/* ===== Traffic Light ===== */}
        <div
          style={{
            height: 62,
            width: 170,
            margin: "0 auto",
            borderRadius: 14,
            background: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              ...lightBase,
              background: active === "red" ? COLORS.red.on : COLORS.red.off,
              boxShadow: active === "red" ? glow("red") : offLens(),
            }}
          />
          <div
            style={{
              ...lightBase,
              background:
                active === "yellow" ? COLORS.yellow.on : COLORS.yellow.off,
              boxShadow: active === "yellow" ? glow("yellow") : offLens(),
            }}
          />
          <div
            style={{
              ...lightBase,
              background:
                active === "green" ? COLORS.green.on : COLORS.green.off,
              boxShadow: active === "green" ? glow("green") : offLens(),
            }}
          />
        </div>

        {/* 신호등 ↔ 수치 간 여백 */}
        <div style={{ height: 18 }} />

        {/* ===== Metrics ===== */}
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: 14,
            padding: 14,
            background: "#FFFFFF",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800, minWidth: 64 }}>
              탄소 발생
            </div>
            <div style={{ fontSize: 28, fontWeight: 950, color: text, letterSpacing: -0.4 }}>
              {formatNum(emittedKg)}
            </div>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800 }}>
              kgCO₂e
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800, minWidth: 64 }}>
              탄소 절감
            </div>
            <div style={{ fontSize: 28, fontWeight: 950, color: "#166534", letterSpacing: -0.4 }}>
              {formatNum(reducedKg)}
            </div>
            <div style={{ fontSize: 13, color: sub, fontWeight: 800 }}>
              kgCO₂e
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
