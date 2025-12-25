// app/page.tsx
"use client";

import { useCallback, useState } from "react";
import AppShell from "@/components/AppShell";
import DashboardTopPanel from "@/components/dashboard/DashboardTopPanel";
import EnergyGrid from "@/components/dashboard/EnergyGrid";
import DomainCardsRow from "@/components/dashboard/DomainCardsRow";
import MetricModal from "@/components/dashboard/MetricModal";
import type { MetricKey } from "@/components/dashboard/types";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("electric");
  const [domainSum, setDomainSum] = useState<number | null>(null);

  function openMetric(key: MetricKey) {
    setActiveMetric(key);
    setModalOpen(true);
  }

  const handleScores = useCallback((scores: { sum: number }) => {
    setDomainSum(scores.sum);
  }, []);

  return (
    <AppShell>
      <DashboardTopPanel signalSumPercent={domainSum}>
        <EnergyGrid onSelect={openMetric} />
      </DashboardTopPanel>

      <DomainCardsRow onScoresChange={handleScores} />

      <MetricModal open={modalOpen} onClose={() => setModalOpen(false)} metric={activeMetric} />
    </AppShell>
  );
}
