// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppShell from "@/components/AppShell";
import { getFirebaseAuth } from "@/lib/firebase";
import styles from "./login.module.css";


export default function LoginPage() {
  const router = useRouter();

  const [schoolName, setSchoolName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 어떤 레이아웃(AppShell)이든 스크롤이 생기지 않게 강제 잠금
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyMargin = body.style.margin;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.margin = "0";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.margin = prevBodyMargin;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const name = schoolName.trim();
      if (!name) throw new Error("학교 이름을 입력하세요.");

      const email = `${name}@sen.go.kr`;

      const a = getFirebaseAuth();
      if (!a) throw new Error("Firebase Auth 초기화 실패(.env 로딩/재시작 확인)");

      await signInWithEmailAndPassword(a, email, pw);
      localStorage.setItem("schoolName", name);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message ?? "로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      {/* ✅ 100dvh + overflow hidden 으로 “딱 맞게” */}
      <main style={{ height: "100dvh", overflow: "hidden", background: "#f1f5f9", position: "relative" }}>
        {/* 배경 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at top, rgba(59,130,246,0.15), transparent 60%)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.35,
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            zIndex: 0,
          }}
        />

        <div
          style={{
            height: "100%",
            display: "grid",
            placeItems: "center",
            padding: "clamp(10px, 2.2vw, 24px)",
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <section className={styles.card}>
            {/* LEFT: ✅ 이미지 “만” / 오버레이/글씨 전부 삭제 */}
            <div className={styles.leftCol}>
              <div className={styles.imageSquare}>
                <Image
                  src="/images/login5.jpg"
                  alt="login"
                  fill
                  priority
                  sizes="(max-width: 900px) 70vw, 50vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.rightCol}>
              <form onSubmit={onSubmit} className={styles.formInner}>
                <div
                  style={{
                    marginBottom: 32,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: -0.2,
                  }}
                >
                  로그인
                </div>

                <div style={{ display: "grid", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>학교이름</div>
                    <input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="예: 서울세곡초등학교, 오류중학교"
                      autoComplete="username"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        outline: "none",
                        fontSize: 14,
                        background: "white",
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>비밀번호</div>
                    <input
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="비밀번호"
                      type="password"
                      autoComplete="current-password"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        outline: "none",
                        fontSize: 14,
                        background: "white",
                      }}
                    />
                  </div>

                  {err && (
                    <div
                      style={{
                        color: "#b91c1c",
                        fontSize: 13,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        padding: "10px 12px",
                        borderRadius: 12,
                      }}
                    >
                      {err}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: 900,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.75 : 1,
                      boxShadow: "0 10px 25px rgba(37,99,235,0.20)",
                    }}
                  >
                    {loading ? "로그인 중…" : "로그인"}
                  </button>
                </div>

                <div
                  className="md:hidden"
                  style={{
                    marginTop: 18,
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: 14,
                  }}
                >
                  
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
