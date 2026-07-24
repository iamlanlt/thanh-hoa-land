export const THANH_HOA_AREAS = [
  "TP. Thanh Hóa",
  "Sầm Sơn",
  "Bỉm Sơn",
  "Nghi Sơn",
  "Quảng Xương",
  "Hoằng Hóa",
  "Đông Sơn",
  "Hà Trung",
  "Hậu Lộc",
  "Nga Sơn",
  "Triệu Sơn",
  "Thiệu Hóa",
  "Yên Định",
  "Thọ Xuân",
  "Vĩnh Lộc",
  "Cẩm Thủy",
  "Ngọc Lặc",
  "Lang Chánh",
  "Như Xuân",
  "Như Thanh",
  "Thường Xuân",
  "Bá Thước",
  "Quan Hóa",
  "Quan Sơn",
  "Mường Lát",
] as const;

export const PROPERTY_TYPES = [
  "Đất nền",
  "Đất thổ cư",
  "Đất đầu tư",
  "Đất mặt đường",
  "Nhà phố",
  "Nhà ở",
  "Nhà vườn",
  "Biệt thự",
  "Liền kề",
  "Shophouse",
  "Chung cư",
  "Mặt bằng kinh doanh",
] as const;

export const PRICE_UNITS = [
  "Tỷ",
  "Triệu",
  "Triệu/m²",
  "Thỏa thuận",
] as const;

export const DIRECTIONS = [
  "Bắc",
  "Đông Bắc",
  "Đông",
  "Đông Nam",
  "Nam",
  "Tây Nam",
  "Tây",
  "Tây Bắc",
] as const;

export const FURNITURE_STATUSES = [
  "Nội thất đầy đủ",
  "Nội thất cơ bản",
  "Bàn giao thô",
  "Không nội thất",
] as const;

export const LEGAL_STATUSES = [
  "Sổ đỏ/Sổ hồng",
  "Đang chờ sổ",
  "Hợp đồng mua bán",
  "Đất quy hoạch",
  "Khác",
] as const;

const PROPERTY_STATUS_LABELS = {
  AVAILABLE: "Đang bán",
  SOLD: "Đã bán",
} as const;

type PropertyStatus = keyof typeof PROPERTY_STATUS_LABELS;

export const PROPERTY_STATUS_VALUES = Object.keys(
  PROPERTY_STATUS_LABELS,
) as [PropertyStatus, ...PropertyStatus[]];

export const PROPERTY_STATUS_OPTIONS = Object.entries(
  PROPERTY_STATUS_LABELS,
).map(([value, label]) => ({ value: value as PropertyStatus, label }));

export function getPropertyStatusLabel(status: string) {
  return PROPERTY_STATUS_LABELS[status as PropertyStatus] || status;
}
