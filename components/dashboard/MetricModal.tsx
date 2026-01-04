// components/dashboard/MetricModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { MetricKey } from "@/components/dashboard/types";
import HourlyUsageChart from "@/components/dashboard/HourlyUsageChart";
import MonthlyElectricComboChart from "@/components/dashboard/MonthlyElectricComboChart";
import { useAuth } from "@/lib/auth";
import { getFirebaseDb } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const TITLE: Record<MetricKey, string> = {
  electric: "전기 사용량",
  water: "수도 사용량",
  gas: "가스 사용량",
  solar: "태양광 발전량",
};

const DISTRICT_BY_SCHOOL: Record<string, string> = {
  "오류중학교": "구로구",
  "하계중학교": "도봉구",
  "덕수중학교": "중구",
};

function lastNMonthsLabels(n: number) {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(String(d.getMonth() + 1));
  }
  return out;
}

function formatKoreanMonthDay(d: Date) {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function mockMonthValues(n: number) {
  const now = new Date();
  // stable-ish numbers tied to month index
  const cur: number[] = [];
  const last: number[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const base = 320 + m * 9;
    const wave = 45 * Math.sin((m / 12) * Math.PI * 2);
    const v = Math.max(80, Math.round(base + wave));
    cur.push(v);
    last.push(Math.max(70, Math.round(v * 0.92 + 18)));
  }
  return { cur, last };
}

function mockDistrictSeoulLines(monthCount: number, base: number[]) {
  const n = Math.min(monthCount, base.length);
  const district = Array.from({ length: n }, (_, i) => Math.max(50, Math.round(base[i] * 0.86 + 18 * Math.sin((i + 1) * 0.9))));
  const seoul = Array.from({ length: n }, (_, i) => Math.max(50, Math.round(base[i] * 0.92 + 14 * Math.cos((i + 1) * 0.8))));
  return { district, seoul };
}

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        background: "white",
        padding: 14,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 950, color: "#0f172a" }}>{title}</div>
        {sub ? <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>{sub}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function MetricModal({
  open,
  onClose,
  metric,
}: {
  open: boolean;
  onClose: () => void;
  metric: MetricKey;
}) {
  const { user } = useAuth();
  const schoolId = useMemo(() => user?.email?.split("@")[0] ?? null, [user?.email]);
  const [district, setDistrict] = useState<string | null>(null);
  const todayLabel = useMemo(() => formatKoreanMonthDay(new Date()), []);

  useEffect(() => {
    if (!open || metric !== "electric") return;
    if (!schoolId) return;

    let alive = true;
    (async () => {
      try {
        const db = getFirebaseDb();
        const ref = doc(db, "schools", schoolId);
        const snap = await getDoc(ref);
        if (!alive) return;

        const fromDb = snap.exists() ? (snap.data() as any)?.district : null;
        if (typeof fromDb === "string" && fromDb.trim()) {
          setDistrict(fromDb.trim());
          return;
        }

        // If missing, auto-fill for known schools (요청 매핑)
        const mapped = DISTRICT_BY_SCHOOL[schoolId];
        if (mapped) {
          setDistrict(mapped);
          // best-effort write-back (merge) so DB has the value
          await setDoc(ref, { district: mapped }, { merge: true });
        } else {
          setDistrict(null);
        }
      } catch {
        // ignore (read/write may be restricted)
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, metric, schoolId]);

  // IMPORTANT: keep hooks unconditional; only return null after hooks.
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1320px, 96vw)",
          maxHeight: "86dvh",
          background: "white",
          borderRadius: 18,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #e5e7eb",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>{TITLE[metric]} · 세부</div>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "1px solid #e5e7eb",
                background: "#f8fafc",
                borderRadius: 12,
                padding: "8px 10px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {metric === "electric" ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                alignItems: "start",
              }}
            >
              <SectionCard title={`${todayLabel} 시간대별 전력사용량`}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#64748b" }}>kWh</span>
                </div>
                <HourlyUsageChart height={260} dateLabel={todayLabel} />
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#0EA5E9", display: "inline-block" }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>오늘</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#94A3B8", display: "inline-block" }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>지난주</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="월별 전기 사용량 비교">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#64748b" }}>kWh</span>
                </div>
                {(() => {
                  const months = lastNMonthsLabels(6);
                  const { cur, last } = mockMonthValues(6);
                  const districtLabel = district ? district : schoolId ? `${schoolId} 지역구` : "지역구";
                  const { district: districtLine, seoul: seoulLine } = mockDistrictSeoulLines(6, cur);
                  return (
                    <>
                    <MonthlyElectricComboChart
                      height={260}
                      months={months.map((m) => `${m}월`)}
                      current={cur}
                      lastYear={last}
                      district={districtLine}
                      seoul={seoulLine}
                      districtLabel={districtLabel}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#94A3B8", display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>작년</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#0EA5E9", display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>올해</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 16, height: 0, borderTop: "2px solid #FF6F5A", display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>{districtLabel}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 16, height: 0, borderTop: "2px solid #FFE5B1", display: "inline-block", boxShadow: "0 0 0 1px rgba(61,154,174,0.35) inset" }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>서울시</span>
                      </div>
                    </div>
                    </>
                  );
                })()}
              </SectionCard>
            </div>
          ) : (
            <div style={{ border: "1px dashed #cbd5e1", background: "#f1f5f9", borderRadius: 14, height: 420 }} />
          )}
        </div>
      </div>
    </div>
  );
}
