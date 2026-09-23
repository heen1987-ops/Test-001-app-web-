"use client";
import { useState, type FormEvent } from "react";

export function QuickAddBar({ placeholder, onSubmit }: { placeholder: string; onSubmit: (title: string) => void }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-accent-ink disabled:opacity-40"
      >
        추가
      </button>
    </form>
  );
}
