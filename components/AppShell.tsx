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

  useEffect(() => {
    if (isLogin) return;
    try {
      const stored = localStorage.getItem("schoolName");
      if (stored && stored.trim()) setSchoolName(stored.trim());
    } catch {}
  }, [isLogin]);

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

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#334155",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            탄소중립 실천 데이터가 업데이트되었습니다.
          </div>
        </div>

        <div style={{ paddingRight: 18 }}>{children}</div>
      </div>
    </div>
  );
}
