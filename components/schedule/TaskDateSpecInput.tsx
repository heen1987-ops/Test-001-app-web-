"use client";
import { formatDateDisplay, resolveDate, today, type DateAnchors } from "@/lib/dates";
import type { TaskDateSpec } from "@/lib/types";

type Mode = "unscheduled" | "moveDate" | "settlementDate" | "fixed";

const MODE_OPTIONS: [Mode, string][] = [
  ["unscheduled", "미정"],
  ["moveDate", "이사일 기준"],
  ["settlementDate", "잔금일 기준"],
  ["fixed", "고정일"],
];

function specToMode(spec: TaskDateSpec): Mode {
  if (spec.type === "unscheduled") return "unscheduled";
  if (spec.type === "fixed") return "fixed";
  return spec.anchor;
}

export function TaskDateSpecInput({
  label,
  value,
  onChange,
  anchors,
}: {
  label: string;
  value: TaskDateSpec;
  onChange: (spec: TaskDateSpec) => void;
  anchors: DateAnchors;
}) {
  const mode = specToMode(value);
  const resolved = resolveDate(value, anchors);

  const handleModeChange = (next: Mode) => {
    if (next === "unscheduled") onChange({ type: "unscheduled" });
    else if (next === "fixed") onChange({ type: "fixed", date: resolved ?? today() });
    else onChange({ type: "relative", anchor: next, offsetDays: value.type === "relative" ? value.offsetDays : 0 });
  };

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {MODE_OPTIONS.map(([m, l]) => (
          <button
            type="button"
            key={m}
            onClick={() => handleModeChange(m)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              mode === m ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {value.type === "relative" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value.offsetDays}
            onChange={(e) => onChange({ ...value, offsetDays: Number(e.target.value) })}
            className="w-24 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
          <span className="text-xs text-subtle">일 (음수는 이전)</span>
        </div>
      )}
      {value.type === "fixed" && (
        <input
          type="date"
          value={value.date}
          onChange={(e) => onChange({ type: "fixed", date: e.target.value })}
          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
        />
      )}
      {resolved && value.type === "relative" && <p className="text-xs text-subtle">→ {formatDateDisplay(resolved)}</p>}
    </div>
  );
}
