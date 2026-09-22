import type { CostItem, Payment, ProjectData, Task, Vendor } from "./types";

export function exportProjectJSON(data: ProjectData): string {
  return JSON.stringify(data, null, 2);
}

export interface ImportSummary {
  projectName: string;
  taskCount: number;
  costItemCount: number;
  paymentCount: number;
  vendorCount: number;
  referenceCount: number;
}

export type ImportValidationResult =
  | { valid: true; data: ProjectData; summary: ImportSummary }
  | { valid: false; errors: string[] };

const ARRAY_KEYS = ["tasks", "costItems", "payments", "vendors", "references"] as const;

/**
 * 가져오기 전에 형태뿐 아니라 참조 무결성(costItemId/vendorId/dependsOn이 같은 파일 안에서
 * 실제로 존재하는지, id가 중복되지 않는지)까지 확인한다 — 깨진 참조를 가진 채로 덮어쓰지 않기 위해.
 */
export function validateImportedProjectData(raw: unknown): ImportValidationResult {
  const errors: string[] = [];
  if (typeof raw !== "object" || raw === null) {
    return { valid: false, errors: ["파일 형식이 올바르지 않습니다."] };
  }
  const obj = raw as Record<string, unknown>;

  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(obj[key])) errors.push(`"${key}" 항목이 없거나 배열이 아닙니다.`);
  }
  if (typeof obj.project !== "object" || obj.project === null) errors.push('"project" 항목이 없습니다.');
  if (errors.length > 0) return { valid: false, errors };

  const data = obj as unknown as ProjectData;

  const ids: Record<(typeof ARRAY_KEYS)[number], Set<string>> = {
    tasks: new Set(),
    costItems: new Set(),
    payments: new Set(),
    vendors: new Set(),
    references: new Set(),
  };
  for (const key of ARRAY_KEYS) {
    for (const rec of data[key] as { id?: string }[]) {
      if (!rec.id) {
        errors.push(`${key}에 id가 없는 항목이 있습니다.`);
        continue;
      }
      if (ids[key].has(rec.id)) errors.push(`${key}에 중복된 id(${rec.id})가 있습니다.`);
      ids[key].add(rec.id);
    }
  }

  for (const t of data.tasks) {
    if (t.costItemId && !ids.costItems.has(t.costItemId)) {
      errors.push(`할 일 "${t.title}"이 존재하지 않는 비용 항목을 참조합니다.`);
    }
    for (const dep of t.dependsOn) {
      if (!ids.tasks.has(dep)) errors.push(`할 일 "${t.title}"이 존재하지 않는 선행 작업을 참조합니다.`);
    }
  }
  for (const p of data.payments) {
    if (!ids.costItems.has(p.costItemId)) errors.push(`지급내역이 존재하지 않는 비용 항목(${p.costItemId})을 참조합니다.`);
  }
  for (const c of data.costItems) {
    if (c.vendorId && !ids.vendors.has(c.vendorId)) errors.push(`비용 항목 "${c.name}"이 존재하지 않는 업체를 참조합니다.`);
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data,
    summary: {
      projectName: data.project.name,
      taskCount: data.tasks.length,
      costItemCount: data.costItems.length,
      paymentCount: data.payments.length,
      vendorCount: data.vendors.length,
      referenceCount: data.references.length,
    },
  };
}

function csvEscape(value: string | number | null): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function toCSV(headers: string[], rows: (string | number | null)[][]): string {
  return [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
}

export function tasksToCSV(tasks: Task[]): string {
  return toCSV(
    ["제목", "분류", "상태", "우선순위", "담당", "메모"],
    tasks.map((t) => [t.title, t.category, t.status, t.priority, t.assignee, t.notes]),
  );
}

export function costItemsToCSV(costItems: CostItem[]): string {
  return toCSV(
    ["이름", "종류", "세부분류", "상태", "예상금액", "확정금액"],
    costItems.map((c) => [
      c.name,
      c.kind === "expense" ? "실비" : "자금이동",
      c.kind === "expense" ? c.expenseCategory : c.fundCategory,
      c.status,
      c.estimatedAmount,
      c.confirmedAmount,
    ]),
  );
}

export function paymentsToCSV(payments: Payment[], costItems: CostItem[]): string {
  const nameById = new Map(costItems.map((c) => [c.id, c.name]));
  return toCSV(
    ["비용 항목", "종류", "상태", "금액", "실제 지급일"],
    payments.map((p) => [nameById.get(p.costItemId) ?? "", p.type, p.status, p.amount, p.paidDate]),
  );
}

export function vendorsToCSV(vendors: Vendor[]): string {
  return toCSV(
    ["업체명", "분류", "예약상태", "전화", "이메일"],
    vendors.map((v) => [v.name, v.category, v.bookingStatus, v.contact.phone, v.contact.email]),
  );
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
