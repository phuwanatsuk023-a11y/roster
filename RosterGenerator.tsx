import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Save, 
  Printer, 
  Calendar, 
  Users, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { Personnel, DutyPoint, Holiday, SavedRoster, RosterDayEntry, Gender, DutyUnit } from './types';
import { TH_MONTHS, TH_SHORT_MONTHS, TH_DAY_NAMES, formatThaiDate } from './thaiDate';

interface RosterGeneratorProps {
  personnel: Personnel[];
  dutyPoints: DutyPoint[];
  holidays: Holiday[];
  onSaveRoster: (month: number, year: number, gender: Gender, schedule: RosterDayEntry[]) => Promise<void>;
  showToast: (msg: string) => void;
  onOpenSheetConfig: () => void;
}

export const RosterGenerator: React.FC<RosterGeneratorProps> = ({
  personnel,
  dutyPoints,
  holidays,
  onSaveRoster,
  showToast,
  onOpenSheetConfig
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedGender, setSelectedGender] = useState<Gender>('M');

  // Starting pair index per duty point
  const [startingPairIndices, setStartingPairIndices] = useState<Record<string, number>>({});
  // Starting inspector index
  const [startingInspectorIndex, setStartingInspectorIndex] = useState<number>(0);

  // Generated schedule preview
  const [generatedSchedule, setGeneratedSchedule] = useState<RosterDayEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Get active guards and inspectors for the gender
  const availableGuards = useMemo(() => {
    return personnel.filter(p => p.gender === selectedGender && p.canDuty && p.status === 'active' && !p.isInspector);
  }, [personnel, selectedGender]);

  const availableInspectors = useMemo(() => {
    return personnel.filter(p => p.gender === selectedGender && p.isInspector && p.status === 'active');
  }, [personnel, selectedGender]);

  const pointsForGender = useMemo(() => {
    return dutyPoints.filter(p => p.gender === selectedGender).sort((a, b) => a.order_index - b.order_index).map(p => p.name);
  }, [dutyPoints, selectedGender]);

  // Group guards into units for each point
  const getUnitsForPoint = (pointName: string, gender: Gender) => {
    const people = personnel.filter(p => {
      if (p.gender !== gender || !p.canDuty || p.status !== 'active' || p.isInspector) return false;
      if (gender === 'M') return p.dutyPoint === pointName;
      return true; // For female, duty points can rotate or match
    });

    const groups: Record<string, Personnel[]> = {};
    const singletons: Personnel[][] = [];

    people.forEach(p => {
      if (p.pairNo && p.pairNo.trim() !== '') {
        if (!groups[p.pairNo]) groups[p.pairNo] = [];
        groups[p.pairNo].push(p);
      } else {
        singletons.push([p]);
      }
    });

    const units: Array<{ id: string; label: string; members: Personnel[] }> = [];
    const sortedPairNos = Object.keys(groups).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    sortedPairNos.forEach(pairNo => {
      units.push({ id: `pair_${pairNo}`, label: `คู่ที่ ${pairNo}`, members: groups[pairNo] });
    });

    singletons.forEach(s => {
      units.push({ id: `single_${s[0].id}`, label: 'เดี่ยว', members: s });
    });

    // Merge 1-person remainders into adjacent 2-person units (to form 3-person units)
    for (let i = 0; i < units.length; i++) {
      if (units[i].members.length === 1) {
        if (i + 1 < units.length && units[i + 1].members.length === 2) {
          units[i + 1].members.push(units[i].members[0]);
          units.splice(i, 1);
          i--;
        } else if (i - 1 >= 0 && units[i - 1].members.length === 2) {
          units[i - 1].members.push(units[i].members[0]);
          units.splice(i, 1);
          i--;
        }
      }
    }

    return units;
  };

  // Run the Generator Algorithm
  const handleGenerate = () => {
    if (availableGuards.length === 0) {
      showToast(`ไม่มีบุคลากร${selectedGender === 'M' ? 'ชาย' : 'หญิง'}ที่เปิดสถานะเข้าเวร`);
      return;
    }
    if (pointsForGender.length === 0) {
      showToast(`กรุณาเพิ่มจุดเวร${selectedGender === 'M' ? 'ชาย' : 'หญิง'}ก่อนจัดตารางเวร`);
      return;
    }

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const roster: RosterDayEntry[] = [];

    let inspIndex = startingInspectorIndex;

    // Track current index per duty point
    const pointUnits: Record<string, Array<{ id: string; label: string; members: Personnel[] }>> = {};
    const pointCurrentIndex: Record<string, number> = {};

    pointsForGender.forEach(pt => {
      pointUnits[pt] = getUnitsForPoint(pt, selectedGender);
      pointCurrentIndex[pt] = startingPairIndices[pt] || 0;
    });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      const dow = date.getDay();
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const isHoliday = holidays.some(h => h.holiday_date === dateStr);
      const isOff = dow === 0 || dow === 6 || isHoliday;

      const isDutyDay = selectedGender === 'M' ? true : isOff;

      const dayEntry: RosterDayEntry = {
        day: d,
        dateStr,
        dow,
        isOff,
        unitsByPoint: {},
        inspector: null
      };

      if (isDutyDay) {
        pointsForGender.forEach(pt => {
          const units = pointUnits[pt];
          if (units && units.length > 0) {
            const currentIdx = pointCurrentIndex[pt] % units.length;
            const currentUnit = units[currentIdx];

            const head = currentUnit.members[0] ? currentUnit.members[0].id : null;
            const sub = currentUnit.members[1] ? currentUnit.members[1].id : null;
            const sub2 = currentUnit.members[2] ? currentUnit.members[2].id : null;

            dayEntry.unitsByPoint[pt] = [{ head, sub, sub2 }];
            pointCurrentIndex[pt] = (pointCurrentIndex[pt] + 1) % units.length;
          } else {
            dayEntry.unitsByPoint[pt] = [];
          }
        });

        if (availableInspectors.length > 0) {
          dayEntry.inspector = availableInspectors[inspIndex % availableInspectors.length].id;
          inspIndex++;
        }
      }

      roster.push(dayEntry);
    }

    setGeneratedSchedule(roster);
    showToast('สร้างตารางเวรอัตโนมัติเรียบร้อย! สามารถตรวจสอบและกดบันทึกได้');
  };

  // Auto generate on initial load or gender switch
  useEffect(() => {
    handleGenerate();
  }, [selectedMonth, selectedYear, selectedGender]);

  // Save to Google Sheet
  const handleSave = async () => {
    if (generatedSchedule.length === 0) {
      showToast('กรุณากดสร้างตารางเวรก่อนบันทึก');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveRoster(selectedMonth, selectedYear, selectedGender, generatedSchedule);
      showToast('บันทึกตารางเวรลง Google Sheet สำเร็จแบบ Real-time!');
    } catch (e: any) {
      showToast('เกิดข้อผิดพลาดในการบันทึก: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Personnel lookup helper
  const getPersonName = (id: string | null) => {
    if (!id) return '-';
    const p = personnel.find(x => x.id === id);
    return p ? `${p.fname} ${p.lname}` : id;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Configuration bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-900" />
              ระบบสร้างและคำนวณตารางเวรอัตโนมัติ (Roster Generator)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              คำนวณรอบเวรแบบ Cyclic Queue จัดคู่เวร 2-3 คน และสลับผู้ตรวจเวรโดยอัตโนมัติ พร้อมบันทึกลง Google Sheet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 sm:flex-initial bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 text-blue-300" />
              <span>คำนวณตาราง</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || generatedSchedule.length === 0}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกลง Google Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Filter Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทเวรยาม</label>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setSelectedGender('M')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === 'M' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                เวรชาย (กลางคืนทุกวัน)
              </button>
              <button
                onClick={() => setSelectedGender('F')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === 'F' ? 'bg-pink-700 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                เวรหญิง (วันหยุดกลางวัน)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ประจำเดือน</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
            >
              {TH_MONTHS.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ปี พ.ศ.</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
            >
              {[2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y + 543}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Starting Pairs & Starting Inspector Config Panel */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-700" />
              กำหนดคู่เวรเริ่มต้นของวันแรก (Cycle Start per Duty Point)
            </h4>
            <span className="text-[11px] text-slate-400">เลือกผลัดแรกที่จะเริ่มหมุนเวรในวันที่ 1</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pointsForGender.map(pt => {
              const units = getUnitsForPoint(pt, selectedGender);
              return (
                <div key={pt} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 truncate" title={pt}>
                    {pt}
                  </label>
                  <select
                    value={startingPairIndices[pt] || 0}
                    onChange={(e) => {
                      setStartingPairIndices(prev => ({
                        ...prev,
                        [pt]: Number(e.target.value)
                      }));
                    }}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {units.length > 0 ? (
                      units.map((u, uIdx) => (
                        <option key={u.id} value={uIdx}>
                          {u.label} ({u.members.map(m => `${m.fname} ${m.lname}`).join(', ')})
                        </option>
                      ))
                    ) : (
                      <option value="0">ไม่มีบุคลากรสังกัดจุดนี้</option>
                    )}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Starting Inspector */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">ผู้ตรวจเวรเริ่มต้นวันแรก:</span>
            </div>
            <select
              value={startingInspectorIndex}
              onChange={(e) => setStartingInspectorIndex(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-semibold text-purple-900 max-w-xs"
            >
              {availableInspectors.map((insp, idx) => (
                <option key={insp.id} value={idx}>
                  {insp.fname} {insp.lname} ({insp.position})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Generated Schedule Preview Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              ผลการคำนวณตารางเวร ({TH_MONTHS[selectedMonth]} {selectedYear + 543})
            </h3>
            <p className="text-xs text-slate-400">
              {selectedGender === 'M' ? 'เวรชาย (ทุกวัน)' : 'เวรหญิง (เฉพาะวันเสาร์-อาทิตย์ และวันหยุด)'}
            </p>
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            รวม {generatedSchedule.filter(e => selectedGender === 'M' || e.isOff).length} ผลัดเวร
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-300 text-left">
            <thead className="bg-slate-100 font-bold text-slate-800">
              <tr>
                <th className="border border-slate-300 p-2.5 text-center w-28">วัน/เดือน/ปี</th>
                {pointsForGender.map(pt => (
                  <th key={pt} className="border border-slate-300 p-2.5 text-center">{pt}</th>
                ))}
                <th className="border border-slate-300 p-2.5 text-center w-36">ผู้ตรวจเวร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {generatedSchedule
                .filter(e => selectedGender === 'M' || e.isOff)
                .map((entry) => {
                  const entryDate = new Date(selectedYear, selectedMonth, entry.day);
                  const dow = entryDate.getDay();

                  return (
                    <tr 
                      key={entry.day} 
                      className={`${entry.isOff ? 'bg-amber-50/40' : 'bg-white'} hover:bg-blue-50/40 transition-colors`}
                    >
                      <td className="border border-slate-300 p-2 text-center align-top font-bold text-slate-800 whitespace-nowrap">
                        <div>{entry.day} {TH_SHORT_MONTHS[selectedMonth]} {selectedYear + 543}</div>
                        <div className="text-[10px] text-slate-500 font-normal">({TH_DAY_NAMES[dow]})</div>
                      </td>

                      {pointsForGender.map(pt => {
                        const units = entry.unitsByPoint[pt] || [];
                        return (
                          <td key={pt} className="border border-slate-300 p-2 align-top">
                            {units.map((u, uIdx) => (
                              <div key={uIdx} className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">1. {getPersonName(u.head)}</span>
                                  <span className="text-[10px] text-blue-700 font-semibold">หน.เวร</span>
                                </div>
                                {u.sub && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-700">2. {getPersonName(u.sub)}</span>
                                    <span className="text-[10px] text-slate-400">ผช.เวร</span>
                                  </div>
                                )}
                                {u.sub2 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-700">3. {getPersonName(u.sub2)}</span>
                                    <span className="text-[10px] text-slate-400">ผช.เวร</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </td>
                        );
                      })}

                      <td className="border border-slate-300 p-2 text-center align-top font-bold text-purple-900">
                        {getPersonName(entry.inspector)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
