import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Shield, Users } from 'lucide-react';
import { DutyPoint, Personnel, Gender } from './types';

interface DutyPointsManagementProps {
  dutyPoints: DutyPoint[];
  personnel: Personnel[];
  onAddDutyPoint: (name: string, gender: Gender) => Promise<void>;
  onDeleteDutyPoint: (id: string | number) => Promise<void>;
  showToast: (msg: string) => void;
}

export const DutyPointsManagement: React.FC<DutyPointsManagementProps> = ({
  dutyPoints,
  personnel,
  onAddDutyPoint,
  onDeleteDutyPoint,
  showToast
}) => {
  const [maleInput, setMaleInput] = useState('');
  const [femaleInput, setFemaleInput] = useState('');

  const malePoints = dutyPoints.filter(p => p.gender === 'M');
  const femalePoints = dutyPoints.filter(p => p.gender === 'F');

  const handleAddMale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maleInput.trim()) return;
    await onAddDutyPoint(maleInput.trim(), 'M');
    setMaleInput('');
    showToast('เพิ่มจุดเวรชายสำเร็จ (บันทึกลง Google Sheet แล้ว)');
  };

  const handleAddFemale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!femaleInput.trim()) return;
    await onAddDutyPoint(femaleInput.trim(), 'F');
    setFemaleInput('');
    showToast('เพิ่มจุดเวรหญิงสำเร็จ (บันทึกลง Google Sheet แล้ว)');
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (confirm(`ต้องการลบจุดเวร "${name}" ใช่หรือไม่?`)) {
      await onDeleteDutyPoint(id);
      showToast('ลบจุดเวรสำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-900" />
          จัดการจุดประจำเวรยาม (Duty Points)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          กำหนดจุดประจำการสำหรับเวรชาย (ปฏิบัติงานกลางคืนทุกวัน) และเวรหญิง (ปฏิบัติงานกลางวันเฉพาะวันหยุด)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Male Duty Points */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-blue-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                จุดเวรชาย (ปฏิบัติงานทุกวัน)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">รวม {malePoints.length} จุดประจำการ</p>
            </div>
          </div>

          <div className="space-y-2">
            {malePoints.map((pt, idx) => {
              const guardCount = personnel.filter(p => p.gender === 'M' && p.status === 'active' && !p.isInspector && p.dutyPoint === pt.name).length;
              return (
                <div key={pt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900">{pt.name}</p>
                      <p className="text-[11px] text-slate-400">มีเจ้าหน้าที่สังกัดจุดนี้ {guardCount} คน</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(pt.id, pt.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบจุดเวร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add form */}
          <form onSubmit={handleAddMale} className="pt-2 flex gap-2">
            <input
              type="text"
              required
              value={maleInput}
              onChange={(e) => setMaleInput(e.target.value)}
              placeholder="เพิ่มจุดเวรชาย เช่น อาคารฝ่ายการเงิน..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </button>
          </form>
        </div>

        {/* Female Duty Points */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-pink-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500" />
                จุดเวรหญิง (เสาร์-อาทิตย์-วันหยุด)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">รวม {femalePoints.length} จุดประจำการ</p>
            </div>
          </div>

          <div className="space-y-2">
            {femalePoints.map((pt, idx) => {
              const guardCount = personnel.filter(p => p.gender === 'F' && p.status === 'active' && !p.isInspector && p.dutyPoint === pt.name).length;
              return (
                <div key={pt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900">{pt.name}</p>
                      <p className="text-[11px] text-slate-400">มีเจ้าหน้าที่สังกัดจุดนี้ {guardCount} คน</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(pt.id, pt.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบจุดเวร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add form */}
          <form onSubmit={handleAddFemale} className="pt-2 flex gap-2">
            <input
              type="text"
              required
              value={femaleInput}
              onChange={(e) => setFemaleInput(e.target.value)}
              placeholder="เพิ่มจุดเวรหญิง เช่น ศูนย์พัฒนาเด็กเล็ก..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-pink-600"
            />
            <button
              type="submit"
              className="bg-pink-700 hover:bg-pink-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
