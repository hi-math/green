// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 10,
        textDecoration: "none",
        color: active ? "white" : "#111827",
        background: active ? "#111827" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside
      style={{
        width: 240,
        padding: 16,
        borderRight: "1px solid #e5e7eb",
        background: "white",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>
        탄소중립 학교
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <NavItem href="/" label="홈" />
        <NavItem href="/school" label="학교정보 입력" />
      </div>

      {/* ✅ 로그인된 경우에만 사용자 영역 표시 */}
      {user && (
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>계정</div>

          <div
            style={{
              fontSize: 13,
              marginTop: 6,
              wordBreak: "break-all",
              color: "#111827",
            }}
          >
            {user.email}
          </div>

          <button
            onClick={logout}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </aside>
  );
}
