"use client";
import { formatDateDisplay } from "@/lib/dates";
import type { AnchorChangeEffect } from "@/lib/dates";

export function AnchorDateChangePreviewDialog({
  effects,
  onConfirm,
  onCancel,
}: {
  effects: AnchorChangeEffect[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-card-md">
        <p className="font-extrabold tracking-tight text-foreground">기준일 변경 시 영향받는 일정</p>
        <p className="mt-1 text-sm text-muted">
          아래 {effects.length}건의 날짜가 자동으로 바뀝니다. 완료된 작업이나 직접 고정한 날짜는 영향받지 않습니다.
        </p>
        <ul className="mt-3 flex max-h-64 flex-col gap-1.5 overflow-y-auto">
          {effects.map((e, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              <span className="truncate text-foreground">{e.label}</span>
              <span className="shrink-0 text-xs text-subtle">
                {e.before ? formatDateDisplay(e.before) : "미정"} → {e.after ? formatDateDisplay(e.after) : "미정"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-2">
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-card hover:bg-accent-ink"
          >
            반영하기
          </button>
        </div>
      </div>
    </div>
  );
}
