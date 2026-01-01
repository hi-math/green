// app/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import DashboardTopPanel from "@/components/dashboard/DashboardTopPanel";
import EnergyGrid from "@/components/dashboard/EnergyGrid";
import DomainCardsRow from "@/components/dashboard/DomainCardsRow";
import MetricModal from "@/components/dashboard/MetricModal";
import type { MetricKey } from "@/components/dashboard/types";
import SchoolPicker from "@/components/SchoolPicker";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("electric");
  const [domainSum, setDomainSum] = useState<number | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("selectedSchoolId");
      if (saved && saved.trim()) setSchoolId(saved.trim());
    } catch {}
  }, []);

  const onPickSchool = useCallback((id: string) => {
    setSchoolId(id);
    try {
      localStorage.setItem("selectedSchoolId", id);
    } catch {}
  }, []);

  function openMetric(key: MetricKey) {
    setActiveMetric(key);
    setModalOpen(true);
  }

  const handleScores = useCallback((scores: { sum: number }) => {
    setDomainSum(scores.sum);
  }, []);

  return (
    <AppShell>
      <SchoolPicker value={schoolId} onChange={onPickSchool} />

      <div style={{ height: 12 }} />
      <DashboardTopPanel signalSumPercent={domainSum}>
        <EnergyGrid onSelect={openMetric} />
      </DashboardTopPanel>

      <DomainCardsRow schoolId={schoolId} onScoresChange={handleScores} />

      <MetricModal open={modalOpen} onClose={() => setModalOpen(false)} metric={activeMetric} schoolId={schoolId} />
    </AppShell>
  );
}
