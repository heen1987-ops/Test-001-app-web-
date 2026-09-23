"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-extrabold text-foreground">페이지를 찾을 수 없습니다</h2>
      <p className="mt-2 text-sm text-muted">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-ink"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
