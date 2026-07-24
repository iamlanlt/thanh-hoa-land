export const LEAD_STATUS_LABELS = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUALIFIED: "Đủ điều kiện",
  CLOSED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
} as const;

type LeadStatus = keyof typeof LEAD_STATUS_LABELS;

export const LEAD_STATUS_VALUES = Object.keys(LEAD_STATUS_LABELS) as [
  LeadStatus,
  ...LeadStatus[],
];

export const LEAD_STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function getLeadStatusLabel(status: string) {
  return LEAD_STATUS_LABELS[status as LeadStatus] || status;
}

const leadDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const leadTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatLeadDate(value: string | Date) {
  const date = new Date(value);
  return `${leadDateFormatter.format(date)} · ${leadTimeFormatter.format(date)}`;
}
