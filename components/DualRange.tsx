"use client";

import { useEffect, useRef } from "react";
import styles from "./DualRange.module.css";

type DualRangeProps = {
  min: number;
  max: number;
  gap: number;
  step?: number;
  disabled?: boolean;
  leftValue: number;
  rightValue: number;
  onChange: (left: number, right: number) => void;
  formatValue?: (v: number) => string;
  showBubbles?: boolean;
  showEnds?: boolean;
};

export default function DualRange({
  min,
  max,
  gap,
  step = 0.1,
  disabled = false,
  leftValue,
  rightValue,
  onChange,
  formatValue = (v) => String(v),
  showBubbles = true,
  showEnds = true,
}: DualRangeProps) {
  const rangeRef = useRef<HTMLDivElement>(null);
  const thumbLeftRef = useRef<HTMLDivElement>(null);
  const thumbRightRef = useRef<HTMLDivElement>(null);

  const percent = (v: number) => ((v - min) / (max - min)) * 100;

  useEffect(() => {
    const leftPct = percent(leftValue);
    const rightPct = percent(rightValue);

    if (thumbLeftRef.current) thumbLeftRef.current.style.left = `${leftPct}%`;
    if (thumbRightRef.current) thumbRightRef.current.style.right = `${100 - rightPct}%`;

    if (rangeRef.current) {
      rangeRef.current.style.left = `${leftPct}%`;
      rangeRef.current.style.right = `${100 - rightPct}%`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftValue, rightValue, min, max]);

  const snap = (v: number) => {
    const s = step <= 0 ? 1 : step;
    return Math.round(v / s) * s;
  };

  function onTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return; // ✅ disabled면 트랙 클릭/드래그 무시

    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left) / rect.width;
    const vv = Math.max(min, Math.min(snap(min + t * (max - min)), max));

    const distL = Math.abs(vv - leftValue);
    const distR = Math.abs(vv - rightValue);

    if (distL <= distR) {
      const nextL = Math.min(vv, rightValue - gap);
      onChange(nextL, rightValue);
    } else {
      const nextR = Math.max(vv, leftValue + gap);
      onChange(leftValue, nextR);
    }
  }

  return (
    <div className={styles.slider} data-disabled={disabled ? "1" : "0"}>
      {/* ✅ input 2개: 이벤트 담당 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={leftValue}
        disabled={disabled}
        onChange={(e) => {
          if (disabled) return;
          const v = Math.min(Number(e.target.value), rightValue - gap);
          onChange(v, rightValue);
        }}
        className={styles.inputLeft}
        aria-label="min"
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={rightValue}
        disabled={disabled}
        onChange={(e) => {
          if (disabled) return;
          const v = Math.max(Number(e.target.value), leftValue + gap);
          onChange(leftValue, v);
        }}
        className={styles.inputRight}
        aria-label="max"
      />

      {/* ✅ 보이는 트랙: 딱 1개만 */}
      <div
        className={styles.track}
        onPointerDown={onTrackPointerDown}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <div ref={rangeRef} className={styles.range} />

        <div ref={thumbLeftRef} className={`${styles.thumb} ${styles.thumbLeft}`}>
          {showBubbles ? <div className={styles.bubble}>{formatValue(leftValue)}</div> : null}
        </div>

        <div ref={thumbRightRef} className={`${styles.thumb} ${styles.thumbRight}`}>
          {showBubbles ? <div className={styles.bubble}>{formatValue(rightValue)}</div> : null}
        </div>

        {showEnds ? (
          <div className={styles.endLabels}>
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
