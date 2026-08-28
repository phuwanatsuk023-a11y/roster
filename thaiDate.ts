export const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const TH_SHORT_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const TH_DAY_NAMES = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

export function toThaiNumeral(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return str.toString().replace(/[0-9]/g, m => ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'][parseInt(m, 10)]);
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '-';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr).trim());
  if (!match) return dateStr;
  const year = parseInt(match[1], 10) + 543;
  const month = TH_MONTHS[parseInt(match[2], 10) - 1];
  const day = parseInt(match[3], 10);
  if (!month || isNaN(day)) return dateStr;
  return `${day} ${month} ${year}`;
}

export function formatThaiDateShort(dateStr: string): string {
  if (!dateStr) return '-';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr).trim());
  if (!match) return dateStr;
  const year = parseInt(match[1], 10) + 543;
  const month = TH_SHORT_MONTHS[parseInt(match[2], 10) - 1];
  const day = parseInt(match[3], 10);
  if (!month || isNaN(day)) return dateStr;
  return `${day} ${month} ${year}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
