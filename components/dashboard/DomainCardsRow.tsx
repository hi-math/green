"use client";

import React from "react";

const GAP = 12;
const CARD_MIN_H = 260;

// ---------- RingGauge ----------
function RingGauge({
  value,
  size = 135,
  stroke = 18,
}: {
  value: number; // 0~100
  size?: number;
  stroke?: number;
}) {
  const v = Math.max(0, Math.min(100, value));

  const RED = "#EF4444";
  const ORG = "#F59E0B";
  const TEAL = "#06B6D4";
  const GRN = "#22C55E";
  const color = v <= 20 ? RED : v <= 49 ? ORG : v <= 79 ? TEAL : GRN;

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;

  return (
    <div
      className="gWrap"
      style={{
        width: size,
        height: size,
        position: "relative",
        ["--ringStroke" as any]: `${stroke}px`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7E5E4" strokeWidth={stroke} />
        <circle
          className="gProgress"
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
          fontSize: 20,
          letterSpacing: -0.2,
          lineHeight: 1,
        }}
      >
        <span>
          {v}
          <span style={{ fontSize: 12, fontWeight: 900, marginLeft: 2, color: "#64748B" }}>%</span>
        </span>
      </div>

      <style jsx>{`
        .gWrap {
          transition: transform 160ms ease, filter 160ms ease;
          will-change: transform;
        }
        .gWrap:hover {
          transform: scale(1.06);
          filter: drop-shadow(0 10px 16px rgba(15, 23, 42, 0.18));
        }
        .gWrap:hover :global(.gProgress) {
          stroke-width: calc(var(--ringStroke) + 3px);
        }
      `}</style>
    </div>
  );
}

// ---------- CardShell ----------
function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: CARD_MIN_H,
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
      {/* 제목은 위 고정 */}
      <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{title}</div>

      {/* ✅ 제목 제외 영역을 '진짜로' 세로 가운데 정렬 */}
      <div
        className="cardContentWrapper"
        style={{
          flex: 1,
          minHeight: 0,
          marginTop: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* ✅ 가운데 정렬의 기준이 되는 덩어리: height를 먹지 않게 함 */}
        <div className="cardContentInner" style={{ width: "100%", minWidth: 0, height: "auto" }}>{children}</div>
      </div>
      
      <style jsx>{`
        @media (max-width: 1200px) {
          .cardContentInner {
            width: auto !important;
            max-width: 320px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}

// ---------- DomainCard ----------
function DomainCard({
  title,
  value,
  tasks,
}: {
  title: string;
  value: number;
  tasks: string[];
}) {
  return (
    <CardShell title={title}>
      <div className="domainGrid">
        <div className="leftBox">
          <RingGauge value={value} />
        </div>

        <div className="tasksBox">
          <div className="tasksTitle" style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>실천 과제</div>

          <div className="tasksList" style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {tasks.map((t) => (
              <div key={t} className="taskItem" style={{ display: "flex", gap: 8, alignItems: "flex-start", minWidth: 0 }}>
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
                    overflowWrap: "anywhere",
                    minWidth: 0,
                  }}
                >
                  {t}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          /* ✅ 중요: 여기서 height:100% 같은 걸 주면 중앙정렬이 무력화됨 */
          .domainGrid {
            width: 100%;
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 12px;
            min-width: 0;

            /* 카드 가운데에 놓였을 때 보기 좋게 */
            align-items: center;
            justify-content: center;
          }

          .leftBox {
            justify-self: center;
            border-radius: 14px;
            border: 1px solid #f1f5f9;
            background: #ffffff;
            display: grid;
            place-items: center;
            padding: 10px;
            min-width: 0;
          }

          .tasksBox {
            justify-self: center;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid #eef2f7;
            padding: 10px 12px;
            min-width: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          /* 좁아지면 카드 안에서만 세로 배치하고 가운데 정렬 */
          @media (max-width: 1200px) {
            .domainGrid {
              grid-template-columns: 1fr;
              grid-template-rows: auto auto;
              justify-items: center;
              align-items: center;
              gap: 16px;
              width: min(100%, 340px);
              max-width: 340px;
              margin: 0 auto;
            }
            .leftBox {
              width: 100%;
              max-width: 240px;
              justify-self: center;
              margin: 0 auto;
            }
            .tasksBox {
              width: 100%;
              max-width: 320px;
              justify-self: center;
              align-items: center;
              margin: 0 auto;
            }
            .tasksTitle {
              text-align: center;
            }
            .tasksList {
              justify-items: center;
            }
            .taskItem {
              justify-content: center;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </CardShell>
  );
}

// ---------- Row ----------
export default function DomainCardsRow() {
  const action = 25;
  const culture = 84;
  const env = 54;

  return (
    <div className="domainCardsRow">
      <DomainCard title="행동영역" value={action} tasks={["종이 사용 줄이기", "일회용품 사용 줄이기"]} />
      <DomainCard title="문화영역" value={culture} tasks={["동아리 운영하기", "지역푸드뱅크 활용하기", "나눔장터 열기"]} />
      <DomainCard title="환경영역" value={env} tasks={["빗물저금통 설치", "쓰레기 처리비용 줄이기"]} />
      
      <style jsx>{`
        .domainCardsRow {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: ${GAP}px;
          width: 100%;
          justify-items: start;
          align-items: start;
        }

        /* 태블릿 크기: 2열 */
        @media (max-width: 1200px) {
          .domainCardsRow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* 모바일 크기: 1열 */
        @media (max-width: 768px) {
          .domainCardsRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
