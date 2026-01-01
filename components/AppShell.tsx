// components/AppShell.tsx (display-only)
"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const COLORS = {
  canvas: "#F5F4EF",
  border: "#E7E5E4",
  text: "#0F172A",
  sub: "#64748B",
  navy: "#1F3A8A",
};

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

export default function AppShell({ children }: { children: ReactNode }) {
  const notices = useMemo<NoticeItem[]>(
    () => [
      {
        title: "서울 학교 탄소중립 실행지원도구 개발 발표회",
        body: "서울 학교 탄소중립 실행지원도구 개발 발표회 안내입니다.\n\n- 프로그램: 도구 소개, 시연, 질의응답\n- 대상: 학교 담당자/교직원\n- 문의: 운영팀",
      },
      { title: "시스템 점검 안내 (오늘 18:00~19:00)", body: "점검 시간에는 일부 기능이 일시적으로 느리거나 제한될 수 있습니다." },
      { title: "12월 데이터 반영 완료 안내", body: "전기/수도/가스/태양광 데이터가 12월 기준으로 업데이트되었습니다." },
    ],
    [],
  );

  const [noticePos, setNoticePos] = useState(0);
  const [noticeNoAnim, setNoticeNoAnim] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticePaused, setNoticePaused] = useState(false);

  useEffect(() => {
    if (noticePaused) return;
    const n = notices.length;
    if (n <= 1) return;
    const id = window.setInterval(() => setNoticePos((x) => x + 1), 5000);
    return () => window.clearInterval(id);
  }, [noticePaused, notices.length]);

  useEffect(() => {
    const n = notices.length;
    if (n <= 1) return;
    if (noticePos !== n) return;

    const t = window.setTimeout(() => {
      setNoticeNoAnim(true);
      setNoticePos(0);
      window.requestAnimationFrame(() => setNoticeNoAnim(false));
    }, 460);

    return () => window.clearTimeout(t);
  }, [noticePos, notices.length]);

  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: COLORS.canvas, display: "flex" }}>
      <div style={{ flex: 1, minWidth: 0, height: "100dvh", overflowY: "auto", padding: 14 }}>
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
