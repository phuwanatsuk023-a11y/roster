import { Personnel, DutyPoint, Holiday, SavedRoster, RosterDayEntry, Gender } from './types';
import { INITIAL_PERSONNEL, INITIAL_DUTY_POINTS, INITIAL_HOLIDAYS } from './initialData';

const LS_KEY_PERSONNEL = 'duty_roster_personnel_v2';
const LS_KEY_DUTY_POINTS = 'duty_roster_duty_points_v2';
const LS_KEY_HOLIDAYS = 'duty_roster_holidays_v2';
const LS_KEY_ROSTERS = 'duty_roster_saved_rosters_v2';
const LS_KEY_APPS_SCRIPT_URL = 'duty_roster_apps_script_url_v2';

export class SheetService {
  private static appsScriptUrl: string = localStorage.getItem(LS_KEY_APPS_SCRIPT_URL) || '';

  public static getAppsScriptUrl(): string {
    return this.appsScriptUrl;
  }

  public static setAppsScriptUrl(url: string): void {
    this.appsScriptUrl = url.trim();
    localStorage.setItem(LS_KEY_APPS_SCRIPT_URL, this.appsScriptUrl);
  }

  public static isConnected(): boolean {
    return Boolean(this.appsScriptUrl && this.appsScriptUrl.startsWith('https://script.google.com/'));
  }

  // --- API Call Helper ---
  private static async callApi(action: string, data?: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isConnected()) {
      return { success: false, error: 'ยังไม่ได้ตั้งค่า Google Apps Script Web App URL' };
    }

