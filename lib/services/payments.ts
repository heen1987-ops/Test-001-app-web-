import { createPayment } from "../factories";
import type { Payment, ProjectData } from "../types";

/**
 * idempotencyKey는 폼을 여는 시점에 한 번 생성해서 넘긴다. 같은 키가 이미 존재하면
 * 추가하지 않고 그대로 반환한다 — 재시도나 중복 클릭으로 같은 지급내역이 두 번 쌓이는 것을 막는다.
 */
export function addPayment(
  data: ProjectData,
  input: Partial<Payment> & { costItemId: string; type: Payment["type"] },
): ProjectData {
  if (input.idempotencyKey && data.payments.some((p) => p.idempotencyKey === input.idempotencyKey)) {
    return data;
  }
  return { ...data, payments: [...data.payments, createPayment(input)] };
}

export function updatePayment(data: ProjectData, paymentId: string, patch: Partial<Payment>): ProjectData {
  return {
    ...data,
    payments: data.payments.map((p) =>
      p.id === paymentId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
    ),
  };
}

export function deletePayment(data: ProjectData, paymentId: string): ProjectData {
  return { ...data, payments: data.payments.filter((p) => p.id !== paymentId) };
}
