// app/page.tsx
"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import EnergyGrid from "@/components/dashboard/EnergyGrid";
import MetricModal from "@/components/dashboard/MetricModal";
import type { MetricKey } from "@/components/dashboard/types";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("electric");

  function openMetric(key: MetricKey) {
    setActiveMetric(key);
    setModalOpen(true);
  }

  return (
    <AppShell>
      <EnergyGrid onSelect={openMetric} />
      <MetricModal open={modalOpen} onClose={() => setModalOpen(false)} metric={activeMetric} />
    </AppShell>
  );
}
