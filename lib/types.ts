// MOVE OS 도메인 타입. 저장소(JSON 파일)의 스키마이기도 하므로 변경 시 schemaVersion을 고려할 것.

export type ISODate = string; // "YYYY-MM-DD"
export type ISODateTime = string; // ISO 8601 UTC

export type DateAnchor = "moveDate" | "settlementDate";

/** 일정의 4가지 유형: 이사일 기준 / 잔금일 기준 / 고정일 / 미정 */
export type TaskDateSpec =
  | { type: "relative"; anchor: DateAnchor; offsetDays: number }
  | { type: "fixed"; date: ISODate }
  | { type: "unscheduled" };

export interface Project {
  id: string;
  schemaVersion: number;
  name: string;
  moveDate: ISODate | null;
  settlementDate: ISODate | null;
  budget: number | null;
  contractType: string | null;
  /** "보유 현금 전망" 계산에만 쓰이는 선택 필드. 입력 안 하면 해당 계산은 표시하지 않음. */
  startingCash: number | null;
  archived: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: TaskDateSpec;
  dueDate: TaskDateSpec;
  notes: string;
  /** 선행 작업 Task ID 목록 — 모두 done/cancelled 여야 이 작업이 막히지 않음 */
  dependsOn: string[];
  costItemId: string | null;
  assignee: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type CostItemStatus =
  | "planned"
  | "quoted"
  | "contracted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Quote {
  id: string;
  vendorId: string;
  /** null = 견적 요청만 하고 금액 미수신 */
  amount: number | null;
  receivedDate: ISODate | null;
  notes: string;
  status: "pending" | "selected" | "rejected";
}

interface CostItemBase {
  id: string;
  name: string;
  subCategory: string;
  status: CostItemStatus;
  vendorId: string | null;
  /** null = 미입력. 0과 다름(0원 확정과 미입력을 구분). */
  estimatedAmount: number | null;
  confirmedAmount: number | null;
  quotes: Quote[];
  /** 합계에는 이 견적만 반영. 나머지는 참고용으로만 남김. */
  selectedQuoteId: string | null;
  notes: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** 실비(이사업체/청소/설치/운송 등) */
export interface ExpenseItem extends CostItemBase {
  kind: "expense";
  expenseCategory: string;
}

/** 자금이동(보증금/매매대금/대출 등) — 실비와 절대 합산되지 않음 */
export interface FundItem extends CostItemBase {
  kind: "fund";
  fundCategory: string;
  direction: "inflow" | "outflow";
}

export type CostItem = ExpenseItem | FundItem;

export type PaymentType = "deposit" | "interim" | "balance" | "refund" | "other";
export type PaymentStatus = "scheduled" | "paid" | "cancelled";

export interface Payment {
  id: string;
  costItemId: string;
  type: PaymentType;
  status: PaymentStatus;
  /** null = 금액 미정 */
  amount: number | null;
  /** 환불/취소성 조정은 생성 시점에 -1로 고정. 합산 시점에 부호를 추론하지 않음. */
  sign: 1 | -1;
  scheduledDate: TaskDateSpec;
  paidDate: ISODate | null;
  method: string | null;
  notes: string;
  /** 폼을 여는 시점에 생성 — 중복 제출 방지용 */
  idempotencyKey: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type BookingStatus =
  | "not_contacted"
  | "quote_requested"
  | "quoted"
  | "booked"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: { phone: string | null; email: string | null; kakaoId: string | null };
  bookingStatus: BookingStatus;
  notes: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** v1: 외부 링크만. 원본 파일 업로드/신분증·계좌번호 등은 다루지 않음. */
export interface ReferenceLink {
  id: string;
  title: string;
  url: string;
  linkedType: "vendor" | "task" | "costItem" | "general";
  linkedId: string | null;
  notes: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** 저장소의 JSON 파일 하나 = 프로젝트 하나 */
export interface ProjectData {
  project: Project;
  tasks: Task[];
  costItems: CostItem[];
  payments: Payment[];
  vendors: Vendor[];
  references: ReferenceLink[];
}

export const CURRENT_SCHEMA_VERSION = 1;
