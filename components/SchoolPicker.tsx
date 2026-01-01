"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

type Item = { id: string; label: string };

export default function SchoolPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (schoolId: string) => void;
}) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const db = getFirebaseDb();
        const snap = await getDocs(collection(db, "schools"));
        const out: Item[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          const label = typeof data?.name === "string" && data.name.trim() ? data.name.trim() : d.id;
          out.push({ id: d.id, label });
        });
        out.sort((a, b) => a.label.localeCompare(b.label, "ko"));
        if (!alive) return;
        setItems(out);
      } catch (e: any) {
        if (!alive) return;
        setItems([]);
        setError("학교 목록을 불러오지 못했습니다. (Firestore 규칙/권한을 확인하세요)");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectValue = useMemo(() => {
    if (!value) return "";
    return value;
  }, [value]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid #E7E5E4",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: "#0F172A" }}>학교 선택</div>

      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v) onChange(v);
        }}
        disabled={loading || (items !== null && items.length === 0)}
        style={{
          minWidth: 260,
          height: 38,
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          background: "white",
          padding: "0 10px",
          fontWeight: 800,
          color: "#0F172A",
          outline: "none",
        }}
      >
        <option value="">{loading ? "불러오는 중…" : "학교를 선택하세요"}</option>
        {(items ?? []).map((it) => (
          <option key={it.id} value={it.id}>
            {it.label}
          </option>
        ))}
      </select>

      {/* 목록을 못 읽는 경우를 대비한 수동 입력 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="학교ID 직접 입력 (예: 오류중학교)"
          style={{
            width: 260,
            height: 38,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            background: "white",
            padding: "0 10px",
            fontWeight: 800,
            color: "#0F172A",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => {
            const v = manual.trim();
            if (v) onChange(v);
          }}
          style={{
            height: 38,
            padding: "0 12px",
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          적용
        </button>
      </div>

      {error ? <div style={{ fontSize: 12, fontWeight: 800, color: "#B91C1C" }}>{error}</div> : null}
    </div>
  );
}



