// app/school/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import DualRange from "@/components/DualRange";

import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type TabKey = "basic" | "bce";

const COLORS = {
  border: "#e5e7eb",
  text: "#111827",
  sub: "#6b7280",
  soft: "#f3f4f6",
  activeBg: "#e5e7eb",
  blue: "#2563eb",
};

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        background: active ? COLORS.activeBg : "white",
        color: COLORS.text,
        fontWeight: 900,
        fontSize: 13,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{children}</div>;
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        background: "white",
        padding: 16,
        minWidth: 0,
      }}
    >
      {title ? (
        <div style={{ fontSize: 13, fontWeight: 900, color: COLORS.text, marginBottom: 12 }}>{title}</div>
      ) : null}
      {children}
    </section>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
  maxWidth = 260,
  disabled = false,
}: {
  label: string;
  unit?: string;
  value: number | "";
  onChange: (v: number | "") => void;
  maxWidth?: number;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}>{label}</div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            background: disabled ? "#f9fafb" : "#fff",
            padding: "10px 12px",
            boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
          }}
        >
          <input
            disabled={disabled}
            type="number"
            inputMode="numeric"
            value={value === "" ? "" : String(value)}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onChange("");
              const n = Number(raw);
              if (!Number.isNaN(n)) onChange(n);
            }}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 14,
              fontWeight: 800,
              color: disabled ? "#9ca3af" : COLORS.text,
              background: "transparent",
              paddingRight: unit ? 28 : 0, // ✅ unit 붙이기
              textAlign: "right",
              cursor: disabled ? "not-allowed" : "text",
            }}
          />

          {unit ? (
            <span
              style={{
                position: "absolute",
                right: 8, // ✅ 더 붙이기
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                fontWeight: 900,
                color: COLORS.sub,
                pointerEvents: "none",
              }}
            >
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: 12,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        background: disabled ? "#f9fafb" : "white",
        opacity: disabled ? 0.8 : 1,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: COLORS.text }}>{label}</div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        aria-pressed={value}
        style={{
          width: 52,
          height: 30,
          borderRadius: 999,
          border: `1px solid ${COLORS.border}`,
          background: value ? COLORS.blue : COLORS.soft,
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          flex: "0 0 auto",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 26 : 3,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
            transition: "left 160ms ease",
          }}
        />
      </button>
    </div>
  );
}

function PencilIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SchoolDoc = {
  basic?: {
    students?: number | null;
    staff?: number | null;
    classes?: number | null;
    building_area_m2?: number | null;
    playground_m2?: number | null;
    cooling?: { min?: number; max?: number };
    heating?: { min?: number; max?: number };
    checklist?: {
      planDoc?: boolean;
      ecoCoolRoof?: boolean;
      smartStandby?: boolean;
      insulation?: boolean;
      board?: boolean;
    };
  };
  bce?: {
    behavior_costs?: {
      electricity_cost?: number | null;
      gas_cost?: number | null;
      water_cost?: number | null;
      a4_paper_cost?: number | null;
      disposable_cost?: number | null;
      waste_disposal_cost?: number | null;
    };
    culture_checks?: {
      teacher_training?: boolean;
      learning_community?: boolean;
      student_club?: boolean;
      uniform_reuse?: boolean;
      sharing_market?: boolean;
      plant_based_meals?: boolean;
      local_foodbank?: boolean;
      data_literacy_edu?: boolean;
      community_link?: boolean;
    };
    environment?: {
      school_garden_area_m2?: number | null;
      rainwater_tank_l?: number | null;
      trash_processing_cost?: number | null;
      resource_recovery_revenue?: number | null;
      solar_generation_kwh?: number | null;
    };
  };
  updatedAt?: unknown;
};

