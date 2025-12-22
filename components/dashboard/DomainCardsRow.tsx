"use client";

const GAP = 12;
const CARD_H = 220;

function RingGauge({
  value,
  color,
  size = 112,
  stroke = 12,
}: {
  value: number; // 0~100
  color: string;
  size?: number;
  stroke?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7E5E4" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontWeight: 900,
          color: "#0F172A",
          fontSize: 18,
        }}
      >
        <span>
          {v}
          <span style={{ fontSize: 12, fontWeight: 800, marginLeft: 2, color: "#64748B" }}>%</span>
        </span>
      </div>
    </div>
  );
}

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: CARD_H + 80, // ✅ 실천과제 여유
        border: "1px solid #E7E5E4",
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{title}</div>
      <div style={{ flex: 1, minHeight: 0, marginTop: 10 }}>{children}</div>
    </div>
  );
}

function DomainCard({
  title,
  value,
  color,
  tasks,
}: {
  title: string;
  value: number;
  color: string;
  tasks: string[];
}) {
  return (
    <CardShell title={title}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* ✅ 도넛: 가운데 정렬 / 원래 크기 / 두께 증가 */}
        <div
          style={{
            display: "grid",
            placeItems: "center",
            paddingTop: 4,
          }}
        >
          <RingGauge
            value={value}
            color={color}
            size={112}   // ✅ 원래대로
            stroke={14}  // ✅ 두껍게 (기존 12 → 14)
          />
        </div>

        {/* ✅ 실천 과제: 아래쪽(도넛 아래) */}
        <div
          style={{
            marginTop: 12,
            borderRadius: 14,
            background: "#F8FAFC",
            border: "1px solid #EEF2F7",
            padding: "10px 12px",
            minWidth: 0,
            flex: 1, // ✅ 아래 박스가 남는 높이 채우게
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>실천 과제</div>

          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {tasks.map((t) => (
              <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", minWidth: 0 }}>
                <span
                  style={{
                    marginTop: 6,
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: "#94A3B8",
                    flex: "0 0 auto",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#475569",
                    lineHeight: 1.35,
                    wordBreak: "keep-all",
                  }}
                >
                  {t}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}





export default function DomainCardsRow() {
  // ✅ 더미(40~70)
  const action = 64;
  const culture = 57;
  const env = 49;

  // ✅ 비슷한 톤에서 살짝 다르게(청록/하늘/초록 계열)
  const C_ACTION = "#14B8A6";
  const C_CULTURE = "#0EA5E9";
  const C_ENV = "#22C55E";

  return (
    <div
      style={{
        marginTop: 12,
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: GAP,
        width: "100%",
      }}
    >
      <CardShell title="전체 요약">
        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B" }}>
          아래쪽은 다음 단계에서 구성
        </div>
      </CardShell>

      <DomainCard
                title="행동영역"
                value={action}
                color={C_ACTION}
                tasks={["종이 사용 줄이기", "일회용품 사용 줄이기"]}
                />

            <DomainCard
            title="문화영역"
            value={culture}
            color={C_CULTURE}
            tasks={["동아리 운영하기", "지역푸드뱅크 활용하기", "나눔장터 열기"]}
            />

            <DomainCard
            title="환경영역"
            value={env}
            color={C_ENV}
            tasks={["(추후 입력)"]}
            />
    </div>
  );
}
