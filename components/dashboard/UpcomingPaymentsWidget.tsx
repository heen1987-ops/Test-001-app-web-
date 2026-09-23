"use client";
import Link from "next/link";
import { useMemo } from "react";
import { MoneyAmount } from "@/components/shared/MoneyAmount";
import { useAppData } from "@/lib/client/store";
import { addDays, compareISODate, formatDateDisplay, resolveDate, today } from "@/lib/dates";

const TYPE_LABEL: Record<string, string> = {
  deposit: "계약금",
  interim: "중도금",
  balance: "잔금",
  refund: "환불",
  other: "기타",
};

/** 앞으로 7일 안에 예정된(아직 지급 전인) 지급 건을 모아 보여준다 — 홈 화면 전용. */
export function UpcomingPaymentsWidget() {
  const { data } = useAppData();

  const rows = useMemo(() => {
    if (!data) return [];
    const todayStr = today();
    const weekEnd = addDays(todayStr, 6);
    const result: { id: string; label: string; date: string; amount: number | null }[] = [];
    for (const p of data.payments) {
      if (p.status !== "scheduled") continue;
      const due = resolveDate(p.scheduledDate, data.project);
      if (!due) continue;
      if (compareISODate(due, todayStr) < 0 || compareISODate(due, weekEnd) > 0) continue;
      const item = data.costItems.find((c) => c.id === p.costItemId);
      result.push({
        id: p.id,
        label: `${item?.name ?? "알 수 없는 항목"} · ${TYPE_LABEL[p.type] ?? p.type}`,
        date: due,
        amount: p.amount,
      });
    }
    result.sort((a, b) => compareISODate(a.date, b.date));
    return result;
  }, [data]);

  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold tracking-tight text-foreground">이번 주 지급 예정</h2>
        <Link href="/costs" className="text-xs font-semibold text-accent-ink hover:underline">
          전체 보기 →
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-subtle">이번 주 예정된 지급이 없습니다.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-0.5 border-t border-border pt-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-2.5 rounded-lg px-1 py-2 text-sm">
              <span className="inline-flex min-w-14 flex-none justify-center rounded-full border border-warning/20 bg-warning-bg px-2 py-0.5 text-[11px] font-bold text-warning-ink">
                {formatDateDisplay(r.date).slice(5)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{r.label}</span>
              <MoneyAmount amount={r.amount} className="flex-none text-sm font-semibold text-foreground" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