export default function SchoolInfoPage() {
  const [tab, setTab] = useState<TabKey>("basic");

  // ✅ toast (컴포넌트 내부)
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  // auth user
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const schoolId = useMemo(() => user?.email?.split("@")[0] ?? "오류중학교", [user]);

  // 편집/저장 (탭별)
  const [editingTab, setEditingTab] = useState<TabKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const isEditing = editingTab === tab;

  // ---------- basic ----------
  const [students, setStudents] = useState<number | "">("");
  const [staff, setStaff] = useState<number | "">("");
  const [classes, setClasses] = useState<number | "">("");
  const [buildingArea, setBuildingArea] = useState<number | "">("");
  const [playground, setPlayground] = useState<number | "">("");

  const MIN = 20;
  const MAX = 30;
  const STEP = 0.1;
  const GAP = 0.1;

  const [coolMin, setCoolMin] = useState(22.4);
  const [coolMax, setCoolMax] = useState(26.9);
  const [heatMin, setHeatMin] = useState(23.1);
  const [heatMax, setHeatMax] = useState(27.0);

  const [planDoc, setPlanDoc] = useState(false);
  const [ecoCoolRoof, setEcoCoolRoof] = useState(false);
  const [smartStandby, setSmartStandby] = useState(false);
  const [insulation, setInsulation] = useState(false);
  const [board, setBoard] = useState(false);

  // ---------- bce ----------
  const [electricityCost, setElectricityCost] = useState<number | "">("");
  const [gasCost, setGasCost] = useState<number | "">("");
  const [waterCost, setWaterCost] = useState<number | "">("");
  const [a4PaperCost, setA4PaperCost] = useState<number | "">("");
  const [disposableCost, setDisposableCost] = useState<number | "">("");
  const [wasteDisposalCost, setWasteDisposalCost] = useState<number | "">("");

  const [teacherTraining, setTeacherTraining] = useState(false);
  const [learningCommunity, setLearningCommunity] = useState(false);
  const [studentClub, setStudentClub] = useState(false);
  const [uniformReuse, setUniformReuse] = useState(false);
  const [sharingMarket, setSharingMarket] = useState(false);
  const [plantBasedMeals, setPlantBasedMeals] = useState(false);
  const [localFoodbank, setLocalFoodbank] = useState(false);
  const [dataLiteracyEdu, setDataLiteracyEdu] = useState(false);
  const [communityLink, setCommunityLink] = useState(false);

  const [schoolGardenArea, setSchoolGardenArea] = useState<number | "">("");
  const [rainwaterTank, setRainwaterTank] = useState<number | "">("");
  const [trashProcessingCost, setTrashProcessingCost] = useState<number | "">("");
  const [resourceRecoveryRevenue, setResourceRecoveryRevenue] = useState<number | "">("");
  const [solarGeneration, setSolarGeneration] = useState<number | "">("");

  const tabTitle = useMemo(() => (tab === "basic" ? "학교 기초정보" : "행동 · 문화 · 환경"), [tab]);

  // ✅ load
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoadingDoc(true);
      try {
        const db = getFirebaseDb();
        const ref = doc(db, "schools", schoolId);
        const snap = await getDoc(ref);
        if (!alive) return;

        const data: SchoolDoc | null = snap.exists() ? (snap.data() as SchoolDoc) : null;

        const b = data?.basic ?? {};
        setStudents(typeof b.students === "number" ? b.students : "");
        setStaff(typeof b.staff === "number" ? b.staff : "");
        setClasses(typeof b.classes === "number" ? b.classes : "");
        setBuildingArea(typeof b.building_area_m2 === "number" ? b.building_area_m2 : "");
        setPlayground(typeof b.playground_m2 === "number" ? b.playground_m2 : "");
        setCoolMin(typeof b.cooling?.min === "number" ? b.cooling.min : 22.4);
        setCoolMax(typeof b.cooling?.max === "number" ? b.cooling.max : 26.9);
        setHeatMin(typeof b.heating?.min === "number" ? b.heating.min : 23.1);
        setHeatMax(typeof b.heating?.max === "number" ? b.heating.max : 27.0);
        setPlanDoc(!!b.checklist?.planDoc);
        setEcoCoolRoof(!!b.checklist?.ecoCoolRoof);
        setSmartStandby(!!b.checklist?.smartStandby);
        setInsulation(!!b.checklist?.insulation);
        setBoard(!!b.checklist?.board);

        const c = data?.bce ?? {};
        const costs = c.behavior_costs ?? {};
        setElectricityCost(typeof costs.electricity_cost === "number" ? costs.electricity_cost : "");
        setGasCost(typeof costs.gas_cost === "number" ? costs.gas_cost : "");
        setWaterCost(typeof costs.water_cost === "number" ? costs.water_cost : "");
        setA4PaperCost(typeof costs.a4_paper_cost === "number" ? costs.a4_paper_cost : "");
        setDisposableCost(typeof costs.disposable_cost === "number" ? costs.disposable_cost : "");
        setWasteDisposalCost(typeof costs.waste_disposal_cost === "number" ? costs.waste_disposal_cost : "");

        const checks = c.culture_checks ?? {};
        setTeacherTraining(!!checks.teacher_training);
        setLearningCommunity(!!checks.learning_community);
        setStudentClub(!!checks.student_club);
        setUniformReuse(!!checks.uniform_reuse);
        setSharingMarket(!!checks.sharing_market);
        setPlantBasedMeals(!!checks.plant_based_meals);
        setLocalFoodbank(!!checks.local_foodbank);
        setDataLiteracyEdu(!!checks.data_literacy_edu);
        setCommunityLink(!!checks.community_link);

        const env = c.environment ?? {};
        setSchoolGardenArea(typeof env.school_garden_area_m2 === "number" ? env.school_garden_area_m2 : "");
        setRainwaterTank(typeof env.rainwater_tank_l === "number" ? env.rainwater_tank_l : "");
        setTrashProcessingCost(typeof env.trash_processing_cost === "number" ? env.trash_processing_cost : "");
        setResourceRecoveryRevenue(typeof env.resource_recovery_revenue === "number" ? env.resource_recovery_revenue : "");
        setSolarGeneration(typeof env.solar_generation_kwh === "number" ? env.solar_generation_kwh : "");
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoadingDoc(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [schoolId]);

  const locked = !isEditing || saving || loadingDoc;

  function startEdit() {
    if (loadingDoc || saving) return;
    setEditingTab(tab);
  }

  function cancelEdit() {
    // 취소는 "다시 불러오기"로 단순화 (롤백 확실 + 코드 줄임)
    setEditingTab(null);
    // 현재 schoolId 문서를 다시 로드
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        setLoadingDoc(true);
        const db = getFirebaseDb();
        const ref = doc(db, "schools", schoolId);
        const snap = await getDoc(ref);
        const data: SchoolDoc | null = snap.exists() ? (snap.data() as SchoolDoc) : null;

        const b = data?.basic ?? {};
        setStudents(typeof b.students === "number" ? b.students : "");
        setStaff(typeof b.staff === "number" ? b.staff : "");
        setClasses(typeof b.classes === "number" ? b.classes : "");
        setBuildingArea(typeof b.building_area_m2 === "number" ? b.building_area_m2 : "");
        setPlayground(typeof b.playground_m2 === "number" ? b.playground_m2 : "");
        setCoolMin(typeof b.cooling?.min === "number" ? b.cooling.min : 22.4);
        setCoolMax(typeof b.cooling?.max === "number" ? b.cooling.max : 26.9);
        setHeatMin(typeof b.heating?.min === "number" ? b.heating.min : 23.1);
        setHeatMax(typeof b.heating?.max === "number" ? b.heating.max : 27.0);
        setPlanDoc(!!b.checklist?.planDoc);
        setEcoCoolRoof(!!b.checklist?.ecoCoolRoof);
        setSmartStandby(!!b.checklist?.smartStandby);
        setInsulation(!!b.checklist?.insulation);
        setBoard(!!b.checklist?.board);

        const c = data?.bce ?? {};
        const costs = c.behavior_costs ?? {};
        setElectricityCost(typeof costs.electricity_cost === "number" ? costs.electricity_cost : "");
        setGasCost(typeof costs.gas_cost === "number" ? costs.gas_cost : "");
        setWaterCost(typeof costs.water_cost === "number" ? costs.water_cost : "");
        setA4PaperCost(typeof costs.a4_paper_cost === "number" ? costs.a4_paper_cost : "");
        setDisposableCost(typeof costs.disposable_cost === "number" ? costs.disposable_cost : "");
        setWasteDisposalCost(typeof costs.waste_disposal_cost === "number" ? costs.waste_disposal_cost : "");

        const checks = c.culture_checks ?? {};
        setTeacherTraining(!!checks.teacher_training);
        setLearningCommunity(!!checks.learning_community);
        setStudentClub(!!checks.student_club);
        setUniformReuse(!!checks.uniform_reuse);
        setSharingMarket(!!checks.sharing_market);
        setPlantBasedMeals(!!checks.plant_based_meals);
        setLocalFoodbank(!!checks.local_foodbank);
        setDataLiteracyEdu(!!checks.data_literacy_edu);
        setCommunityLink(!!checks.community_link);

        const env = c.environment ?? {};
        setSchoolGardenArea(typeof env.school_garden_area_m2 === "number" ? env.school_garden_area_m2 : "");
        setRainwaterTank(typeof env.rainwater_tank_l === "number" ? env.rainwater_tank_l : "");
        setTrashProcessingCost(typeof env.trash_processing_cost === "number" ? env.trash_processing_cost : "");
        setResourceRecoveryRevenue(typeof env.resource_recovery_revenue === "number" ? env.resource_recovery_revenue : "");
        setSolarGeneration(typeof env.solar_generation_kwh === "number" ? env.solar_generation_kwh : "");
      } finally {
        setLoadingDoc(false);
      }
    })();
  }

  async function save() {
    setSaving(true);
    try {
      const db = getFirebaseDb();
      const ref = doc(db, "schools", schoolId);

      if (tab === "basic") {
        const payload: SchoolDoc = {
          basic: {
            students: students === "" ? null : students,
            staff: staff === "" ? null : staff,
            classes: classes === "" ? null : classes,
            building_area_m2: buildingArea === "" ? null : buildingArea,
            playground_m2: playground === "" ? null : playground,
            cooling: { min: coolMin, max: coolMax },
            heating: { min: heatMin, max: heatMax },
            checklist: { planDoc, ecoCoolRoof, smartStandby, insulation, board },
          },
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, payload, { merge: true });
      } else {
        const payload: SchoolDoc = {
          bce: {
            behavior_costs: {
              electricity_cost: electricityCost === "" ? null : electricityCost,
              gas_cost: gasCost === "" ? null : gasCost,
              water_cost: waterCost === "" ? null : waterCost,
              a4_paper_cost: a4PaperCost === "" ? null : a4PaperCost,
              disposable_cost: disposableCost === "" ? null : disposableCost,
              waste_disposal_cost: wasteDisposalCost === "" ? null : wasteDisposalCost,
            },
            culture_checks: {
              teacher_training: teacherTraining,
              learning_community: learningCommunity,
              student_club: studentClub,
              uniform_reuse: uniformReuse,
              sharing_market: sharingMarket,
              plant_based_meals: plantBasedMeals,
              local_foodbank: localFoodbank,
              data_literacy_edu: dataLiteracyEdu,
              community_link: communityLink,
            },
            environment: {
              school_garden_area_m2: schoolGardenArea === "" ? null : schoolGardenArea,
              rainwater_tank_l: rainwaterTank === "" ? null : rainwaterTank,
              trash_processing_cost: trashProcessingCost === "" ? null : trashProcessingCost,
              resource_recovery_revenue: resourceRecoveryRevenue === "" ? null : resourceRecoveryRevenue,
              solar_generation_kwh: solarGeneration === "" ? null : solarGeneration,
            },
          },
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, payload, { merge: true });
      }

      setEditingTab(null);
      showToast("저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장 실패 (콘솔 확인)");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell variant="plain">
      <div style={{ display: "grid", gap: 12 }}>
        {/* 탭 */}
        <div style={{ display: "flex", gap: 10 }}>
          <TabButton active={tab === "basic"} onClick={() => setTab("basic")}>
            학교 기초정보
          </TabButton>
          <TabButton active={tab === "bce"} onClick={() => setTab("bce")}>
            행동 · 문화 · 환경
          </TabButton>
        </div>

        <section
          style={{
            background: "white",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 16,
            width: "100%",
          }}
        >
          {/* 제목 + 연필 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.text }}>{tabTitle}</div>

            {!isEditing && (
              <button
                type="button"
                onClick={startEdit}
                disabled={loadingDoc || saving}
                title="수정하기"
                aria-label="수정하기"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: "white",
                  color: COLORS.sub,
                  cursor: loadingDoc || saving ? "not-allowed" : "pointer",
                  opacity: loadingDoc || saving ? 0.6 : 1,
                }}
              >
                <PencilIcon size={16} />
              </button>
            )}
          </div>

          {/* 카드 */}
          <div className="lockedFrame">
            <div className={`lockedArea ${locked ? "isLocked" : ""}`}>
              <div className="threeColWrap">
                {tab === "basic" ? (
                  <>
                    <Card>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
                        <Field label="학생수" unit="명" value={students} onChange={setStudents} maxWidth={220} disabled={locked} />
                        <Field label="교직원수" unit="명" value={staff} onChange={setStaff} maxWidth={220} disabled={locked} />
                        <Field label="학급수" unit="개" value={classes} onChange={setClasses} maxWidth={220} disabled={locked} />
                        <Field label="건물 면적" unit="㎡" value={buildingArea} onChange={setBuildingArea} maxWidth={240} disabled={locked} />
                        <Field label="운동장 현황" unit="㎡" value={playground} onChange={setPlayground} maxWidth={240} disabled={locked} />
                      </div>
                    </Card>

                    <Card>
                      <div style={{ display: "grid", gap: 18, maxWidth: 360, margin: "0 auto" }}>
                        <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
                          <Label>냉방 설정온도</Label>
                          <DualRange
                            min={MIN}
                            max={MAX}
                            step={STEP}
                            gap={GAP}
                            leftValue={coolMin}
                            rightValue={coolMax}
                            onChange={(l, r) => {
                              setCoolMin(l);
                              setCoolMax(r);
                            }}
                            formatValue={(v) => `${Number(v).toFixed(1)}°`}
                            showBubbles
                            showEnds={false}
                            disabled={locked}
                          />
                        </div>

                        <div style={{ display: "grid", gap: 14 }}>
                          <Label>난방 설정온도</Label>
                          <DualRange
                            min={MIN}
                            max={MAX}
                            step={STEP}
                            gap={GAP}
                            leftValue={heatMin}
                            rightValue={heatMax}
                            onChange={(l, r) => {
                              setHeatMin(l);
                              setHeatMax(r);
                            }}
                            formatValue={(v) => `${Number(v).toFixed(1)}°`}
                            showBubbles
                            showEnds={false}
                            disabled={locked}
                          />
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div style={{ display: "grid", gap: 10 }}>
                        <Toggle label="계획서 작성" value={planDoc} onChange={setPlanDoc} disabled={locked} />
                        <Toggle label="에코 쿨루프 시공" value={ecoCoolRoof} onChange={setEcoCoolRoof} disabled={locked} />
                        <Toggle label="스마트 대기전력 차단" value={smartStandby} onChange={setSmartStandby} disabled={locked} />
                        <Toggle label="단열시설 설치" value={insulation} onChange={setInsulation} disabled={locked} />
                        <Toggle label="게시판 설치" value={board} onChange={setBoard} disabled={locked} />
                      </div>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card title="행동영역">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
                        <Field label="전기세 지출" unit="원" value={electricityCost} onChange={setElectricityCost} disabled={locked} />
                        <Field label="가스비 지출" unit="원" value={gasCost} onChange={setGasCost} disabled={locked} />
                        <Field label="수도세 지출" unit="원" value={waterCost} onChange={setWaterCost} disabled={locked} />
                        <Field label="A4용지 구입 비용" unit="원" value={a4PaperCost} onChange={setA4PaperCost} disabled={locked} />
                        <Field label="일회용품 구입 비용" unit="원" value={disposableCost} onChange={setDisposableCost} disabled={locked} />
                        <Field label="폐기물 처리 비용" unit="원" value={wasteDisposalCost} onChange={setWasteDisposalCost} disabled={locked} />
                      </div>
                    </Card>

                    <Card title="운영">
                      <div style={{ display: "grid", gap: 10 }}>
                        <Toggle label="교사 연수 운영" value={teacherTraining} onChange={setTeacherTraining} disabled={locked} />
                        <Toggle label="학습공동체 운영" value={learningCommunity} onChange={setLearningCommunity} disabled={locked} />
                        <Toggle label="학생 동아리 운영" value={studentClub} onChange={setStudentClub} disabled={locked} />
                        <Toggle label="교복 물려주기 실시" value={uniformReuse} onChange={setUniformReuse} disabled={locked} />
                        <Toggle label="나눔장터 운영" value={sharingMarket} onChange={setSharingMarket} disabled={locked} />
                        <Toggle label="채식 중심 식단 운영" value={plantBasedMeals} onChange={setPlantBasedMeals} disabled={locked} />
                        <Toggle label="지역 푸드뱅크 활용" value={localFoodbank} onChange={setLocalFoodbank} disabled={locked} />
                        <Toggle label="데이터 활용 교육 운영" value={dataLiteracyEdu} onChange={setDataLiteracyEdu} disabled={locked} />
                        <Toggle label="지역사회 연계 활동" value={communityLink} onChange={setCommunityLink} disabled={locked} />
                      </div>
                    </Card>

                    <Card title="환경영역">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
                        <Field label="학교 정원 면적" unit="㎡" value={schoolGardenArea} onChange={setSchoolGardenArea} disabled={locked} />
                        <Field label="빗물 저금통 용량" unit="L" value={rainwaterTank} onChange={setRainwaterTank} disabled={locked} />
                        <Field label="쓰레기 처리 비용" unit="원" value={trashProcessingCost} onChange={setTrashProcessingCost} disabled={locked} />
                        <Field label="자원 회수 수익" unit="원" value={resourceRecoveryRevenue} onChange={setResourceRecoveryRevenue} disabled={locked} />
                        <Field label="태양광 발전량" unit="kWh" value={solarGeneration} onChange={setSolarGeneration} disabled={locked} />
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* 잠금 오버레이 + 아이콘만 */}
            {locked ? (
              <div className="lockOverlay" aria-hidden="true">
                <div className="lockIcon" title="수정하려면 연필을 누르세요">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 11V8a5 5 0 0 1 10 0v3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 11h12v10H6V11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>

          {/* 카드 아래 오른쪽 끝 버튼(공간 항상 확보) */}
          <div className={`footerActions ${isEditing ? "show" : "hide"}`}>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving || loadingDoc}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: "#f8fafc",
                color: COLORS.sub,
                fontWeight: 800,
                cursor: saving || loadingDoc ? "not-allowed" : "pointer",
                opacity: saving || loadingDoc ? 0.65 : 1,
              }}
            >
              취소
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saving || loadingDoc}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: COLORS.blue,
                color: "white",
                fontWeight: 900,
                cursor: saving || loadingDoc ? "not-allowed" : "pointer",
                opacity: saving || loadingDoc ? 0.75 : 1,
              }}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>

          {/* Toast */}
          {toast ? (
            <div className="toast" role="status" aria-live="polite">
              {toast}
            </div>
          ) : null}

          <style jsx global>{`
            /* ✅ number input 화살표 제거 */
            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            input[type="number"] {
              -moz-appearance: textfield;
              appearance: textfield;
            }

            .lockedFrame {
              position: relative;
              width: 100%;
            }

            .lockedArea.isLocked {
              opacity: 0.78; /* ✅ 덜 뿌옇게 */
              filter: grayscale(0.12);
              transition: opacity 160ms ease, filter 160ms ease;
            }

            .lockOverlay {
              position: absolute;
              inset: 0;
              cursor: default;
              background: transparent;
              z-index: 5;
            }

            .lockIcon {
              position: absolute;
              right: 14px;
              bottom: 14px;
              width: 34px;
              height: 34px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #9ca3af;
              background: transparent;
            }

            .threeColWrap {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 14px;
              align-items: start;
              width: 100%;
              max-width: 1180px;
              margin: 0 auto;
            }

            @media (max-width: 1100px) {
              .threeColWrap {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
            }

            @media (max-width: 780px) {
              .threeColWrap {
                grid-template-columns: 1fr;
              }
            }

            .footerActions {
              width: 100%;
              max-width: 1180px;
              margin: 12px auto 0 auto;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 8px;
              min-height: 40px; /* ✅ 버튼 없어도 공간 확보 */
            }

            .footerActions.hide {
              visibility: hidden;
              pointer-events: none;
            }
            .footerActions.show {
              visibility: visible;
              pointer-events: auto;
            }

            .toast {
              position: fixed;
              left: 50%;
              bottom: 28px;
              transform: translateX(-50%);
              background: #111827;
              color: white;
              padding: 10px 14px;
              border-radius: 999px;
              font-size: 13px;
              font-weight: 900;
              box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
              z-index: 50;
            }
          `}</style>
        </section>
      </div>
    </AppShell>
  );
}
