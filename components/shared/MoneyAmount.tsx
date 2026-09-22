// 금액(number | null)을 화면에 표시하는 유일한 컴포넌트. null을 "0원"으로 둔갑시키지 않는다 —
// 다른 곳에서 직접 amount를 문자열로 포맷하지 말고 항상 이 컴포넌트를 통해 표시할 것.
export function MoneyAmount({
  amount,
  unknownLabel = "미입력",
  className,
}: {
  amount: number | null;
  unknownLabel?: string;
  className?: string;
}) {
  if (amount == null) {
    return <span className={`text-zinc-400 dark:text-zinc-500 ${className ?? ""}`}>{unknownLabel}</span>;
  }
  const sign = amount < 0 ? "-" : "";
  const formatted = Math.abs(amount).toLocaleString("ko-KR");
  return (
    <span className={className}>
      {sign}
      {formatted}원
    </span>
  );
}
