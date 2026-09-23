"use client";
import { MoneyAmount } from "@/components/shared/MoneyAmount";
import { amountStillDue } from "@/lib/aggregation";
import { useAppData } from "@/lib/client/store";
import type { CostItem } from "@/lib/types";

const STATUS_LABEL: Record<CostItem["status"], string> = {
  planned: "계획",
  quoted: "견적중",
  contracted: "계약완료",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
};

export function CostItemList({ items, onOpen }: { items: CostItem[]; onOpen: (item: CostItem) => void }) {
  const { data } = useAppData();
  if (!data) return null;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const vendor = data.vendors.find((v) => v.id === item.vendorId);
        const due = amountStillDue(item, data.payments);
        const reference = item.confirmedAmount ?? item.estimatedAmount;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className={`flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-left shadow-card transition-colors hover:border-accent/30 ${
              item.status === "cancelled" ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{item.name}</span>
              <span className="text-xs text-subtle">
                {vendor?.name ?? "업체 미지정"} · {STATUS_LABEL[item.status]}
              </span>
            </div>
            <div className="text-right">
              <MoneyAmount amount={reference} className="block text-sm font-bold text-foreground" />
              {due != null && due > 0 && (
                <span className="text-xs text-warning-ink">
                  남은 <MoneyAmount amount={due} />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
