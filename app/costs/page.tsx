"use client";
import { useState } from "react";
import { BudgetSummaryPanel } from "@/components/costs/BudgetSummaryPanel";
import { CashImpactPanel } from "@/components/costs/CashImpactPanel";
import { CostItemEditorDrawer } from "@/components/costs/CostItemEditorDrawer";
import { CostItemList } from "@/components/costs/CostItemList";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickAddBar } from "@/components/shared/QuickAddBar";
import { isExpense, isFund, summarizeCashImpact, summarizeExpenseBudget } from "@/lib/aggregation";
import { useAppData } from "@/lib/client/store";
import { addExpenseItem, addFundItem } from "@/lib/services/costItems";
import type { CostItem } from "@/lib/types";

type Tab = "expense" | "fund";

export default function CostsPage() {
  const { data, mutate } = useAppData();
  const [tab, setTab] = useState<Tab>("expense");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);

  if (!data) return <div className="py-20 text-center text-sm text-zinc-400">불러오는 중…</div>;

  const items = data.costItems.filter(tab === "expense" ? isExpense : isFund);

  const openCreate = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };
  const openEdit = (item: CostItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const quickAdd = (name: string) => {
    if (tab === "expense") mutate((d) => addExpenseItem(d, { name }));
    else mutate((d) => addFundItem(d, { name, direction: "outflow" }));
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">비용·자금</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BudgetSummaryPanel summary={summarizeExpenseBudget(data.project, data.costItems)} />
        <CashImpactPanel
          impact={summarizeCashImpact(data.project, data.costItems, data.payments)}
          hasStartingCash={data.project.startingCash != null}
        />
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setTab("expense")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${tab === "expense" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500"}`}
        >
          실비
        </button>
        <button
          type="button"
          onClick={() => setTab("fund")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${tab === "fund" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500"}`}
        >
          자금이동
        </button>
      </div>

      <QuickAddBar
        placeholder={tab === "expense" ? "실비 항목 추가 (예: 포장이사 업체)" : "자금 항목 추가 (예: 전세 보증금)"}
        onSubmit={quickAdd}
      />

      {items.length === 0 ? (
        <EmptyState
          title={tab === "expense" ? "등록된 실비 항목이 없습니다" : "등록된 자금 항목이 없습니다"}
          description="위에서 빠르게 추가하거나, 자세히 입력하려면 아래 버튼을 눌러주세요."
          action={
            <button type="button" onClick={openCreate} className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              + 자세히 입력해서 추가
            </button>
          }
        />
      ) : (
        <CostItemList items={items} onOpen={openEdit} />
      )}

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-20 right-4 z-30 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 md:bottom-8 md:right-8"
      >
        + 비용
      </button>

      <CostItemEditorDrawer item={editingItem} defaultKind={tab} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