    try {
      // Use text/plain to avoid CORS preflight options request on Apps Script
      const response = await fetch(this.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.message || 'เกิดข้อผิดพลาดจาก Google Apps Script' };
      }
    } catch (err: any) {
      console.warn('Google Sheet Sync Error, fallback to Local Cache:', err);
      return { success: false, error: err.message || 'ไม่สามารถเชื่อมต่อ Google Sheet ได้' };
    }
  }

  // --- Personnel Methods ---
  public static async getPersonnel(): Promise<Personnel[]> {
    const cached = localStorage.getItem(LS_KEY_PERSONNEL);
    let list: Personnel[] = cached ? JSON.parse(cached) : INITIAL_PERSONNEL;

    if (this.isConnected()) {
      try {
        const queryUrl = `${this.appsScriptUrl}?action=get_guards`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
            list = json.data.map((item: any) => ({
              id: item.id || `EMP_${item.employee_id}`,
              db_id: item.id,
              employee_id: String(item.employee_id || ''),
              fname: item.fname || '',
              lname: item.lname || '',
              gender: (item.gender === 'F' || item.gender === 'หญิง') ? 'F' : 'M',
              position: item.position || '',
              dept: item.department || item.dept || '',
              status: (item.status === 'active' || item.status === 'ปฏิบัติงาน' || item.status === 1) ? 'active' : 'inactive',
              canDuty: Boolean(item.can_duty == 1 || item.canDuty),
              isInspector: Boolean(item.is_inspector == 1 || item.isInspector),
              dutyPoint: item.duty_point || item.dutyPoint || '',
              pairNo: item.pair_no ? String(item.pair_no) : (item.pairNo ? String(item.pairNo) : ''),
              orderIndex: Number(item.order_index || item.orderIndex || 0)
            }));
            localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(list));
          }
        }
      } catch (e) {
        console.warn('Fetch guards error:', e);
      }
    } else if (!cached) {
      localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(INITIAL_PERSONNEL));
    }

    return list;
  }

  public static async addPersonnel(person: Omit<Personnel, 'id'>): Promise<{ success: boolean; data: Personnel; error?: string }> {
    const list = await this.getPersonnel();
    const newId = 'EMP' + String(Date.now()).slice(-6);
    const newGuard: Personnel = {
      ...person,
      id: newId,
      db_id: newId,
      orderIndex: person.orderIndex || Date.now()
    };

    list.push(newGuard);
    localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(list));

    if (this.isConnected()) {
      const apiRes = await this.callApi('add_guard', {
        employee_id: newGuard.employee_id,
        fname: newGuard.fname,
        lname: newGuard.lname,
        gender: newGuard.gender,
        position: newGuard.position,
        department: newGuard.dept,
        status: newGuard.status,
        can_duty: newGuard.canDuty ? 1 : 0,
        is_inspector: newGuard.isInspector ? 1 : 0,
        duty_point: newGuard.dutyPoint || '',
        pair_no: newGuard.pairNo || '',
        order_index: newGuard.orderIndex
      });
      return { success: true, data: newGuard, error: apiRes.error };
    }

    return { success: true, data: newGuard };
  }

  public static async updatePersonnel(person: Personnel): Promise<{ success: boolean; error?: string }> {
    const list = await this.getPersonnel();
    const index = list.findIndex(p => p.id === person.id || p.db_id === person.db_id);
    if (index !== -1) {
      list[index] = { ...person };
      localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(list));

      if (this.isConnected()) {
        const apiRes = await this.callApi('edit_guard', {
          id: person.id,
          employee_id: person.employee_id,
          fname: person.fname,
          lname: person.lname,
          gender: person.gender,
          position: person.position,
          department: person.dept,
          status: person.status,
          can_duty: person.canDuty ? 1 : 0,
          is_inspector: person.isInspector ? 1 : 0,
          duty_point: person.dutyPoint || '',
          pair_no: person.pairNo || '',
          order_index: person.orderIndex
        });
        return { success: true, error: apiRes.error };
      }
      return { success: true };
    }
    return { success: false, error: 'ไม่พบบุคลากร' };
  }

  public static async deletePersonnel(id: string): Promise<{ success: boolean; error?: string }> {
    let list = await this.getPersonnel();
    list = list.filter(p => p.id !== id && p.db_id !== id);
    localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(list));

    if (this.isConnected()) {
      const apiRes = await this.callApi('delete_guard', { id });
      return { success: true, error: apiRes.error };
    }
    return { success: true };
  }

  public static async batchUpdateGuards(updatedGuards: Personnel[]): Promise<{ success: boolean }> {
    localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(updatedGuards));
    if (this.isConnected()) {
      await this.callApi('batch_update_guards', {
        guards: updatedGuards.map(g => ({
          id: g.id,
          pair_no: g.pairNo,
          duty_point: g.dutyPoint,
          order_index: g.orderIndex,
          is_inspector: g.isInspector,
          can_duty: g.canDuty
        }))
      });
    }
    return { success: true };
  }

  // --- Duty Points Methods ---
  public static async getDutyPoints(): Promise<DutyPoint[]> {
    const cached = localStorage.getItem(LS_KEY_DUTY_POINTS);
    let list: DutyPoint[] = cached ? JSON.parse(cached) : INITIAL_DUTY_POINTS;

    if (this.isConnected()) {
      try {
        const queryUrl = `${this.appsScriptUrl}?action=get_duty_points`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
            list = json.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              gender: item.gender === 'F' ? 'F' : 'M',
              order_index: Number(item.order_index || 0)
            }));
            localStorage.setItem(LS_KEY_DUTY_POINTS, JSON.stringify(list));
          }
        }
      } catch (e) {
        console.warn('Fetch duty points error:', e);
      }
    } else if (!cached) {
      localStorage.setItem(LS_KEY_DUTY_POINTS, JSON.stringify(INITIAL_DUTY_POINTS));
    }

    return list;
  }

  public static async addDutyPoint(name: string, gender: Gender): Promise<{ success: boolean; data: DutyPoint }> {
    const list = await this.getDutyPoints();
    const newPoint: DutyPoint = {
      id: Date.now(),
      name: name.trim(),
      gender,
      order_index: list.filter(p => p.gender === gender).length + 1
    };
    list.push(newPoint);
    localStorage.setItem(LS_KEY_DUTY_POINTS, JSON.stringify(list));

    if (this.isConnected()) {
      await this.callApi('add_duty_point', {
        name: newPoint.name,
        gender: newPoint.gender,
        order_index: newPoint.order_index
      });
    }
    return { success: true, data: newPoint };
  }

  public static async deleteDutyPoint(id: string | number): Promise<{ success: boolean }> {
    let list = await this.getDutyPoints();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(LS_KEY_DUTY_POINTS, JSON.stringify(list));

    if (this.isConnected()) {
      await this.callApi('delete_duty_point', { id });
    }
    return { success: true };
  }

  // --- Holidays Methods ---
  public static async getHolidays(): Promise<Holiday[]> {
    const cached = localStorage.getItem(LS_KEY_HOLIDAYS);
    let list: Holiday[] = cached ? JSON.parse(cached) : INITIAL_HOLIDAYS;

    if (this.isConnected()) {
      try {
        const queryUrl = `${this.appsScriptUrl}?action=get_holidays`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
            list = json.data.map((item: any) => ({
              id: item.id,
              holiday_date: String(item.holiday_date || item.date || '').split('T')[0],
              name: item.name || '',
              type: item.type || 'official'
            }));
            localStorage.setItem(LS_KEY_HOLIDAYS, JSON.stringify(list));
          }
        }
      } catch (e) {
        console.warn('Fetch holidays error:', e);
      }
    } else if (!cached) {
      localStorage.setItem(LS_KEY_HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
    }

    return list;
  }

  public static async addHoliday(date: string, name: string, type: 'official' | 'special'): Promise<{ success: boolean; data: Holiday }> {
    const list = await this.getHolidays();
    const newHol: Holiday = {
      id: Date.now(),
      holiday_date: date,
      name: name.trim(),
      type
    };
    list.push(newHol);
    localStorage.setItem(LS_KEY_HOLIDAYS, JSON.stringify(list));

    if (this.isConnected()) {
      await this.callApi('add_holiday', {
        holiday_date: newHol.holiday_date,
        name: newHol.name,
        type: newHol.type
      });
    }
    return { success: true, data: newHol };
  }

  public static async deleteHoliday(id: string | number): Promise<{ success: boolean }> {
    let list = await this.getHolidays();
    list = list.filter(h => h.id !== id);
    localStorage.setItem(LS_KEY_HOLIDAYS, JSON.stringify(list));

    if (this.isConnected()) {
      await this.callApi('delete_holiday', { id });
    }
    return { success: true };
  }

  // --- Saved Rosters Methods ---
  public static async getSavedRosters(): Promise<SavedRoster[]> {
    const cached = localStorage.getItem(LS_KEY_ROSTERS);
    return cached ? JSON.parse(cached) : [];
  }

  public static async saveRoster(month: number, year: number, gender: Gender, schedule: RosterDayEntry[]): Promise<{ success: boolean; error?: string }> {
    const list = await this.getSavedRosters();
    const rosterId = `R_${year}_${month}_${gender}`;
    const newRoster: SavedRoster = {
      id: rosterId,
      month,
      year,
      gender,
      schedule,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = list.findIndex(r => r.id === rosterId);
    if (existingIndex !== -1) {
      list[existingIndex] = newRoster;
    } else {
      list.push(newRoster);
    }

    localStorage.setItem(LS_KEY_ROSTERS, JSON.stringify(list));

    if (this.isConnected()) {
      const apiRes = await this.callApi('save_roster', {
        month,
        year,
        gender,
        schedule: JSON.stringify(schedule)
      });
      return { success: true, error: apiRes.error };
    }

    return { success: true };
  }

  public static async getRosterForMonth(month: number, year: number, gender: Gender): Promise<SavedRoster | null> {
    const list = await this.getSavedRosters();
    const rosterId = `R_${year}_${month}_${gender}`;
    return list.find(r => r.id === rosterId) || null;
  }

  // --- Reset & Connection Test ---
  public static async testConnection(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${url}?action=get_all_data`);
      if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
      const json = await res.json();
      if (json.status === 'success') {
        return { success: true, message: 'เชื่อมต่อ Google Apps Script สำเร็จพร้อมใช้งาน!' };
      }
      return { success: false, message: json.message || 'Google Apps Script ตอบกลับ แต่สถานะไม่สมบูรณ์' };
    } catch (e: any) {
      return { success: false, message: e.message || 'ไม่สามารถเชื่อมต่อไปยัง URL ที่ระบุได้' };
    }
  }

  public static resetToDemoData(): void {
    localStorage.setItem(LS_KEY_PERSONNEL, JSON.stringify(INITIAL_PERSONNEL));
    localStorage.setItem(LS_KEY_DUTY_POINTS, JSON.stringify(INITIAL_DUTY_POINTS));
    localStorage.setItem(LS_KEY_HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
  }
}
