// components/dashboard/MetricModal.tsx
"use client";

import type { MetricKey } from "@/components/dashboard/types";

const TITLE: Record<MetricKey, string> = {
  electric: "전기 사용량",
  water: "수도 사용량",
  gas: "가스 사용량",
  solar: "태양광 발전량",
};

export default function MetricModal({
  open,
  onClose,
  metric,
}: {
  open: boolean;
  onClose: () => void;
  metric: MetricKey;
}) {
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
          width: "min(980px, 100%)",
          background: "white",
          borderRadius: 18,
          border: "1px solid #e5e7eb",
          padding: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
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

        <div style={{ marginTop: 12, border: "1px dashed #cbd5e1", background: "#f1f5f9", borderRadius: 14, height: 420 }} />
      </div>
    </div>
  );
}
