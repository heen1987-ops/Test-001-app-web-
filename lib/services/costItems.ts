// CostItem은 하드 삭제를 두지 않는다(연결된 Payment가 고아가 되는 것을 막기 위해) — 취소는
// status:'cancelled'로 표현한다. 실비/자금이동 여부(kind)는 생성 이후 바꾸지 않는다(별도 항목으로
// 다시 만들게 한다) — 서로 다른 종류로 전환하면서 estimatedAmount 등 의미가 바뀌는 것을 막기 위함.
import { createExpenseItem, createFundItem } from "../factories";
import type { CostItem, ExpenseItem, FundItem, ProjectData } from "../types";

export function addExpenseItem(data: ProjectData, input: Partial<ExpenseItem> & { name: string }): ProjectData {
  return { ...data, costItems: [...data.costItems, createExpenseItem(input)] };
}

export function addFundItem(
  data: ProjectData,
  input: Partial<FundItem> & { name: string; direction: FundItem["direction"] },
): ProjectData {
  return { ...data, costItems: [...data.costItems, createFundItem(input)] };
}

export function updateCostItem(data: ProjectData, costItemId: string, patch: Partial<CostItem>): ProjectData {
  return {
    ...data,
    costItems: data.costItems.map((item) =>
      item.id === costItemId
        ? ({ ...item, ...patch, updatedAt: new Date().toISOString() } as CostItem)
        : item,
    ),
  };
}
