import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Search, 
  Calendar, 
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Clock,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { Personnel, DutyPoint, Holiday, SavedRoster } from './types';
import { TH_MONTHS, TH_SHORT_MONTHS, TH_DAY_NAMES, toThaiNumeral } from './thaiDate';

interface PublicRosterViewProps {
  personnel: Personnel[];
  dutyPoints: DutyPoint[];
  holidays: Holiday[];
  savedRosters: SavedRoster[];
  initialMonth?: number;
  initialYear?: number;
  initialGender?: 'M' | 'F';
}

export const PublicRosterView: React.FC<PublicRosterViewProps> = ({
  personnel,
  dutyPoints,
  holidays,
  savedRosters,
  initialMonth = new Date().getMonth(),
  initialYear = new Date().getFullYear(),
  initialGender = 'M'
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>(initialGender);
  const [tableSearch, setTableSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [copiedDate, setCopiedDate] = useState<number | null>(null);

  // Find saved roster
  const currentRoster = useMemo(() => {
    return savedRosters.find(r => 
      r.month === selectedMonth && 
      r.year === selectedYear && 
      r.gender === selectedGender
    );
  }, [savedRosters, selectedMonth, selectedYear, selectedGender]);

  const pointsForGender = useMemo(() => {
    const list = dutyPoints.filter(p => p.gender === selectedGender);
    return list.sort((a, b) => a.order_index - b.order_index).map(p => p.name);
  }, [dutyPoints, selectedGender]);

  // Personnel lookup map
  const personnelMap = useMemo(() => {
    const map = new Map<string, Personnel>();
    personnel.forEach(p => map.set(p.id, p));
    return map;
  }, [personnel]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Filter schedule entries by search query and gender constraint
  const filteredSchedule = useMemo(() => {
    if (!currentRoster || !currentRoster.schedule) return [];

    let entries = currentRoster.schedule;
    if (selectedGender === 'F') {
      entries = entries.filter(e => e.isOff);
    }

    if (!tableSearch.trim()) return entries;

    const query = tableSearch.trim().toLowerCase();
    return entries.filter(entry => {
      // Check inspector
      if (entry.inspector) {
        const insp = personnelMap.get(entry.inspector);
        if (insp && (`${insp.fname} ${insp.lname}`.toLowerCase().includes(query) || insp.position.toLowerCase().includes(query))) {
          return true;
        }
      }
      // Check duty units
      if (entry.unitsByPoint) {
        for (const pt of Object.keys(entry.unitsByPoint)) {
          const units = entry.unitsByPoint[pt] || [];
          for (const u of units) {
            const h = u.head ? personnelMap.get(u.head) : null;
            const s = u.sub ? personnelMap.get(u.sub) : null;
            const s2 = u.sub2 ? personnelMap.get(u.sub2) : null;
            if (h && `${h.fname} ${h.lname}`.toLowerCase().includes(query)) return true;
            if (s && `${s.fname} ${s.lname}`.toLowerCase().includes(query)) return true;
            if (s2 && `${s2.fname} ${s2.lname}`.toLowerCase().includes(query)) return true;
          }
        }
      }
      return false;
    });
  }, [currentRoster, selectedGender, tableSearch, personnelMap]);

  // Format cell value for Table View
  const renderUnitLines = (units: Array<{ head: string | null; sub: string | null; sub2?: string | null }>) => {
    if (!units || units.length === 0) return <span className="text-slate-300">-</span>;

    return units.map((u, uIdx) => {
      const headPerson = u.head ? personnelMap.get(u.head) : null;
      const subPerson = u.sub ? personnelMap.get(u.sub) : null;
      const sub2Person = u.sub2 ? personnelMap.get(u.sub2) : null;

      const headName = headPerson ? `${headPerson.fname} ${headPerson.lname}` : (u.head || '-');
      const subName = subPerson ? `${subPerson.fname} ${subPerson.lname}` : (u.sub || '-');
      const sub2Name = sub2Person ? `${sub2Person.fname} ${sub2Person.lname}` : (u.sub2 || '-');

      const pairNoText = headPerson && headPerson.pairNo ? `(คู่ ${headPerson.pairNo})` : '';

      return (
        <div key={uIdx} className="duty-unit-box text-xs space-y-0.5 leading-tight py-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-semibold text-slate-900">
              1. {headName} <span className="text-[10px] text-blue-700 font-bold print:hidden">{pairNoText}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex-shrink-0">หน.เวร</span>
          </div>

          {u.sub && (
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-700">2. {subName}</span>
              <span className="text-[10px] text-slate-400 flex-shrink-0">ผช.เวร</span>
            </div>
          )}

          {u.sub2 && (
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-700">3. {sub2Name}</span>
              <span className="text-[10px] text-slate-400 flex-shrink-0">ผช.เวร</span>
            </div>
          )}
        </div>
      );
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const currentThaiYear = selectedYear + 543;

  return (
    <div className="space-y-6">
      
      {/* Control Bar (Hidden on print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex flex-col gap-4">
          
          {/* Top Row: Gender switch & Month stepper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Gender Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setSelectedGender('M')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[40px] ${
                  selectedGender === 'M'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เวรชาย (กลางคืน ทุกวัน)
              </button>
              <button
                onClick={() => setSelectedGender('F')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[40px] ${
                  selectedGender === 'F'
                    ? 'bg-pink-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เวรหญิง (กลางวัน วันหยุด)
              </button>
            </div>

            {/* Month & Year Navigator */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-600 min-h-[40px]"
                >
                  {TH_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-600 min-h-[40px]"
                >
                  {[2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y + 543}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Search & View Mode & Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search within Roster */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="ค้นหาชื่อเจ้าหน้าที่ / ผู้ตรวจเวรในตารางนี้..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 min-h-[40px]"
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ล้าง
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                    viewMode === 'cards'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="ดูแบบการ์ดรายวัน เหมาะสำหรับจอมือถือ"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>การ์ดรายวัน</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="ดูแบบตารางทางการ"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>ตารางทางการ</span>
                </button>
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-1.5 transition-all min-h-[40px]"
              >
                <Printer className="w-4 h-4 text-blue-300" />
                <span className="hidden sm:inline">พิมพ์ตารางเวร</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* VIEW MODE 1: Mobile Day Cards View */}
      {viewMode === 'cards' && (
        <div className="space-y-4 print:hidden">
          {filteredSchedule.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedule.map((entry, rowIdx) => {
                const entryDate = new Date(selectedYear, selectedMonth, entry.day);
                const dow = entryDate.getDay();
                const dowName = TH_DAY_NAMES[dow];
                const inspectorPerson = entry.inspector ? personnelMap.get(entry.inspector) : null;
                const isHoliday = entry.isOff;

                return (
                  <div 
                    key={rowIdx}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                      isHoliday 
                        ? 'border-amber-300 shadow-sm bg-gradient-to-b from-amber-50/30 to-white' 
                        : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                          isHoliday ? 'bg-amber-600 text-white' : 'bg-blue-900 text-white'
                        }`}>
                          {entry.day}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{dowName}</p>
                          <p className="text-xs text-slate-500">
                            {entry.day} {TH_MONTHS[selectedMonth]} {currentThaiYear}
                          </p>
                        </div>
                      </div>

                      {isHoliday && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                          วันหยุด
                        </span>
                      )}
                    </div>

                    {/* Duty Points for the day */}
                    <div className="space-y-3">
                      {pointsForGender.map(pt => {
                        const units = entry.unitsByPoint ? entry.unitsByPoint[pt] : [];
                        if (!units || units.length === 0) return null;

                        return (
                          <div key={pt} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 text-blue-900">
                              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              {pt}
                            </p>
                            <div className="space-y-1 pl-5 text-xs">
                              {units.map((u, uIdx) => {
                                const headPerson = u.head ? personnelMap.get(u.head) : null;
                                const subPerson = u.sub ? personnelMap.get(u.sub) : null;
                                const sub2Person = u.sub2 ? personnelMap.get(u.sub2) : null;
                                return (
                                  <div key={uIdx} className="space-y-0.5">
                                    <p className="font-semibold text-slate-800">
                                      1. {headPerson ? `${headPerson.fname} ${headPerson.lname}` : (u.head || '-')}
                                      <span className="text-[10px] text-blue-700 ml-1">
                                        {headPerson?.pairNo ? `(คู่ ${headPerson.pairNo})` : ''}
                                      </span>
                                    </p>
                                    {u.sub && (
                                      <p className="text-slate-600 pl-2">
                                        2. {subPerson ? `${subPerson.fname} ${subPerson.lname}` : u.sub}
                                      </p>
                                    )}
                                    {u.sub2 && (
                                      <p className="text-slate-600 pl-2">
                                        3. {sub2Person ? `${sub2Person.fname} ${sub2Person.lname}` : u.sub2}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Inspector for this day */}
                      {inspectorPerson ? (
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-xs">
                          <span className="text-[10px] text-purple-700 font-bold block">ผู้ตรวจเวร:</span>
                          <p className="font-bold text-purple-950">
                            {inspectorPerson.fname} {inspectorPerson.lname}
                          </p>
                          <p className="text-[10px] text-slate-500">{inspectorPerson.position}</p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">ไม่มีผู้ตรวจเวร</div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700">ไม่พบข้อมูลตารางเวรตามเงื่อนไขที่ค้นหา</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                กรุณาตรวจสอบคำค้นหา หรือเลือกเดือน/ประเภทเวรอื่น
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Official Document Table (Printable) */}
      <div 
        id="official-print-roster"
        className={`bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 ${
          viewMode === 'cards' ? 'hidden print:block' : 'block'
        }`}
      >
        
        {/* Official Header Formats for Warinchamrab Municipality */}
        <div className="text-center mb-6 official-header">
          {selectedGender === 'F' ? (
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sarabun">
                เวรประจำสำนักงานเทศบาลเมืองวารินชำราบ สำนักงานโครงการปรับปรุงคุณภาพน้ำ ศูนย์บริการสาธารณสุขฯ แห่งที่ ๒ และแห่งที่ ๓
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-sarabun">
                แนบท้ายคำสั่งเทศบาลเมืองวารินชำราบ ที่ ............... /................. ลงวันที่..........................................
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-900 font-sarabun">
                ประจำเดือน {TH_MONTHS[selectedMonth]} พ.ศ. {currentThaiYear} (เวรหญิง)
              </p>
              <p className="text-xs sm:text-sm text-slate-600 text-left pt-2 font-sarabun leading-relaxed">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>ข้อ ๑</strong> เจ้าหน้าที่อยู่เวรและตรวจเวร ประจำสำนักงานเทศบาลเมืองวารินชำราบ ศูนย์บริการสาธารณสุขฯ แห่งที่ ๒ และ แห่งที่ ๓ (กลางวัน) ในวันเสาร์ - อาทิตย์ และวันหยุดนักขัตฤกษ์ ซึ่งเริ่มปฏิบัติหน้าที่ตั้งแต่เวลา ๐๘.๓๐ - ๑๖.๓๐ น. ประกอบด้วยบุคคลดังต่อไปนี้
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sarabun">
                ตารางเวรยามและผู้ตรวจเวร ประจำเดือน {TH_MONTHS[selectedMonth]} พ.ศ. {currentThaiYear} (เวรชาย)
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-sarabun">
                แนบท้ายคำสั่งเทศบาลเมืองวารินชำราบ ที่ ............... /................. ลงวันที่..........................................
              </p>
              <p className="text-xs sm:text-sm text-slate-600 text-left pt-2 font-sarabun leading-relaxed">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>ข้อ ๒</strong> เจ้าหน้าที่อยู่เวร-ยามและผู้ตรวจเวร ประจำสำนักงานเทศบาลเมืองวารินชำราบ สำนักงานโครงการปรับปรุงคุณภาพน้ำ ศูนย์บริการสาธารณสุข แห่งที่ ๒ และแห่งที่ ๓ (กลางคืน) ซึ่งเริ่มปฏิบัติหน้าที่ ตั้งแต่เวลา ๑๘.๐๐ - ๐๖.๐๐ น. ของวันรุ่งขึ้น ไม่เว้นวันหยุดราชการ ประกอบด้วยบุคคลดังต่อไปนี้
              </p>
            </div>
          )}
        </div>

        {/* Roster Table with Smooth Horizontal Scroll & Sticky Header */}
        {filteredSchedule.length > 0 ? (
          <div className="overflow-x-auto border border-slate-900 rounded-lg">
            <table className="w-full text-xs border-collapse official-table min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                  <th className="border border-slate-900 p-2.5 text-center w-28 font-sarabun sticky left-0 bg-slate-100 z-10">
                    วัน/เดือน/ปี
                  </th>
                  {pointsForGender.map(pt => (
                    <th key={pt} className="border border-slate-900 p-2.5 text-center font-sarabun">
                      {pt}
                    </th>
                  ))}
                  <th className="border border-slate-900 p-2.5 text-center w-40 font-sarabun">
                    ผู้ตรวจเวร
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-sarabun">
                {filteredSchedule.map((entry, rowIdx) => {
                  const entryDate = new Date(selectedYear, selectedMonth, entry.day);
                  const dow = entryDate.getDay();
                  
                  const inspectorPerson = entry.inspector ? personnelMap.get(entry.inspector) : null;
                  const inspectorDisplay = inspectorPerson ? `${inspectorPerson.fname} ${inspectorPerson.lname}` : (entry.inspector || '-');

                  const dateDisplay = `${entry.day} ${TH_SHORT_MONTHS[selectedMonth]} ${currentThaiYear}`;

                  return (
                    <tr 
                      key={rowIdx}
                      className={`${
                        entry.isOff ? 'bg-amber-50/40' : 'bg-white'
                      } hover:bg-blue-50/50 transition-colors`}
                    >
                      {/* Date Col (Sticky Left for Mobile Scrolling) */}
                      <td className={`border border-slate-900 p-2 text-center align-top font-bold text-slate-900 whitespace-nowrap sticky left-0 z-10 ${
                        entry.isOff ? 'bg-amber-50' : 'bg-white'
                      }`}>
                        <div>{dateDisplay}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          ({TH_DAY_NAMES[dow]})
                        </div>
                      </td>

                      {/* Duty Points Columns */}
                      {pointsForGender.map(pt => {
                        const units = entry.unitsByPoint ? entry.unitsByPoint[pt] : [];
                        return (
                          <td key={pt} className="border border-slate-900 p-2 align-top">
                            {renderUnitLines(units)}
                          </td>
                        );
                      })}

                      {/* Inspector Column */}
                      <td className="border border-slate-900 p-2 text-center align-top font-semibold text-slate-900">
                        {inspectorDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 print:hidden">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700">ยังไม่มีข้อมูลตารางเวรสำหรับเดือนนี้</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              กรุณาเข้าสู่ระบบในฐานะผู้ดูแล (Admin) เพื่อทำการสร้างตารางเวรและบันทึกลง Google Sheet
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

