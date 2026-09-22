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
            className={`flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left dark:border-zinc-800 dark:bg-zinc-900 ${
              item.status === "cancelled" ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.name}</span>
              <span className="text-xs text-zinc-400">
                {vendor?.name ?? "업체 미지정"} · {STATUS_LABEL[item.status]}
              </span>
            </div>
            <div className="text-right">
              <MoneyAmount amount={reference} className="block text-sm font-medium text-zinc-800 dark:text-zinc-100" />
              {due != null && due > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
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
