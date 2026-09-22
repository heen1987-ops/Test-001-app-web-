export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/schedule", label: "일정·할일", icon: "📅" },
  { href: "/costs", label: "비용·자금", icon: "💰" },
  { href: "/vendors", label: "업체·자료", icon: "🏷️" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];
