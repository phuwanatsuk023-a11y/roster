import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  ShieldCheck, 
  FileText, 
  CalendarCheck2, 
  Sparkles,
  ChevronRight,
  Printer,
  Info,
  CheckCircle2,
  CalendarDays,
  ClipboardList,
  Copy,
  Share2,
  Check,
  PhoneCall,
  Sparkle
} from 'lucide-react';
import { Personnel, DutyPoint, Holiday, SavedRoster, RosterDayEntry, DutyUnit } from './types';
import { TH_MONTHS, TH_SHORT_MONTHS, TH_DAY_NAMES, formatThaiDate, getTodayDateString, toThaiNumeral } from './thaiDate';

interface PublicDutyCheckProps {
  personnel: Personnel[];
  dutyPoints: DutyPoint[];
  holidays: Holiday[];
  savedRosters: SavedRoster[];
  onOpenRosterView: (month: number, year: number, gender: 'M' | 'F') => void;
  onPrintPersonnelList: () => void;
  activeSubTab?: 'search' | 'today' | 'inspectors';
  onSubTabChange?: (tab: 'search' | 'today' | 'inspectors') => void;
}

export const PublicDutyCheck: React.FC<PublicDutyCheckProps> = ({
  personnel,
  dutyPoints,
  holidays,
  savedRosters,
  onOpenRosterView,
  onPrintPersonnelList,
  activeSubTab = 'search',
  onSubTabChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'search' | 'today' | 'inspectors'>(activeSubTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeSubTab) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabSelect = (tab: 'search' | 'today' | 'inspectors') => {
    setActiveTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayDateStr = getTodayDateString();

  // Filter personnel matching query
  const matchingPersonnel = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return personnel.filter(p => 
      p.fname.toLowerCase().includes(q) ||
      p.lname.toLowerCase().includes(q) ||
      p.employee_id.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.dept.toLowerCase().includes(q)
    );
  }, [personnel, searchQuery]);

  const selectedPerson = useMemo(() => {
    return personnel.find(p => p.id === selectedPersonId);
  }, [personnel, selectedPersonId]);

  // Find duty assignments for the selected person in the selected month/year
  const userDutyAssignments = useMemo(() => {
    if (!selectedPerson) return [];

    const assignments: Array<{
      day: number;
      dateStr: string;
      dow: number;
      dowName: string;
      gender: 'M' | 'F';
      dutyPointName: string;
      roleTitle: string;
      partners: Personnel[];
      inspector: Personnel | null;
      isOff: boolean;
      timeText: string;
    }> = [];

    // Check both Male & Female rosters
    const gendersToCheck: ('M' | 'F')[] = selectedPerson.isInspector 
      ? ['M', 'F'] 
      : [selectedPerson.gender];

    gendersToCheck.forEach(gender => {
      const rosterId = `R_${selectedYear}_${selectedMonth}_${gender}`;
      const roster = savedRosters.find(r => r.id === rosterId || (r.month === selectedMonth && r.year === selectedYear && r.gender === gender));

      if (roster && roster.schedule) {
        roster.schedule.forEach(entry => {
          const entryDate = new Date(selectedYear, selectedMonth, entry.day);
          const dow = entryDate.getDay();
          const dowName = TH_DAY_NAMES[dow];

          // 1. If person is the inspector for this day
          if (entry.inspector === selectedPerson.id) {
            const timeText = gender === 'M' 
              ? '18.00 น. - 06.00 น. ของวันรุ่งขึ้น' 
              : '08.30 น. - 16.30 น.';

            assignments.push({
              day: entry.day,
              dateStr: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`,
              dow,
              dowName,
              gender,
              dutyPointName: 'ตรวจเวรทุกจุดประจำวัน',
              roleTitle: 'ผู้ตรวจเวรประจำวัน',
              partners: [],
              inspector: selectedPerson,
              isOff: entry.isOff,
              timeText
            });
          }

          // 2. If person is in duty units
          if (entry.unitsByPoint) {
            Object.entries(entry.unitsByPoint).forEach(([pointName, units]) => {
              (units as DutyUnit[]).forEach(unit => {
                const isHead = unit.head === selectedPerson.id;
                const isSub1 = unit.sub === selectedPerson.id;
                const isSub2 = unit.sub2 === selectedPerson.id;

                if (isHead || isSub1 || isSub2) {
                  const roleTitle = isHead ? 'หัวหน้าเวร (หน.เวร)' : 'ผู้ช่วยเวร (ผช.เวร)';
                  
                  // Find other partners in this unit
                  const partnerIds = [unit.head, unit.sub, unit.sub2].filter(id => id && id !== selectedPerson.id);
                  const partners = partnerIds.map(id => personnel.find(p => p.id === id)).filter(Boolean) as Personnel[];
                  const inspector = entry.inspector ? (personnel.find(p => p.id === entry.inspector) || null) : null;

                  const timeText = gender === 'M' 
                    ? '18.00 น. - 06.00 น. ของวันรุ่งขึ้น (กลางคืน)' 
                    : '08.30 น. - 16.30 น. (กลางวัน วันหยุด)';

                  assignments.push({
                    day: entry.day,
                    dateStr: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`,
                    dow,
                    dowName,
                    gender,
                    dutyPointName: pointName,
                    roleTitle,
                    partners,
                    inspector,
                    isOff: entry.isOff,
                    timeText
                  });
                }
              });
            });
          }
        });
      }
    });

    return assignments.sort((a, b) => a.day - b.day);
  }, [selectedPerson, selectedMonth, selectedYear, savedRosters, personnel]);

  // Today's active duty roster (Real-time)
  const todayRosters = useMemo(() => {
    const list: Array<{
      gender: 'M' | 'F';
      genderLabel: string;
      pointName: string;
      head: Personnel | null;
      sub: Personnel | null;
      sub2?: Personnel | null;
      inspector: Personnel | null;
      timeText: string;
    }> = [];

    ['M', 'F'].forEach(g => {
      const gender = g as 'M' | 'F';
      const roster = savedRosters.find(r => r.month === currentMonth && r.year === currentYear && r.gender === gender);
      if (roster && roster.schedule) {
        const todayEntry = roster.schedule.find(e => e.day === currentDay);
        if (todayEntry) {
          const inspector = todayEntry.inspector ? (personnel.find(p => p.id === todayEntry.inspector) || null) : null;
          
          if (todayEntry.unitsByPoint) {
            Object.entries(todayEntry.unitsByPoint).forEach(([pointName, units]) => {
              (units as DutyUnit[]).forEach(unit => {
                const head = unit.head ? (personnel.find(p => p.id === unit.head) || null) : null;
                const sub = unit.sub ? (personnel.find(p => p.id === unit.sub) || null) : null;
                const sub2 = unit.sub2 ? (personnel.find(p => p.id === unit.sub2) || null) : null;

                if (head || sub) {
                  list.push({
                    gender,
                    genderLabel: gender === 'M' ? 'เวรชาย (กลางคืน)' : 'เวรหญิง (กลางวัน)',
                    pointName,
                    head,
                    sub,
                    sub2,
                    inspector,
                    timeText: gender === 'M' ? '18.00 น. - 06.00 น.' : '08.30 น. - 16.30 น.'
                  });
                }
              });
            });
          }
        }
      }
    });

    return list;
  }, [savedRosters, currentMonth, currentYear, currentDay, personnel]);

  // Inspector pool
  const inspectorList = useMemo(() => {
    return personnel.filter(p => p.isInspector && p.status === 'active');
  }, [personnel]);

  // Copy duty details to clipboard for easy sharing on mobile (LINE, etc.)
  const handleCopyDutySchedule = (dutyItem?: any) => {
    if (!selectedPerson) return;
    
    let text = '';
    if (dutyItem) {
      text = `📌 แจ้งเตือนเวรยาม เทศบาลเมืองวารินชำราบ\n` +
        `👤 ชื่อ: ${selectedPerson.fname} ${selectedPerson.lname} (${selectedPerson.position})\n` +
        `📅 วันที่: ${dutyItem.day} ${TH_MONTHS[selectedMonth]} ${selectedYear + 543} (${dutyItem.dowName})\n` +
        `⏰ เวลา: ${dutyItem.timeText}\n` +
        `🏢 จุดประจำ: ${dutyItem.dutyPointName}\n` +
        `🛡️ บทบาท: ${dutyItem.roleTitle}\n` +
        (dutyItem.partners.length > 0 ? `👥 คู่เวร: ${dutyItem.partners.map((p: any) => p.fname + ' ' + p.lname).join(', ')}\n` : '') +
        (dutyItem.inspector ? `🔍 ผู้ตรวจเวร: ${dutyItem.inspector.fname} ${dutyItem.inspector.lname}\n` : '');
    } else {
      text = `📋 สรุปตารางเวร เทศบาลเมืองวารินชำราบ\n` +
        `👤 ${selectedPerson.fname} ${selectedPerson.lname} (${selectedPerson.position})\n` +
        `📅 ประจำเดือน: ${TH_MONTHS[selectedMonth]} ${selectedYear + 543}\n` +
        `จำนวน: ${userDutyAssignments.length} ผลัด\n` +
        userDutyAssignments.map((d, i) => `${i + 1}. วันที่ ${d.day} (${d.dowName}) - ${d.dutyPointName} (${d.roleTitle})`).join('\n');
    }

    navigator.clipboard.writeText(text);
    const key = dutyItem ? `item-${dutyItem.day}` : 'all';
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/50 text-blue-200 text-xs font-semibold mb-3 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              บริการตรวจสอบตารางเวรออนไลน์สำหรับเจ้าหน้าที่
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              ระบบตรวจสอบเวรยามและผู้ตรวจเวร
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              ผู้เข้าเวรและผู้ตรวจเวรสามารถพิมพ์ชื่อหรือเลือกวันที่ เพื่อตรวจสอบจุดประจำเวร คู่เวร และวันปฏิบัติหน้าที่ได้ทันที โดยไม่ต้องเข้าสู่ระบบ
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
            <button
              onClick={() => onOpenRosterView(selectedMonth, selectedYear, 'M')}
              className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4 text-blue-700" />
              ดูตารางเวรทั้งเดือน
            </button>
            <button
              onClick={onPrintPersonnelList}
              className="bg-blue-700/60 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-blue-500/50 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              พิมพ์รายชื่อตรวจสอบ A4
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => handleTabSelect('search')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 rounded-t-lg transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'search'
              ? 'border-blue-700 text-blue-800 bg-blue-50/50 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาเวรของฉัน</span>
        </button>

        <button
          onClick={() => handleTabSelect('today')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 rounded-t-lg transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'today'
              ? 'border-blue-700 text-blue-800 bg-blue-50/50 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>เวรวันนี้ ({currentDay} {TH_SHORT_MONTHS[currentMonth]})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        <button
          onClick={() => handleTabSelect('inspectors')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 rounded-t-lg transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'inspectors'
              ? 'border-blue-700 text-blue-800 bg-blue-50/50 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>ผู้ตรวจเวร ({inspectorList.length} ท่าน)</span>
        </button>
      </div>

      {/* TAB 1: Search My Duty */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          
          {/* Search Box & Month Filter */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
              
              {/* Search input */}
              <div className="md:col-span-6 relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  ค้นหาชื่อเจ้าหน้าที่ / รหัส / ตำแหน่ง
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="search-my-duty-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="พิมพ์ชื่อ นามสกุล เช่น อนุชา, วาสนา..."
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all min-h-[44px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedPersonId('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                    >
                      ล้าง
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown List */}
                {matchingPersonnel.length > 0 && !selectedPersonId && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {matchingPersonnel.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPersonId(p.id);
                          setSearchQuery(`${p.fname} ${p.lname}`);
                        }}
                        className="w-full text-left p-3 hover:bg-blue-50 transition-colors flex items-center justify-between text-xs sm:text-sm min-h-[44px]"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{p.fname} {p.lname}</p>
                          <p className="text-xs text-slate-500">{p.position} &bull; {p.dept}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.isInspector 
                            ? 'bg-purple-100 text-purple-700' 
                            : p.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {p.isInspector ? 'ผู้ตรวจเวร' : `ผู้อยู่เวร (${p.dutyPoint || 'ทั่วไป'})`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Select Person */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  หรือเลือกจากรายชื่อ
                </label>
                <select
                  id="select-person-dropdown"
                  value={selectedPersonId}
                  onChange={(e) => {
                    setSelectedPersonId(e.target.value);
                    const p = personnel.find(x => x.id === e.target.value);
                    if (p) setSearchQuery(`${p.fname} ${p.lname}`);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                >
                  <option value="">-- เลือกเจ้าหน้าที่ ({personnel.length} คน) --</option>
                  <optgroup label="ผู้ตรวจเวร">
                    {personnel.filter(p => p.isInspector).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fname} {p.lname} ({p.position})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="ผู้อยู่เวรชาย">
                    {personnel.filter(p => !p.isInspector && p.gender === 'M').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fname} {p.lname} - {p.dutyPoint} (คู่ {p.pairNo || '-'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="ผู้อยู่เวรหญิง">
                    {personnel.filter(p => !p.isInspector && p.gender === 'F').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fname} {p.lname} - {p.dutyPoint} (คู่ {p.pairNo || '-'})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Month Selector */}
              <div className="md:col-span-3 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    ประจำเดือน
                  </label>
                  <select
                    id="select-month-dropdown"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                  >
                    {TH_MONTHS.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    พ.ศ.
                  </label>
                  <select
                    id="select-year-dropdown"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                  >
                    {[2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y + 543}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Result Section */}
          {selectedPerson ? (
            <div className="space-y-4">
              
              {/* Profile header card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-md flex-shrink-0 ${
                    selectedPerson.isInspector 
                      ? 'bg-purple-600' 
                      : selectedPerson.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600'
                  }`}>
                    {selectedPerson.fname.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {selectedPerson.fname} {selectedPerson.lname}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedPerson.isInspector
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : selectedPerson.gender === 'M' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-pink-100 text-pink-800 border border-pink-300'
                      }`}>
                        {selectedPerson.isInspector ? 'ผู้ตรวจเวร' : `ผู้เข้าเวร (คู่ที่ ${selectedPerson.pairNo || '-'})`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedPerson.position} &bull; {selectedPerson.dept} {selectedPerson.dutyPoint && `&bull; จุดประจำ: ${selectedPerson.dutyPoint}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100">
                    <p className="text-[11px] text-slate-600">เวรเดือน {TH_SHORT_MONTHS[selectedMonth]} {selectedYear + 543}</p>
                    <p className="text-lg sm:text-xl font-extrabold text-blue-900">
                      {userDutyAssignments.length} <span className="text-xs font-normal text-slate-600">ผลัด/วัน</span>
                    </p>
                  </div>

                  {/* Share / Copy Button */}
                  <button
                    onClick={() => handleCopyDutySchedule()}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[44px] ${
                      copiedId === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-900 border-slate-200'
                    }`}
                    title="คัดลอกสรุปตารางเวรทั้งหมดของเจ้าหน้าที่ท่านนี้"
                  >
                    {copiedId === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedId === 'all' ? 'คัดลอกแล้ว!' : 'คัดลอกเวร'}</span>
                  </button>
                </div>
              </div>

              {/* Assignment Cards Grid */}
              {userDutyAssignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {userDutyAssignments.map((duty, idx) => {
                    const isToday = duty.day === currentDay && selectedMonth === currentMonth && selectedYear === currentYear;
                    const isCopied = copiedId === `item-${duty.day}`;
                    return (
                      <div 
                        key={idx}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                          isToday 
                            ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-300'
                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Header: Date & Day */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                              isToday ? 'bg-amber-500 text-white shadow-md' : 'bg-blue-900 text-white shadow-sm'
                            }`}>
                              {duty.day}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{duty.dowName}</p>
                              <p className="text-xs text-slate-500">
                                {duty.day} {TH_SHORT_MONTHS[selectedMonth]} {selectedYear + 543}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isToday ? (
                              <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-extrabold animate-pulse shadow-sm">
                                เวรวันนี้
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                ผลัดที่ {idx + 1}
                              </span>
                            )}

                            {/* Share button for single shift */}
                            <button
                              onClick={() => handleCopyDutySchedule(duty)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isCopied ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-900 border-slate-200'
                              }`}
                              title="คัดลอกเวรวันนี้นำไปส่ง LINE"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2.5 text-xs sm:text-sm">
                          {/* Point */}
                          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[11px] text-slate-400 block font-medium">จุดปฏิบัติหน้าที่:</span>
                              <p className="font-bold text-slate-900">{duty.dutyPointName}</p>
                            </div>
                          </div>

                          {/* Role */}
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[11px] text-slate-400 block">บทบาทในผลัด:</span>
                              <p className="font-semibold text-blue-900">{duty.roleTitle}</p>
                            </div>
                          </div>

                          {/* Duty Time */}
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[11px] text-slate-400 block">เวลาปฏิบัติหน้าที่:</span>
                              <p className="text-slate-700 font-medium">{duty.timeText}</p>
                            </div>
                          </div>

                          {/* Duty Partners */}
                          {duty.partners.length > 0 && (
                            <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                              <Users className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] text-slate-400 block font-medium">
                                  คู่เวรร่วมผลัด ({duty.partners.length} ท่าน):
                                </span>
                                <div className="space-y-1 mt-1">
                                  {duty.partners.map((p, pIdx) => (
                                    <div key={pIdx} className="bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                                      <span className="font-semibold text-emerald-950 truncate">
                                        {p.fname} {p.lname}
                                      </span>
                                      <span className="text-[10px] text-emerald-700 flex-shrink-0 ml-1">
                                        ({p.position})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Inspector on duty */}
                          {duty.inspector && (
                            <div className="flex items-start gap-2 pt-2 border-t border-slate-100 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                              <User className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] text-purple-700 font-bold uppercase block">ผู้ตรวจเวรประจำวัน:</span>
                                <p className="font-bold text-purple-950">
                                  {duty.inspector.fname} {duty.inspector.lname}
                                </p>
                                <p className="text-[11px] text-purple-800">{duty.inspector.position} &bull; {duty.inspector.dept}</p>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">ไม่พบตารางเวรในเดือนนี้</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    ยังไม่มีการจัดตารางเวรหรือเจ้าหน้าที่ท่านนี้ไม่มีรอบเข้าเวรในเดือน {TH_MONTHS[selectedMonth]} พ.ศ. {selectedYear + 543}
                  </p>
                  <button
                    onClick={() => onOpenRosterView(selectedMonth, selectedYear, selectedPerson.gender)}
                    className="mt-4 inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px]"
                  >
                    <ClipboardList className="w-4 h-4" />
                    เปิดดูตารางเวรภาพรวมทั้งเดือน
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Empty state guiding user to search */
            <div className="bg-white rounded-2xl p-6 sm:p-10 text-center border border-dashed border-slate-300 shadow-sm">
              <Search className="w-12 h-12 text-blue-300 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                กรุณาพิมพ์ชื่อหรือเลือกเจ้าหน้าที่เพื่อตรวจสอบวันเข้าเวร
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
                ระบบจะค้นหาตารางเวร คู่เวรที่จัดคู่ร่วมกัน และผู้ตรวจเวรประจำวันให้โดยอัตโนมัติ
              </p>
              
              {/* Quick Suggestion Pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                <span className="text-xs text-slate-400 w-full mb-1">ตัวอย่างคลิกเลือกดู:</span>
                {personnel.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPersonId(p.id);
                      setSearchQuery(`${p.fname} ${p.lname}`);
                    }}
                    className="text-xs bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 px-3 py-2 rounded-full transition-colors min-h-[36px]"
                  >
                    {p.fname} {p.lname}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: Today's Active Duty Roster */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                เจ้าหน้าที่ปฏิบัติหน้าที่เวรวันนี้
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {TH_DAY_NAMES[today.getDay()]}ที่ {currentDay} {TH_MONTHS[currentMonth]} พ.ศ. {currentYear + 543}
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              กำลังปฏิบัติหน้าที่
            </span>
          </div>

          {todayRosters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayRosters.map((duty, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        duty.gender === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {duty.genderLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{duty.timeText}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">จุดประจำเวร:</span>
                      <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {duty.pointName}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      {duty.head && (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            1. {duty.head.fname} {duty.head.lname}
                          </span>
                          <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                            หน.เวร
                          </span>
                        </div>
                      )}
                      {duty.sub && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">
                            2. {duty.sub.fname} {duty.sub.lname}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-800 font-semibold px-1.5 py-0.5 rounded">
                            ผช.เวร
                          </span>
                        </div>
                      )}
                      {duty.sub2 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">
                            3. {duty.sub2.fname} {duty.sub2.lname}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-800 font-semibold px-1.5 py-0.5 rounded">
                            ผช.เวร
                          </span>
                        </div>
                      )}
                    </div>

                    {duty.inspector && (
                      <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-xs">
                        <span className="text-[10px] text-purple-700 font-bold">ผู้ตรวจเวรประจำวัน:</span>
                        <p className="font-bold text-purple-950 mt-0.5">
                          {duty.inspector.fname} {duty.inspector.lname}
                        </p>
                        <p className="text-[10px] text-slate-500">{duty.inspector.position}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
              <CalendarCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800">ยังไม่มีข้อมูลตารางเวรสำหรับวันนี้</h4>
              <p className="text-xs text-slate-500 mt-1">
                กรุณาให้ผู้ดูแลระบบ (Admin) กดสร้างตารางเวรประจำเดือน {TH_MONTHS[currentMonth]} {currentYear + 543}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Inspectors Pool */}
      {activeTab === 'inspectors' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                ทำเนียบผู้ตรวจเวรประจำสำนักงานเทศบาลเมืองวารินชำราบ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ระดับผู้อำนวยการกอง / หัวหน้าฝ่าย ที่ได้รับมอบหมายให้ปฏิบัติหน้าที่ตรวจเวร
              </p>
            </div>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              รวม {inspectorList.length} ท่าน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspectorList.map((insp, idx) => (
              <div 
                key={insp.id} 
                onClick={() => {
                  setSelectedPersonId(insp.id);
                  setSearchQuery(`${insp.fname} ${insp.lname}`);
                  setActiveTab('search');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">
                    {insp.fname} {insp.lname}
                  </p>
                  <p className="text-xs text-purple-700 font-medium truncate">{insp.position}</p>
                  <p className="text-[11px] text-slate-500 truncate">{insp.dept}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
