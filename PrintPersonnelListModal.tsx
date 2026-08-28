import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { Personnel } from './types';

interface PrintPersonnelListModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel[];
}

export const PrintPersonnelListModal: React.FC<PrintPersonnelListModalProps> = ({
  isOpen,
  onClose,
  personnel
}) => {
  if (!isOpen) return null;

  // Sort personnel: Inspectors first, then by Point & Pair
  const sortedPersonnel = [...personnel].sort((a, b) => {
    if (a.isInspector !== b.isInspector) return a.isInspector ? 1 : -1;
    if (!a.isInspector) {
      if (a.gender !== b.gender) return a.gender === 'M' ? -1 : 1;
      const pointComp = (a.dutyPoint || '').localeCompare(b.dutyPoint || '');
      if (pointComp !== 0) return pointComp;
      const pairA = parseInt(a.pairNo || '0', 10);
      const pairB = parseInt(b.pairNo || '0', 10);
      if (pairA !== pairB) return pairA - pairB;
    }
    return a.orderIndex - b.orderIndex;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0 print:rounded-none">
        
        {/* Controls (Hidden on print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              พิมพ์รายชื่อตรวจสอบบุคลากรปฏิบัติหน้าที่เวรยาม (A4 แนวนอน)
            </h3>
            <p className="text-xs text-slate-500">
              จัดกลุ่มตามจุดประจำเวรและกลุ่มผู้ตรวจเวร
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร (Print)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div id="print-personnel-content" className="space-y-4 font-sarabun text-slate-900 p-2">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">
              รายชื่อตรวจสอบบุคลากรปฏิบัติหน้าที่เวรยาม
            </h2>
            <p className="text-xs text-slate-700">
              สำนักงานเทศบาลเมืองวารินชำราบ ศูนย์บริการสาธารณสุขฯ และโครงการปรับปรุงคุณภาพน้ำ
            </p>
          </div>

          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-center">
                <th className="border border-black p-2 w-14">คู่ที่</th>
                <th className="border border-black p-2 text-left w-56">ชื่อ-สกุล</th>
                <th className="border border-black p-2 text-left">ตำแหน่ง</th>
                <th className="border border-black p-2 text-left">สังกัด</th>
                <th className="border border-black p-2 text-center w-48">จุดอยู่เวร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {sortedPersonnel.map((p, idx) => {
                const isInspector = p.isInspector;
                const roleText = isInspector ? 'ผู้ตรวจเวร' : (p.pairNo ? `คู่ที่ ${p.pairNo}` : '-');
                
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="border border-black p-2 text-center font-bold">
                      {isInspector ? '-' : (p.pairNo || '-')}
                    </td>
                    <td className="border border-black p-2 font-semibold">
                      {p.fname} {p.lname} {isInspector && <span className="text-[10px] text-purple-700 font-normal"> (ผู้ตรวจเวร)</span>}
                    </td>
                    <td className="border border-black p-2">{p.position}</td>
                    <td className="border border-black p-2">{p.dept}</td>
                    <td className="border border-black p-2 text-center">
                      {isInspector ? 'ตรวจเวรทุกจุด' : (p.dutyPoint || '-')}
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
