// 새 레코드를 만드는 곳을 한 군데로 모아, 기본값 누락이나 형태 불일치를 방지한다.
import { newId } from "./id";
import {
  CURRENT_SCHEMA_VERSION,
  type ExpenseItem,
  type FundItem,
  type Payment,
  type Project,
  type ProjectData,
  type ReferenceLink,
  type Task,
  type Vendor,
} from "./types";

function nowISO(): string {
  return new Date().toISOString();
}

export function createProject(input: {
  name: string;
  moveDate?: string | null;
  settlementDate?: string | null;
  budget?: number | null;
  contractType?: string | null;
  startingCash?: number | null;
}): Project {
  const ts = nowISO();
  return {
    id: newId(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: input.name,
    moveDate: input.moveDate ?? null,
    settlementDate: input.settlementDate ?? null,
    budget: input.budget ?? null,
    contractType: input.contractType ?? null,
    startingCash: input.startingCash ?? null,
    archived: false,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createEmptyProjectData(project: Project): ProjectData {
  return { project, tasks: [], costItems: [], payments: [], vendors: [], references: [] };
}

export function createTask(input: Partial<Task> & { title: string }): Task {
  const ts = nowISO();
  return {
    id: newId(),
    title: input.title,
    category: input.category ?? "",
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    startDate: input.startDate ?? { type: "unscheduled" },
    dueDate: input.dueDate ?? { type: "unscheduled" },
    notes: input.notes ?? "",
    dependsOn: input.dependsOn ?? [],
    costItemId: input.costItemId ?? null,
    assignee: input.assignee ?? null,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createExpenseItem(input: Partial<ExpenseItem> & { name: string }): ExpenseItem {
  const ts = nowISO();
  return {
    kind: "expense",
    id: newId(),
    name: input.name,
    subCategory: input.subCategory ?? "",
    expenseCategory: input.expenseCategory ?? "",
    status: input.status ?? "planned",
    vendorId: input.vendorId ?? null,
    estimatedAmount: input.estimatedAmount ?? null,
    confirmedAmount: input.confirmedAmount ?? null,
    quotes: input.quotes ?? [],
    selectedQuoteId: input.selectedQuoteId ?? null,
    notes: input.notes ?? "",
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createFundItem(input: Partial<FundItem> & { name: string; direction: FundItem["direction"] }): FundItem {
  const ts = nowISO();
  return {
    kind: "fund",
    id: newId(),
    name: input.name,
    subCategory: input.subCategory ?? "",
    fundCategory: input.fundCategory ?? "",
    direction: input.direction,
    status: input.status ?? "planned",
    vendorId: input.vendorId ?? null,
    estimatedAmount: input.estimatedAmount ?? null,
    confirmedAmount: input.confirmedAmount ?? null,
    quotes: input.quotes ?? [],
    selectedQuoteId: input.selectedQuoteId ?? null,
    notes: input.notes ?? "",
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createPayment(input: Partial<Payment> & { costItemId: string; type: Payment["type"] }): Payment {
  const ts = nowISO();
  return {
    id: newId(),
    costItemId: input.costItemId,
    type: input.type,
    status: input.status ?? "scheduled",
    amount: input.amount ?? null,
    sign: input.sign ?? 1,
    scheduledDate: input.scheduledDate ?? { type: "unscheduled" },
    paidDate: input.paidDate ?? null,
    method: input.method ?? null,
    notes: input.notes ?? "",
    idempotencyKey: input.idempotencyKey ?? newId(),
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createVendor(input: Partial<Vendor> & { name: string }): Vendor {
  const ts = nowISO();
  return {
    id: newId(),
    name: input.name,
    category: input.category ?? "",
    contact: input.contact ?? { phone: null, email: null, kakaoId: null },
    bookingStatus: input.bookingStatus ?? "not_contacted",
    notes: input.notes ?? "",
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createReferenceLink(input: Partial<ReferenceLink> & { title: string; url: string }): ReferenceLink {
  const ts = nowISO();
  return {
    id: newId(),
    title: input.title,
    url: input.url,
    linkedType: input.linkedType ?? "general",
    linkedId: input.linkedId ?? null,
    notes: input.notes ?? "",
    createdAt: ts,
    updatedAt: ts,
  };
}
