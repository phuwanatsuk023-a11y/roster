import React from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  CalendarOff, 
  MapPin, 
  Sparkles, 
  FileSpreadsheet, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { Personnel, DutyPoint, Holiday, SyncStatus } from './types';

interface AdminDashboardProps {
  personnel: Personnel[];
  dutyPoints: DutyPoint[];
  holidays: Holiday[];
  syncStatus: SyncStatus;
  onNavigate: (tab: string) => void;
  onOpenSheetConfig: () => void;
  onOpenAddPersonnel: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  personnel,
  dutyPoints,
  holidays,
  syncStatus,
  onNavigate,
  onOpenSheetConfig,
  onOpenAddPersonnel
}) => {
  const activePersonnel = personnel.filter(p => p.status === 'active');
  const males = activePersonnel.filter(p => p.gender === 'M');
  const females = activePersonnel.filter(p => p.gender === 'F');

  const dutyPeople = activePersonnel.filter(p => p.canDuty && !p.isInspector);
  const dutyMales = dutyPeople.filter(p => p.gender === 'M');
  const dutyFemales = dutyPeople.filter(p => p.gender === 'F');

  const inspectors = activePersonnel.filter(p => p.isInspector);
  const inspectorMales = inspectors.filter(p => p.gender === 'M');
  const inspectorFemales = inspectors.filter(p => p.gender === 'F');

  const now = new Date();
  const currentMonthHolidays = holidays.filter(h => {
    const d = new Date(h.holiday_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6">
      
      {/* Header greeting */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              แดชบอร์ดภาพรวมการจัดเวรยาม
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Admin Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ศูนย์จัดการข้อมูลบุคลากร ตารางเวร และการเชื่อมโยงฐานข้อมูล Google Sheets แบบ Real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddPersonnel}
            className="flex-1 sm:flex-initial bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <UserPlus className="w-4 h-4 text-blue-300" />
            <span>เพิ่มบุคลากรใหม่</span>
          </button>
          <button
            onClick={() => onNavigate('roster-gen')}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>สร้างตารางเวร</span>
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Male Guards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">บุคลากรชายทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-900">{males.length}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            เข้าเวร {dutyMales.length} คน &bull; ตรวจเวร {inspectorMales.length} คน
          </p>
        </div>

        {/* Card 2: Female Guards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">บุคลากรหญิงทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-pink-700">{females.length}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            เข้าเวร {dutyFemales.length} คน &bull; ตรวจเวร {inspectorFemales.length} คน
          </p>
        </div>

        {/* Card 3: Duty Personnel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ผู้เข้าเวร (ปฏิบัติงาน)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{dutyPeople.length}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              ชาย {dutyMales.length}
            </span>
            <span className="bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded-full">
              หญิง {dutyFemales.length}
            </span>
          </div>
        </div>

        {/* Card 4: Duty Inspectors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ผู้ตรวจเวรประจำวัน</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700">{inspectors.length}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              ชาย {inspectorMales.length}
            </span>
            <span className="bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded-full">
              หญิง {inspectorFemales.length}
            </span>
          </div>
        </div>

      </div>

      {/* Sync Status Banner & Secondary Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Google Sheet Sync Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    สถานะการเชื่อมต่อฐานข้อมูล Google Sheets
                  </h3>
                  <p className="text-xs text-slate-500">Google Apps Script Web App API</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                syncStatus.isConnectedToSheet
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {syncStatus.isConnectedToSheet ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    เชื่อมต่อ API เรียบร้อย
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    โหมดทดสอบในเครื่อง (Local Mode)
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {syncStatus.isConnectedToSheet
                ? `ระบบกำลังเชื่อมต่อกับ Google Sheet แบบสองทาง (Real-time Sync) เมื่อมีการเพิ่ม แก้ไข ลบ หรือจัดตารางเวร ข้อมูลจะถูกบันทึกผ่าน Apps Script อัตโนมัติ`
                : `ระบบกำลังทำงานผ่าน Local Database พร้อมใช้งานทุกฟังก์ชัน หากต้องการเชื่อมต่อกับ Google Sheet จริง ให้คลิกปุ่มตั้งค่าด้านล่างเพื่อใส่ Web App URL`}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              อัปเดตล่าสุด: {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString('th-TH') : 'ทำงานอยู่ตลอดเวลา'}
            </div>
            <button
              onClick={onOpenSheetConfig}
              className="text-xs font-bold text-blue-900 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              ตั้งค่า / ดูโค้ด Google Apps Script
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Duty Points & Quick Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              จุดปฏิบัติหน้าที่เวร ({dutyPoints.length} จุด)
            </h3>
            
            <div className="space-y-2 text-xs">
              {dutyPoints.map((pt) => {
                const count = personnel.filter(p => p.status === 'active' && !p.isInspector && p.dutyPoint === pt.name).length;
                return (
                  <div key={pt.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${pt.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600'}`} />
                      {pt.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {pt.gender === 'M' ? 'ชาย' : 'หญิง'} &bull; {count} คน
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('duty-points')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            จัดการจุดประจำเวร
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
