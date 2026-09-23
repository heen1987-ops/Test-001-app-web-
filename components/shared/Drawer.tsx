"use client";
import type { ReactNode } from "react";

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface p-5 shadow-card-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold tracking-tight text-foreground">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-subtle hover:text-foreground">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
