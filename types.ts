export type Gender = 'M' | 'F';

export interface Personnel {
  id: string; // e.g. EMP001
  db_id?: number | string;
  employee_id: string;
  fname: string;
  lname: string;
  gender: Gender;
  position: string;
  dept: string;
  status: 'active' | 'inactive';
  canDuty: boolean;
  isInspector: boolean;
  dutyPoint?: string;
  pairNo?: string;
  orderIndex: number;
}

export interface DutyPoint {
  id: number | string;
  name: string;
  gender: Gender;
  order_index: number;
}

export interface Holiday {
  id: number | string;
  holiday_date: string; // YYYY-MM-DD
  name: string;
  type: 'official' | 'special';
}

export interface DutyUnit {
  head: string | null; // personnel id
  sub: string | null;  // personnel id
  sub2?: string | null; // personnel id (optional 3rd person)
}

export interface RosterDayEntry {
  day: number;
  dateStr: string; // YYYY-MM-DD
  dow: number; // 0=Sun, 6=Sat
  isOff: boolean;
  unitsByPoint: Record<string, DutyUnit[]>;
  inspector: string | null;
}

export interface SavedRoster {
  id: string; // e.g. R_2026_7_M
  month: number; // 0-11
  year: number;  // Gregorian year
  gender: Gender;
  schedule: RosterDayEntry[];
  updatedAt: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  username: string;
  name: string;
  role: 'admin' | 'guest';
}

export interface SyncStatus {
  isConnectedToSheet: boolean;
  sheetUrl: string;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  error?: string;
}
