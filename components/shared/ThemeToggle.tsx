"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // 서버 렌더링과 클라이언트 첫 렌더링의 테마 불일치(hydration mismatch)를 피하기 위해
  // 마운트되기 전에는 아이콘을 표시하지 않는다.
  const [mounted, setMounted] = useState(false);
  // 클라이언트에 마운트됐다는 사실 자체를 외부 신호로 동기화하는 표준 패턴 — 파생 가능한
  // 값이 아니라서 렌더링 중에는 계산할 수 없다.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
