"use client";
import { useAppData } from "@/lib/client/store";

/**
 * v1은 "최신 내용 다시 불러오기"만 제공한다(강제 덮어쓰기 없음).
 * 재조회 사이에 만든 로컬 수정은 사라질 수 있음을 알린다 — 조용히 덮어쓰는 것보다 안전한 선택.
 */
export function ConflictDialog() {
  const { saveStatus, reloadFromConflict } = useAppData();
  if (saveStatus !== "conflict") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">저장 충돌이 발생했습니다</p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          다른 기기(또는 다른 탭)에서 먼저 저장한 내용이 있어, 방금 변경한 내용은 저장되지 않았습니다.
          최신 내용을 다시 불러오면 지금 화면의 변경 사항은 사라집니다.
        </p>
        <button
          type="button"
          onClick={reloadFromConflict}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          최신 내용 다시 불러오기
        </button>
      </div>
    </div>
  );
}
