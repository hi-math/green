"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import styles from "./DomainCardsRow.module.css";
import { useAuth } from "@/lib/auth";
import { getFirebaseDb } from "@/lib/firebase";

const GAP = 12;
const CARD_H = 220;

function gaugeColorByPercent(value: number) {
  const v = Math.max(0, Math.min(100, value));

  // 0-20: red, 20-40: orange, 40-60: yellow, 60-80: lime, 80-100: green
  if (v < 20) return "#EF4444"; // red-500
  if (v < 40) return "#F97316"; // orange-500
  if (v < 60) return "#EAB308"; // yellow-500
  if (v < 80) return "#84CC16"; // lime-500
  return "#22C55E"; // green-500
}

function RingGauge({
  value,
  size = 112,
  stroke = 12,
}: {
  value: number; // 0~100
  size?: number;
  stroke?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const color = gaugeColorByPercent(v);
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
  tasks,
}: {
  title: string;
  value: number;
  tasks: string[];
}) {
  return (
    <CardShell title={title}>
      <div className={styles.domainCardContent}>
        {/* ✅ 도넛: 가운데 정렬 / 원래 크기 / 두께 증가 */}
        <div className={styles.gaugeWrap}>
          <RingGauge
            value={value}
            size={112}   // ✅ 원래대로
            stroke={18}  // ✅ 더 두껍게
          />
        </div>

        {/* ✅ 실천 과제: 아래쪽(도넛 아래) */}
        <div
          className={styles.tasksWrap}
          style={{
            borderRadius: 14,
            background: "#F8FAFC",
            border: "1px solid #EEF2F7",
            padding: "10px 12px",
            minWidth: 0,
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





type CultureKey =
  | "teacher_training"
  | "learning_community"
  | "student_club"
  | "uniform_reuse"
  | "sharing_market"
  | "plant_based_meals"
  | "local_foodbank"
  | "data_literacy_edu"
  | "community_link"
  | "local_farm_menu";

type BehaviorKey =
  | "electricity_saving"
  | "gas_saving"
  | "water_saving"
  | "standby_power_cut"
  | "hvac_efficiency_upgrade"
  | "hvac_temperature_compliance"
  | "disposable_reduction"
  | "paper_reduction"
  | "recycling_separation"
  | "carbon_data_sharing"
  | "device_charging_policy";

const BEHAVIOR_DB_ITEMS: Array<{ key: BehaviorKey; label: string }> = [
  { key: "electricity_saving", label: "전기사용 절감" },
  { key: "gas_saving", label: "가스사용 절감" },
  { key: "water_saving", label: "수도사용 절감" },
  { key: "standby_power_cut", label: "대기전력 차단" },
  { key: "hvac_efficiency_upgrade", label: "냉·난방 에너지 효율 개선 설비 운영" },
  { key: "hvac_temperature_compliance", label: "적정 냉·난방 온도 준수" },
  { key: "disposable_reduction", label: "일회용품 사용 절감" },
  { key: "paper_reduction", label: "종이 사용 절감" },
  { key: "recycling_separation", label: "재활용 분리배출 이행" },
  { key: "carbon_data_sharing", label: "탄소배출 데이터 공유" },
  { key: "device_charging_policy", label: "디벗 충전 및 사용 관리 기준 수립" },
];

const BEHAVIOR_TASKS: Array<{ label: string; keys: BehaviorKey[] }> = BEHAVIOR_DB_ITEMS.map((x) => ({
  label: x.label,
  keys: [x.key],
}));

const BEHAVIOR_ALWAYS_TASKS = ["피크 전력 적정 운영"] as const;

const ENV_TASKS = [
  "태양광에너지 설비 설치",
  "냉·난방 에너지 효율 개선 설비 운영",
  "태양광에너지 발전량 공유",
  "중수도 시설 설치·운영",
  "학교숲 조성 및 관리",
  "학교 텃밭 조성 및 운영",
  "빗물저금통 설치 및 활용",
  "절수형 화장실 설비 운영",
  "탄소문해력 교육 게시판 운영",
  "학교숲 활용 체험형 탄소중립 교육 운영",
  "학교 시설 활용 체험형 탄소중립 교육 운영",
] as const;

type EnvKey =
  | "solar_install"
  | "hvac_efficiency_upgrade"
  | "solar_generation_share"
  | "greywater_facility"
  | "rainwater_tank_use"
  | "low_flow_toilet"
  | "school_forest_manage"
  | "school_garden_operate"
  | "carbon_literacy_board"
  | "forest_experience_edu"
  | "facility_experience_edu";

const ENV_DB_ITEMS: Array<{ key: EnvKey; label: (typeof ENV_TASKS)[number] }> = [
  { key: "solar_install", label: "태양광에너지 설비 설치" },
  { key: "hvac_efficiency_upgrade", label: "냉·난방 에너지 효율 개선 설비 운영" },
  { key: "solar_generation_share", label: "태양광에너지 발전량 공유" },
  { key: "greywater_facility", label: "중수도 시설 설치·운영" },
  { key: "school_forest_manage", label: "학교숲 조성 및 관리" },
  { key: "school_garden_operate", label: "학교 텃밭 조성 및 운영" },
  { key: "rainwater_tank_use", label: "빗물저금통 설치 및 활용" },
  { key: "low_flow_toilet", label: "절수형 화장실 설비 운영" },
  { key: "carbon_literacy_board", label: "탄소문해력 교육 게시판 운영" },
  { key: "forest_experience_edu", label: "학교숲 활용 체험형 탄소중립 교육 운영" },
  { key: "facility_experience_edu", label: "학교 시설 활용 체험형 탄소중립 교육 운영" },
];

const BEHAVIOR_THRESHOLDS_PER_PERSON = {
  electricity: 15000,
  gas: 40000,
  water: 3700,
  misc: 4000, // 일회용품/종이/재활용: 총비용/인원 < 4000원
} as const;

const CULTURE_DB_ITEMS: Array<{ key: CultureKey; label: string }> = [
  { key: "teacher_training", label: "교사 연수 운영" },
  { key: "learning_community", label: "학습공동체 운영" },
  { key: "student_club", label: "학생 동아리 운영" },
  { key: "uniform_reuse", label: "교복 물려주기 실시" },
  { key: "sharing_market", label: "나눔장터 운영" },
  { key: "local_farm_menu", label: "지역농산물 활용 식단 운영" },
  { key: "plant_based_meals", label: "채식 중심 식단 운영" },
  { key: "local_foodbank", label: "지역 푸드뱅크 활용" },
  { key: "data_literacy_edu", label: "데이터 활용 교육 운영" },
  { key: "community_link", label: "지역사회 연계 활동" },
];

const CULTURE_TASKS: Array<{ label: string; keys?: CultureKey[] }> = [
  { label: "교사 대상 전문 연수와 학습공동체 운영", keys: ["teacher_training", "learning_community"] },
  { label: "탄소중립 실천 동아리를 운영", keys: ["student_club"] },
  { label: "데이터 활용 탄소중립 실천 교육 프로그램과 프로젝트 운영", keys: ["data_literacy_edu"] },
  { label: "학부모 및 지역사회 연계 프로그램운영", keys: ["community_link"] },
  { label: "물건이나 학용품을 나누기 위한 학교 차원의 노력(나눔장터 등)을 한다.", keys: ["sharing_market"] },
  { label: "지역농산물 활용 식단 운영", keys: ["local_farm_menu"] },
  { label: "교복 물려주기 실시", keys: ["uniform_reuse"] },
  { label: "지역 푸드뱅크 활용", keys: ["local_foodbank"] },
  { label: "채식급식의 날 정기 운영", keys: ["plant_based_meals"] },
];



export default function DomainCardsRow({
  onScoresChange,
}: {
  onScoresChange?: (scores: { behavior: number; culture: number; env: number; sum: number }) => void;
}) {
  const { user } = useAuth();

  const schoolId = useMemo(() => user?.email?.split("@")[0] ?? null, [user]);

  const [cultureChecks, setCultureChecks] = useState<Partial<Record<CultureKey, boolean>> | null>(null);
  const [cultureLoading, setCultureLoading] = useState(true);
  const [behaviorChecks, setBehaviorChecks] = useState<Partial<Record<BehaviorKey, boolean>> | null>(null);
  const [behaviorLoading, setBehaviorLoading] = useState(true);
  const [envChecks, setEnvChecks] = useState<Partial<Record<EnvKey, boolean>> | null>(null);
  const [envLoading, setEnvLoading] = useState(true);
  const [envMetrics, setEnvMetrics] = useState<{
    hvacEfficiencyUpgrade: boolean;
    board: boolean;
  }>({ hvacEfficiencyUpgrade: false, board: false });
  const [behaviorMetrics, setBehaviorMetrics] = useState<{
    totalPeople: number | null;
    electricityCost: number | null;
    gasCost: number | null;
    waterCost: number | null;
    paperCost: number | null;
    disposableCost: number | null;
    wasteDisposalCost: number | null;
    coolingSet: number | null;
    heatingSet: number | null;
    smartStandby: boolean;
    hvacEfficiencyUpgrade: boolean;
  }>({
    totalPeople: null,
    electricityCost: null,
    gasCost: null,
    waterCost: null,
    paperCost: null,
    disposableCost: null,
    wasteDisposalCost: null,
    coolingSet: null,
    heatingSet: null,
    smartStandby: false,
    hvacEfficiencyUpgrade: false,
  });

  useEffect(() => {
    if (!schoolId) {
      setCultureChecks(null);
      setCultureLoading(false);
      setBehaviorChecks(null);
      setBehaviorLoading(false);
      setEnvChecks(null);
      setEnvLoading(false);
      setEnvMetrics({ hvacEfficiencyUpgrade: false, board: false });
      setBehaviorMetrics({
        totalPeople: null,
        electricityCost: null,
        gasCost: null,
        waterCost: null,
        paperCost: null,
        disposableCost: null,
        wasteDisposalCost: null,
        coolingSet: null,
        heatingSet: null,
        smartStandby: false,
        hvacEfficiencyUpgrade: false,
      });
      return;
    }

    setCultureLoading(true);
    setBehaviorLoading(true);
    setEnvLoading(true);
    const db = getFirebaseDb();
    const ref = doc(db, "schools", schoolId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() as any;
        const cChecks = (data?.bce?.culture_checks ?? {}) as Partial<Record<CultureKey, boolean>>;
        const bChecks = (data?.bce?.behavior_checks ?? {}) as Partial<Record<BehaviorKey, boolean>>;
        const eChecksRaw = (data?.bce?.environment_checks ?? {}) as any;

        const students = typeof data?.basic?.students === "number" ? data.basic.students : null;
        const staff = typeof data?.basic?.staff === "number" ? data.basic.staff : null;
        const totalPeople =
          typeof students === "number" && typeof staff === "number" ? Math.max(0, students + staff) : null;

        const costs = data?.bce?.behavior_costs ?? {};
        const electricityCost = typeof costs.electricity_cost === "number" ? costs.electricity_cost : null;
        const gasCost = typeof costs.gas_cost === "number" ? costs.gas_cost : null;
        const waterCost = typeof costs.water_cost === "number" ? costs.water_cost : null;
        const paperCost = typeof costs.a4_paper_cost === "number" ? costs.a4_paper_cost : null;
        const disposableCost = typeof costs.disposable_cost === "number" ? costs.disposable_cost : null;
        const wasteDisposalCost = typeof costs.waste_disposal_cost === "number" ? costs.waste_disposal_cost : null;

        const coolingSet = typeof data?.basic?.cooling?.min === "number" ? data.basic.cooling.min : null;
        const heatingSet = typeof data?.basic?.heating?.min === "number" ? data.basic.heating.min : null;
        const smartStandby = !!data?.basic?.checklist?.smartStandby;
        const hvacEfficiencyUpgrade = !!data?.basic?.checklist?.hvacEfficiencyUpgrade;
        const board = !!data?.basic?.checklist?.board;

        const solarGenerationShare = !!eChecksRaw.solar_generation_share;
        const greywaterFacility = !!eChecksRaw.greywater_facility;
        const rainwaterTankUse = !!eChecksRaw.rainwater_tank_use;
        const lowFlowToilet = !!eChecksRaw.low_flow_toilet;
        const schoolForestManage = !!eChecksRaw.school_forest_manage;
        const schoolGardenOperate = !!eChecksRaw.school_garden_operate;
        const forestExperienceEdu = !!eChecksRaw.forest_experience_edu;
        const facilityExperienceEdu = !!eChecksRaw.facility_experience_edu;

        setCultureChecks(cChecks);
        setBehaviorChecks(bChecks);
        setEnvChecks({
          solar_install: !!eChecksRaw.solar_install,
          hvac_efficiency_upgrade: hvacEfficiencyUpgrade,
          solar_generation_share: solarGenerationShare,
          greywater_facility: greywaterFacility,
          rainwater_tank_use: rainwaterTankUse,
          low_flow_toilet: lowFlowToilet,
          school_forest_manage: schoolForestManage,
          school_garden_operate: schoolGardenOperate,
          carbon_literacy_board: board,
          forest_experience_edu: forestExperienceEdu,
          facility_experience_edu: facilityExperienceEdu,
        });
        setEnvMetrics({ hvacEfficiencyUpgrade, board });
        setBehaviorMetrics({
          totalPeople,
          electricityCost,
          gasCost,
          waterCost,
          paperCost,
          disposableCost,
          wasteDisposalCost,
          coolingSet,
          heatingSet,
          smartStandby,
          hvacEfficiencyUpgrade,
        });
        setCultureLoading(false);
        setBehaviorLoading(false);
        setEnvLoading(false);
      },
      (err) => {
        console.error("[DomainCardsRow] culture_checks subscribe failed:", err);
        setCultureChecks(null);
        setCultureLoading(false);
        setBehaviorChecks(null);
        setBehaviorLoading(false);
        setEnvChecks(null);
        setEnvLoading(false);
        setEnvMetrics({ hvacEfficiencyUpgrade: false, board: false });
        setBehaviorMetrics({
          totalPeople: null,
          electricityCost: null,
          gasCost: null,
          waterCost: null,
          paperCost: null,
          disposableCost: null,
          wasteDisposalCost: null,
          coolingSet: null,
          heatingSet: null,
          smartStandby: false,
          hvacEfficiencyUpgrade: false,
        });
      },
    );

    return () => unsub();
  }, [schoolId]);

  const behaviorCombinedChecks = useMemo(() => {
    const totalPeople = behaviorMetrics.totalPeople;
    const canCalc = typeof totalPeople === "number" && totalPeople > 0;

    const electricitySaving =
      canCalc && typeof behaviorMetrics.electricityCost === "number"
        ? behaviorMetrics.electricityCost / totalPeople < BEHAVIOR_THRESHOLDS_PER_PERSON.electricity
        : false;

    const gasSaving =
      canCalc && typeof behaviorMetrics.gasCost === "number"
        ? behaviorMetrics.gasCost / totalPeople < BEHAVIOR_THRESHOLDS_PER_PERSON.gas
        : false;

    const waterSaving =
      canCalc && typeof behaviorMetrics.waterCost === "number"
        ? behaviorMetrics.waterCost / totalPeople < BEHAVIOR_THRESHOLDS_PER_PERSON.water
        : false;

    const disposableReduction =
      canCalc && typeof behaviorMetrics.disposableCost === "number"
        ? behaviorMetrics.disposableCost / totalPeople < BEHAVIOR_THRESHOLDS_PER_PERSON.misc
        : false;

    const paperReduction =
      canCalc && typeof behaviorMetrics.paperCost === "number"
        ? behaviorMetrics.paperCost / totalPeople < BEHAVIOR_THRESHOLDS_PER_PERSON.misc
        : false;

    const recyclingSeparation =
      canCalc && typeof behaviorMetrics.wasteDisposalCost === "number"
        ? behaviorMetrics.wasteDisposalCost / totalPeople < BEHAVIOR_THRESHOLDS_PER_PERSON.misc
        : false;

    const hvacTemperatureCompliance =
      typeof behaviorMetrics.coolingSet === "number" &&
      typeof behaviorMetrics.heatingSet === "number" &&
      behaviorMetrics.coolingSet > 26 &&
      behaviorMetrics.heatingSet < 20;

    return {
      ...behaviorChecks,
      electricity_saving: electricitySaving,
      gas_saving: gasSaving,
      water_saving: waterSaving,
      standby_power_cut: behaviorMetrics.smartStandby,
      hvac_efficiency_upgrade: behaviorMetrics.hvacEfficiencyUpgrade,
      hvac_temperature_compliance: hvacTemperatureCompliance,
      disposable_reduction: disposableReduction,
      paper_reduction: paperReduction,
      recycling_separation: recyclingSeparation,
    } as Partial<Record<BehaviorKey, boolean>>;
  }, [behaviorChecks, behaviorMetrics]);

  const behaviorValue = useMemo(() => {
    const total = BEHAVIOR_DB_ITEMS.length;
    const checked = BEHAVIOR_DB_ITEMS.reduce((acc, it) => acc + (behaviorCombinedChecks?.[it.key] ? 1 : 0), 0);
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  }, [behaviorCombinedChecks]);

  const behaviorUncheckedTasks = useMemo(() => {
    if (behaviorLoading) return ["불러오는 중…"];

    const out: string[] = [];
    for (const t of BEHAVIOR_TASKS) {
      const done = t.keys.every((k) => !!behaviorCombinedChecks?.[k]);
      if (!done) out.push(t.label);
    }
    // ✅ 피크 전력 적정 운영: 데이터가 없어도 항상 실천과제로 표시
    for (const t of BEHAVIOR_ALWAYS_TASKS) {
      if (!out.includes(t)) out.push(t);
    }
    return out.length > 0 ? out : ["모두 체크되었습니다."];
  }, [behaviorCombinedChecks, behaviorLoading]);

  const cultureValue = useMemo(() => {
    const total = CULTURE_DB_ITEMS.length;
    const checked = CULTURE_DB_ITEMS.reduce((acc, it) => acc + (cultureChecks?.[it.key] ? 1 : 0), 0);
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  }, [cultureChecks]);

  const cultureUncheckedTasks = useMemo(() => {
    if (cultureLoading) return ["불러오는 중…"];

    const out: string[] = [];
    for (const t of CULTURE_TASKS) {
      const done = (t.keys ?? []).every((k) => !!cultureChecks?.[k]);
      if (!done) out.push(t.label);
    }
    return out.length > 0 ? out : ["모두 체크되었습니다."];
  }, [cultureChecks, cultureLoading]);

  const envValue = useMemo(() => {
    const total = ENV_DB_ITEMS.length;
    const checked = ENV_DB_ITEMS.reduce((acc, it) => acc + (envChecks?.[it.key] ? 1 : 0), 0);
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  }, [envChecks]);

  const envUncheckedTasks = useMemo(() => {
    if (envLoading) return ["불러오는 중…"];

    const out: string[] = [];
    for (const it of ENV_DB_ITEMS) {
      if (!envChecks?.[it.key]) out.push(it.label);
    }
    return out.length > 0 ? out : ["모두 체크되었습니다."];
  }, [envChecks, envLoading]);

  useEffect(() => {
    if (!onScoresChange) return;
    const sum = behaviorValue + cultureValue + envValue;
    onScoresChange({ behavior: behaviorValue, culture: cultureValue, env: envValue, sum });
  }, [behaviorValue, cultureValue, envValue, onScoresChange]);

  return (
    <div
      style={{
        marginTop: 12,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: GAP,
        width: "100%",
      }}
    >
      <DomainCard
                title="행동영역"
                value={behaviorValue}
                tasks={behaviorUncheckedTasks}
                />

            <DomainCard
            title="문화영역"
            value={cultureValue}
            tasks={cultureUncheckedTasks}
            />

            <DomainCard
            title="환경영역"
            value={envValue}
            tasks={envUncheckedTasks}
            />
    </div>
  );
}