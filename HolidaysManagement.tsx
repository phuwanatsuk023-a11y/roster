import React, { useState } from 'react';
import { CalendarOff, Plus, Trash2, Calendar } from 'lucide-react';
import { Holiday } from './types';
import { formatThaiDate } from './thaiDate';

interface HolidaysManagementProps {
  holidays: Holiday[];
  onAddHoliday: (date: string, name: string, type: 'official' | 'special') => Promise<void>;
  onDeleteHoliday: (id: string | number) => Promise<void>;
  showToast: (msg: string) => void;
}

export const HolidaysManagement: React.FC<HolidaysManagementProps> = ({
  holidays,
  onAddHoliday,
  onDeleteHoliday,
  showToast
}) => {
  const [formDate, setFormDate] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'official' | 'special'>('official');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formName.trim()) {
      showToast('กรุณากรอกวันที่และชื่อวันหยุด');
      return;
    }

    await onAddHoliday(formDate, formName.trim(), formType);
    setFormDate('');
    setFormName('');
    setIsAddOpen(false);
    showToast('เพิ่มวันหยุดเรียบร้อย (บันทึกลง Google Sheet แล้ว)');
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (confirm(`ต้องการลบวันหยุด "${name}" ใช่หรือไม่?`)) {
      await onDeleteHoliday(id);
      showToast('ลบวันหยุดเรียบร้อย');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-amber-600" />
            จัดการวันหยุดราชการและวันหยุดพิเศษ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            วันหยุดเหล่านี้จะถูกนำไปใช้คำนวณเวรหญิง (กลางวัน) และกำหนดวันหยุดในตารางเวรโดยอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          เพิ่มวันหยุด
        </button>
      </div>

      {/* Holidays Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-16 text-center">ลำดับ</th>
                <th className="p-3 w-48">วันที่</th>
                <th className="p-3">ชื่อวันหยุด</th>
                <th className="p-3 w-36 text-center">ประเภท</th>
                <th className="p-3 w-20 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedHolidays.map((h, idx) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    {formatThaiDate(h.holiday_date)}
                  </td>
                  <td className="p-3 text-slate-800">{h.name}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      h.type === 'official' 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {h.type === 'official' ? 'วันหยุดราชการ' : 'วันหยุดพิเศษ'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(h.id, h.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบวันหยุด"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">เพิ่มข้อมูลวันหยุด</h3>
            
            <form onSubmit={handleAdd} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">วันที่ (ค.ศ. เช่น 2026-08-12)</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ชื่อวันหยุด</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น วันเฉลิมพระชนมพรรษาฯ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ประเภทวันหยุด</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="official">วันหยุดราชการ</option>
                  <option value="special">วันหยุดพิเศษ / วันหยุดเพิ่มเติม</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-md"
                >
                  บันทึกวันหยุด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
