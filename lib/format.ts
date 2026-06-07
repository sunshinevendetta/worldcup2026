export function formatEth(value: string | number) {
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numberValue)) return "0";
  return numberValue.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: numberValue > 0 && numberValue < 0.001 ? 6 : 0,
  });
}

export function formatDate(value: number) {
  if (!value) return "Not updated yet";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
