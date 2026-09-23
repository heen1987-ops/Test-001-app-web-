// 웹 리서치로 정리한 "이사 준비 체크리스트" 초안 — 설정 화면의 일괄 추가 버튼에서 사용한다.
// 각 항목의 dueOffsetDays는 anchor 기준 상대일(음수=이전, 양수=이후)이며, null이면 상황별이라 날짜를 고정하지 않는다.
import { createTask } from "./factories";
import type { DateAnchor, Task, TaskPriority } from "./types";

interface ChecklistItem {
  title: string;
  category: string;
  notes: string;
  priority: TaskPriority;
  anchor: DateAnchor | null;
  offsetDays: number | null;
  url?: string;
}

export const MOVE_CHECKLIST_ITEMS: ChecklistItem[] = [
  // 이사업체
  { title: "이사 방식(포장/반포장/일반) 정하기", category: "이사업체", notes: "포장이사는 편하지만 비쌈, 일반이사는 저렴하지만 직접 포장", priority: "medium", anchor: "moveDate", offsetDays: -42 },
  { title: "이사업체 견적 2~3곳 비교", category: "이사업체", notes: "동일한 조건(짐 목록·평수·이동거리)으로 받아야 비교가 정확함", priority: "medium", anchor: "moveDate", offsetDays: -21 },
  { title: "견적 포함 항목 확인", category: "이사업체", notes: "사다리차, 에어컨 이전설치, 대형가전 분해·조립, 폐기물 처리 포함 여부", priority: "medium", anchor: "moveDate", offsetDays: -21 },
  { title: "피아노·금고 등 특수물품 전문업체 예약", category: "이사업체", notes: "일반 이사업체 견적에 기본 포함되지 않는 경우가 많음", priority: "medium", anchor: "moveDate", offsetDays: -18 },
  { title: "짐 파손·수량 확인 및 사진 기록", category: "이사업체", notes: "인도 즉시 확인해야 추후 배상 청구 근거가 됨", priority: "medium", anchor: "moveDate", offsetDays: 0 },
  { title: "냉장고·세탁기 취급 주의", category: "이사업체", notes: "냉장고는 세워서 운반 후 3~4시간 대기 후 전원 연결, 드럼세탁기는 고정볼트 체결 확인", priority: "low", anchor: "moveDate", offsetDays: 0 },
  { title: "파손·분실 있었다면 업체에 먼저 통지, 합의 안 되면 소비자원", category: "이사업체", notes: "인도일로부터 통지 기한 내 업체에 신고해야 배상 청구권 유지 (표준약관 확인 필요), 합의가 안 되면 소비자원에 상담", priority: "high", anchor: "moveDate", offsetDays: 1, url: "https://kca.go.kr" },

  // 공과금·인프라
  { title: "인터넷/IPTV 이전설치 신청", category: "공과금·인프라", notes: "통신사 앱 또는 고객센터로 신청, 성수기엔 더 일찍", priority: "medium", anchor: "moveDate", offsetDays: -10 },
  { title: "도시가스 전출·전입 예약", category: "공과금·인프라", notes: "기사 방문이 필요해 당일 신청하면 늦을 수 있음 — 미리 예약", priority: "high", anchor: "moveDate", offsetDays: -7, url: "http://www.citygas.or.kr" },
  { title: "에어컨 철거·이전설치 기사 예약", category: "공과금·인프라", notes: "냉매가스 회수 등 전문지식이 필요해 별도 예약 권장", priority: "medium", anchor: "moveDate", offsetDays: -10 },
  { title: "정수기 등 렌탈 제품 이전설치 신청", category: "공과금·인프라", notes: "해지 없이 이전 가능한 경우가 많음, 업체마다 확인", priority: "medium", anchor: "moveDate", offsetDays: -10 },
  { title: "전기 이사정산", category: "공과금·인프라", notes: "한전ON 앱/웹 또는 국번없이 123, 계량기 숫자 확인", priority: "medium", anchor: "moveDate", offsetDays: 0, url: "https://online.kepco.co.kr" },
  { title: "도시가스 정산", category: "공과금·인프라", notes: "예약해둔 기사 방문 시 최종 검침·정산", priority: "medium", anchor: "moveDate", offsetDays: 0, url: "http://www.citygas.or.kr" },
  { title: "수도요금·관리비 정산", category: "공과금·인프라", notes: "정산 방식이 단지마다 달라 관리사무소에 미리 확인 필요 (링크는 서울 기준 예시)", priority: "high", anchor: "moveDate", offsetDays: 0, url: "https://i121.seoul.go.kr" },

  // 행정·법률
  { title: "기존 계약 해지·갱신 의사 통보", category: "행정·법률", notes: "임대인 만기 6개월~2개월 전, 임차인 만기 2개월 전까지 통보 — 안 하면 자동으로 계약이 연장(묵시적 갱신)될 수 있음", priority: "high", anchor: "moveDate", offsetDays: -60 },
  { title: "(계약 전이면) 등기부등본·전입세대열람", category: "행정·법률", notes: "소유자·근저당 등 권리관계와 선순위 임차인 여부 확인", priority: "medium", anchor: "moveDate", offsetDays: -28, url: "https://www.iros.go.kr/" },
  { title: "전입신고", category: "행정·법률", notes: "대항력은 신고 다음 날 0시부터 발생 — 미루면 그 사이 권리를 잃을 위험이 있어 당일 처리 권장", priority: "high", anchor: "moveDate", offsetDays: 0, url: "https://www.gov.kr/" },
  { title: "확정일자 받기", category: "행정·법률", notes: "전입신고와 동시에, 우선변제권 확보를 위해 당일 처리 권장", priority: "high", anchor: "moveDate", offsetDays: 0, url: "https://www.iros.go.kr/" },
  { title: "전월세신고제 신고", category: "행정·법률", notes: "보증금 6천만원 또는 월세 30만원 초과 계약 시, 계약일로부터 30일 이내 — 날짜는 계약일 기준이라 직접 맞춰서 조정하세요", priority: "high", anchor: null, offsetDays: null, url: "https://rtms.molit.go.kr/" },
  { title: "전세보증금 반환보증(HUG 등) 가입 검토", category: "행정·법률", notes: "전세 계약이라면, 가입 기한이 있어 여유 있게 알아보는 게 안전", priority: "high", anchor: null, offsetDays: null, url: "https://khug.or.kr" },
  { title: "보증금 미반환 시 임차권등기명령부터", category: "행정·법률", notes: "완료 전에 먼저 이사하면 대항력을 잃을 위험 — 순서 주의 (해당 시에만)", priority: "high", anchor: null, offsetDays: null, url: "https://www.klac.or.kr/" },
  { title: "(매매) 취득세 신고·납부", category: "행정·법률", notes: "취득일(통상 잔금일)로부터 60일 이내", priority: "high", anchor: "settlementDate", offsetDays: 60, url: "https://www.wetax.go.kr/" },
  { title: "(매매) 소유권이전등기 신청", category: "행정·법률", notes: "잔금 완료일로부터 60일 이내", priority: "high", anchor: "settlementDate", offsetDays: 60, url: "https://www.iros.go.kr/" },

  // 주소이전
  { title: "우체국 우편물 주소이전 서비스 신청", category: "주소이전", notes: "동일 권역 이전은 3개월 무료", priority: "medium", anchor: "moveDate", offsetDays: 1, url: "https://service.epost.go.kr/front.RetrieveAddressMoveInfo.postal" },
  { title: "은행 '금융주소 한번에' 신청", category: "주소이전", notes: "계좌정보통합관리서비스(페이인포)나 각 은행 앱에서 신청 — 참여하지 않는 금융사는 개별 변경 필요", priority: "medium", anchor: "moveDate", offsetDays: 3, url: "https://payinfo.or.kr" },
  { title: "쇼핑몰·간편결제 배송지 변경", category: "주소이전", notes: "이미 결제된 미배송 주문은 자동으로 바뀌지 않음", priority: "low", anchor: "moveDate", offsetDays: 1 },
  { title: "자동차 주소 변경등록", category: "주소이전", notes: "차량 보유 시, 사유 발생일로부터 30일 이내", priority: "medium", anchor: "moveDate", offsetDays: 7, url: "https://car365.go.kr" },
  { title: "운전면허증 주소 변경", category: "주소이전", notes: "모바일 면허증은 전입신고 다음 날 자동 반영, 실물 카드는 별도 신청 필요", priority: "low", anchor: "moveDate", offsetDays: 3, url: "https://safedriving.or.kr" },

  // 입주체크
  { title: "(신축 입주라면) 사전점검 일정 확인", category: "입주체크", notes: "시공사가 공지하는 사전점검 기간에 맞춰 방문 준비", priority: "medium", anchor: "moveDate", offsetDays: -42 },
  { title: "입주청소 업체 예약", category: "입주체크", notes: "성수기(2~3월, 8~9월)엔 예약이 빨리 마감됨", priority: "medium", anchor: "moveDate", offsetDays: -21 },
  { title: "새 집 생활용품·인테리어 소품 준비", category: "입주체크", notes: "커튼, 조명, 주방·욕실 정리용품 등", priority: "low", anchor: "moveDate", offsetDays: -7 },
  { title: "관리사무소에 이사 일정 사전 신고", category: "입주체크", notes: "사다리차·엘리베이터 사용 신고, 단지마다 절차가 다름", priority: "high", anchor: "moveDate", offsetDays: -5 },
  { title: "기존 집·새 집 하자 사진 기록", category: "입주체크", notes: "원상복구 분쟁 예방용 증빙", priority: "medium", anchor: "moveDate", offsetDays: 0 },
];

function buildNotes(item: ChecklistItem): string {
  return item.url ? `${item.notes}\n\n참고: ${item.url}` : item.notes;
}

/**
 * 이미 추가된 항목(같은 카테고리+제목)은 건너뛰어, 버튼을 여러 번 눌러도 중복 생성되지 않게 한다.
 */
export function buildNewChecklistTasks(existingTasks: Task[]): Task[] {
  const existingKeys = new Set(existingTasks.map((t) => `${t.category}::${t.title}`));
  return MOVE_CHECKLIST_ITEMS.filter((item) => !existingKeys.has(`${item.category}::${item.title}`)).map((item) =>
    createTask({
      title: item.title,
      category: item.category,
      priority: item.priority,
      notes: buildNotes(item),
      dueDate:
        item.anchor && item.offsetDays != null
          ? { type: "relative", anchor: item.anchor, offsetDays: item.offsetDays }
          : { type: "unscheduled" },
    }),
  );
}
