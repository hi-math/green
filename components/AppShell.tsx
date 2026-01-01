// components/AppShell.tsx
"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/lib/auth";
type AppShellVariant = "default" | "plain";

type Props = {
  children: ReactNode;
  variant?: AppShellVariant;

};

type NavItem = { label: string; href: string; icon: "home" | "school" };

const NAV: NavItem[] = [
  { label: "홈", href: "/", icon: "home" },
  { label: "학교정보", href: "/school", icon: "school" },
];

const COLORS = {
  canvas: "#F5F4EF",
  sidebarBg: "#FFFFFF",
  border: "#E7E5E4",
  text: "#0F172A",
  sub: "#64748B",
  navy: "#1F3A8A",
  activeBg: "#EEF2FF",
};

function FullscreenFallback({ text }: { text: string }) {
  return (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        placeItems: "center",
        background: COLORS.canvas,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {text}
    </div>
  );
}

function Icon({ name, active }: { name: NavItem["icon"]; active: boolean }) {
  const stroke = active ? COLORS.navy : COLORS.sub;

  if (name === "home") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 10.5L12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9.5 21V14h5v7" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3.5 9.5 12 5l8.5 4.5L12 14 3.5 9.5Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M6.5 11v6.5c0 .6 2.4 2 5.5 2s5.5-1.4 5.5-2V11" stroke={stroke} strokeWidth="2" />
      <path d="M20.5 9.5V16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11v2a2 2 0 0 0 2 2h2l6 4V7l-6 4H5a2 2 0 0 0-2 2Z"
        stroke={COLORS.navy}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M17 9a4 4 0 0 1 0 6" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" />
      <path d="M19 7a7 7 0 0 1 0 10" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type NoticeItem = {
  title: string;
  body?: string;
};

function NoticeModal({
  open,
  notice,
  onClose,
}: {
  open: boolean;
  notice: NoticeItem | null;
  onClose: () => void;
}) {
  if (!open || !notice) return null;

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
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 94vw)",
          background: "white",
          borderRadius: 18,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: 16,
            borderBottom: `1px solid ${COLORS.border}`,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 950, color: COLORS.text, letterSpacing: -0.2 }}>공지사항</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: `1px solid ${COLORS.border}`,
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

        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 950, color: COLORS.text }}>{notice.title}</div>
          {notice.body ? (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.sub,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}
            >
              {notice.body}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function safeInitial(name: string) {
  const t = (name ?? "").trim();
  if (!t) return "교";
  const first = t.replace(/\s+/g, "")[0];
  return first ?? "교";
}

export default function AppShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isLogin = pathname === "/login";

  const [schoolName, setSchoolName] = useState("학교");
  const [loggingOut, setLoggingOut] = useState(false);

  const notices = useMemo<NoticeItem[]>(
    () => [
      {
        title: "서울 학교 탄소중립 실행지원도구 개발 발표회",
        body: "서울 학교 탄소중립 실행지원도구 개발 발표회 안내입니다.\n\n- 프로그램: 도구 소개, 시연, 질의응답\n- 대상: 학교 담당자/교직원\n- 문의: 운영팀",
      },
      {
        title: "시스템 점검 안내 (오늘 18:00~19:00)",
        body: "점검 시간에는 일부 기능이 일시적으로 느리거나 제한될 수 있습니다.",
      },
      {
        title: "12월 데이터 반영 완료 안내",
        body: "전기/수도/가스/태양광 데이터가 12월 기준으로 업데이트되었습니다.",
      },
    ],
    [],
  );
  // ✅ 롤링은 항상 "위로"만: 마지막 -> 처음으로 넘어갈 때도 점프 없이 자연스럽게
  const [noticePos, setNoticePos] = useState(0); // 0..n (n은 복제된 마지막)
  const [noticeNoAnim, setNoticeNoAnim] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticePaused, setNoticePaused] = useState(false);

  useEffect(() => {
    if (isLogin) return;
    try {
      const stored = localStorage.getItem("schoolName");
      if (stored && stored.trim()) setSchoolName(stored.trim());
    } catch {}
  }, [isLogin]);

  useEffect(() => {
    if (isLogin) return;
    if (noticePaused) return; // ✅ 공지 클릭(모달 오픈) 시 롤링 정지
    const n = notices.length;
    if (n <= 1) return;
    const id = window.setInterval(() => {
      setNoticePos((x) => x + 1);
    }, 5000);
    return () => window.clearInterval(id);
  }, [isLogin, noticePaused, notices.length]);

  useEffect(() => {
    if (isLogin) return;
    const n = notices.length;
    if (n <= 1) return;
    if (noticePos !== n) return;

    const t = window.setTimeout(() => {
      setNoticeNoAnim(true);
      setNoticePos(0);
      window.requestAnimationFrame(() => setNoticeNoAnim(false));
    }, 460); // transition(420ms) + buffer

    return () => window.clearTimeout(t);
  }, [isLogin, noticePos, notices.length]);

  useEffect(() => {
    if (isLogin) return;
    if (!loading && !user) router.replace("/login");
  }, [isLogin, loading, user, router]);

  const activeHref = useMemo(() => {
    const hit = NAV.find((n) => (n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href)));
    return hit?.href ?? "/";
  }, [pathname]);

  const initial = useMemo(() => safeInitial(schoolName), [schoolName]);

  if (isLogin) return <>{children}</>;
  if (loading) return <FullscreenFallback text="불러오는 중…" />;
  if (!user) return <FullscreenFallback text="로그인 페이지로 이동 중…" />;

  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: COLORS.canvas, display: "flex" }}>
      {/* LEFT */}
      <aside style={{ width: 200, padding: 14, height: "100dvh", flex: "0 0 auto" }}>
        <div
          style={{
            height: "100%",
            background: COLORS.sidebarBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 16 }}>
            <Image src="/images/365.png" alt="logo" width={140} height={32} priority style={{ objectFit: "contain" }} />
          </div>

          <nav style={{ padding: "0 10px", display: "grid", gap: 6 }}>
            {NAV.map((item) => {
              const active = item.href === activeHref;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  style={{
                    width: "100%",
                    border: "none",
                    cursor: "pointer",
                    background: active ? COLORS.activeBg : "transparent",
                    borderRadius: 14,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon name={item.icon} active={active} />
                  <span style={{ fontSize: 13, fontWeight: active ? 800 : 700, color: active ? COLORS.navy : COLORS.sub }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={{ padding: 12 }}>
            <div
              style={{
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                background: "#FAFAFA",
                padding: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#EEF2FF",
                  border: "1px solid #E0E7FF",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 900,
                  color: COLORS.navy,
                }}
              >
                {initial}
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={schoolName}
              >
                {schoolName}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (loggingOut) return;
                setLoggingOut(true);
                try {
                  try {
                    localStorage.removeItem("schoolName");
                  } catch {}
                  await logout();
                } finally {
                  setLoggingOut(false);
                  router.replace("/login");
                }
              }}
              disabled={loggingOut}
              style={{
                marginTop: 10,
                width: "100%",
                height: 40,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                background: "white",
                color: COLORS.sub,
                fontWeight: 900,
                cursor: loggingOut ? "not-allowed" : "pointer",
                opacity: loggingOut ? 0.7 : 1,
              }}
            >
              {loggingOut ? "로그아웃 중…" : "로그아웃"}
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT */}
      <div style={{ flex: 1, minWidth: 0, height: "100dvh", overflowY: "auto", padding: "14px 18px 24px 0" }}>
        {/* 공지바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: "#EEF2FF",
              border: "1px solid #E0E7FF",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
            }}
          >
            <MegaphoneIcon />
          </div>

          <button
            type="button"
            onClick={() => {
              setNoticePaused(true);
              setNoticeModalOpen(true);
            }}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-label="공지사항 열기"
            title="클릭해서 자세히 보기"
          >
            <div style={{ height: 20, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridAutoRows: "20px",
                  transform: `translateY(-${noticePos * 20}px)`,
                  transition: noticeNoAnim ? "none" : "transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                {[...notices, notices[0]].filter(Boolean).map((n, i) => (
                  <div
                    key={`${n.title}-${i}`}
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#334155",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: "20px",
                    }}
                  >
                    {n.title}
                  </div>
                ))}
              </div>
            </div>
          </button>
        </div>

        <div style={{ paddingRight: 18 }}>{children}</div>
      </div>

      <NoticeModal
        open={noticeModalOpen}
        notice={notices[noticePos % Math.max(1, notices.length)] ?? null}
        onClose={() => {
          setNoticeModalOpen(false);
          setNoticePaused(false);
        }}
      />
    </div>
  );
}
