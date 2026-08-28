import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Move, 
  Printer, 
  MapPin, 
  ShieldCheck,
  CheckCircle,
  X,
  GripVertical
} from 'lucide-react';
import { Personnel, DutyPoint, Gender } from './types';

interface PersonnelManagementProps {
  personnel: Personnel[];
  dutyPoints: DutyPoint[];
  onAddPersonnel: (person: Omit<Personnel, 'id'>) => Promise<void>;
  onUpdatePersonnel: (person: Personnel) => Promise<void>;
  onDeletePersonnel: (id: string) => Promise<void>;
  onBatchUpdateGuards: (guards: Personnel[]) => Promise<void>;
  onPrintPersonnelList: () => void;
  showToast: (msg: string) => void;
}

export const PersonnelManagement: React.FC<PersonnelManagementProps> = ({
  personnel,
  dutyPoints,
  onAddPersonnel,
  onUpdatePersonnel,
  onDeletePersonnel,
  onBatchUpdateGuards,
  onPrintPersonnelList,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterPoint, setFilterPoint] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Personnel | null>(null);

  // Form State
  const [formFname, setFormFname] = useState('');
  const [formLname, setFormLname] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formPos, setFormPos] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formGender, setFormGender] = useState<Gender>('M');
  const [formRole, setFormRole] = useState<'duty' | 'inspector'>('duty');
  const [formPoint, setFormPoint] = useState('');
  const [formPairNo, setFormPairNo] = useState('');

  // Drag and Drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Filtered & Sorted Personnel
  const filteredList = useMemo(() => {
    let list = [...personnel];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p => 
        p.fname.toLowerCase().includes(q) ||
        p.lname.toLowerCase().includes(q) ||
        p.employee_id.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.dept.toLowerCase().includes(q) ||
        (p.pairNo || '').includes(q)
      );
    }

    if (filterGender) {
      list = list.filter(p => p.gender === filterGender);
    }

    if (filterRole) {
      list = list.filter(p => filterRole === 'duty' ? (!p.isInspector && p.canDuty) : p.isInspector);
    }

    if (filterPoint) {
      list = list.filter(p => p.dutyPoint === filterPoint);
    }

    // Sort order: Inspectors first, then by Point & PairNo
    list.sort((a, b) => {
      if (a.isInspector !== b.isInspector) return a.isInspector ? 1 : -1;
      if (!a.isInspector) {
        if (a.gender !== b.gender) return a.gender === 'M' ? -1 : 1;
        const pairA = parseInt(a.pairNo || '0', 10);
        const pairB = parseInt(b.pairNo || '0', 10);
        if (pairA !== pairB) return pairA - pairB;
      }
      return a.orderIndex - b.orderIndex;
    });

    return list;
  }, [personnel, search, filterGender, filterRole, filterPoint]);

  // Pagination
  const paginatedList = useMemo(() => {
    if (rowsPerPage === 'all') return filteredList;
    const limit = parseInt(rowsPerPage, 10);
    const start = (currentPage - 1) * limit;
    return filteredList.slice(start, start + limit);
  }, [filteredList, rowsPerPage, currentPage]);

  const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(filteredList.length / parseInt(rowsPerPage, 10)) || 1;

  // Auto calculate next pair number
  const calculateNextPairNo = (gender: Gender, point: string) => {
    const sameGroup = personnel.filter(p => 
      p.gender === gender && 
      p.status === 'active' && 
      !p.isInspector && 
      (gender === 'F' ? true : p.dutyPoint === point)
    );

    let maxPair = 0;
    const counts: Record<number, number> = {};

    sameGroup.forEach(p => {
      const pn = parseInt(p.pairNo || '0', 10);
      if (pn > 0) {
        if (pn > maxPair) maxPair = pn;
        counts[pn] = (counts[pn] || 0) + 1;
      }
    });

    if (maxPair === 0) return '1';
    if ((counts[maxPair] || 0) < 2) return maxPair.toString();
    return (maxPair + 1).toString();
  };

  const openAddModal = () => {
    setFormFname('');
    setFormLname('');
    setFormEmpId('EMP' + String(Date.now()).slice(-4));
    setFormPos('');
    setFormDept('');
    setFormGender('M');
    setFormRole('duty');
    const defaultPoint = dutyPoints.find(p => p.gender === 'M')?.name || '';
    setFormPoint(defaultPoint);
    setFormPairNo(calculateNextPairNo('M', defaultPoint));
    setIsAddOpen(true);
  };

  const openEditModal = (p: Personnel) => {
    setEditingPerson(p);
    setFormFname(p.fname);
    setFormLname(p.lname);
    setFormEmpId(p.employee_id);
    setFormPos(p.position);
    setFormDept(p.dept);
    setFormGender(p.gender);
    setFormRole(p.isInspector ? 'inspector' : 'duty');
    setFormPoint(p.dutyPoint || '');
    setFormPairNo(p.pairNo || '');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFname.trim() || !formLname.trim()) {
      showToast('กรุณากรอกชื่อและนามสกุล');
      return;
    }

    await onAddPersonnel({
      employee_id: formEmpId.trim() || 'EMP000',
      fname: formFname.trim(),
      lname: formLname.trim(),
      gender: formGender,
      position: formPos.trim() || 'พนักงาน',
      dept: formDept.trim() || 'สำนักปลัดเทศบาล',
      status: 'active',
      canDuty: formRole === 'duty',
      isInspector: formRole === 'inspector',
      dutyPoint: formRole === 'duty' ? formPoint : '',
      pairNo: formRole === 'duty' ? formPairNo : '',
      orderIndex: Date.now()
    });

    setIsAddOpen(false);
    showToast('เพิ่มบุคลากรเข้าสู่ระบบเรียบร้อย');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;

    await onUpdatePersonnel({
      ...editingPerson,
      employee_id: formEmpId.trim(),
      fname: formFname.trim(),
      lname: formLname.trim(),
      gender: formGender,
      position: formPos.trim(),
      dept: formDept.trim(),
      canDuty: formRole === 'duty',
      isInspector: formRole === 'inspector',
      dutyPoint: formRole === 'duty' ? formPoint : '',
      pairNo: formRole === 'duty' ? formPairNo : ''
    });

    setEditingPerson(null);
    showToast('บันทึกการแก้ไขบุคลากรเรียบร้อย');
  };

  const handleConfirmDelete = async () => {
    if (!deletingPerson) return;
    await onDeletePersonnel(deletingPerson.id);
    setDeletingPerson(null);
    showToast('ลบข้อมูลบุคลากรเรียบร้อย');
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const sourcePerson = personnel.find(p => p.id === draggedId);
    const targetPerson = personnel.find(p => p.id === targetId);

    if (!sourcePerson || !targetPerson) return;

    // Swap orderIndex & pair details
    const updated = personnel.map(p => {
      if (p.id === sourcePerson.id) {
        return {
          ...p,
          orderIndex: targetPerson.orderIndex,
          pairNo: targetPerson.pairNo,
          dutyPoint: targetPerson.dutyPoint,
          isInspector: targetPerson.isInspector,
          canDuty: targetPerson.canDuty
        };
      }
      if (p.id === targetPerson.id) {
        return {
          ...p,
          orderIndex: sourcePerson.orderIndex,
          pairNo: sourcePerson.pairNo,
          dutyPoint: sourcePerson.dutyPoint,
          isInspector: sourcePerson.isInspector,
          canDuty: sourcePerson.canDuty
        };
      }
      return p;
    });

    await onBatchUpdateGuards(updated);
    setDraggedId(null);
    showToast('สลับลำดับคิวและคู่เวรสำเร็จ (ซิงค์ Google Sheet แล้ว)');
  };

  return (
    <div className="space-y-6">
      
      {/* Control bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col gap-3">
          
          {/* Top row: Search & Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, ตำแหน่ง, สังกัด, คู่ที่..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white min-h-[44px]"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPrintPersonnelList}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">พิมพ์รายชื่อ A4</span>
                <span className="sm:hidden">พิมพ์ A4</span>
              </button>
              <button
                onClick={openAddModal}
                className="flex-1 sm:flex-initial bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
              >
                <UserPlus className="w-4 h-4 text-blue-300" />
                <span>เพิ่มบุคลากร</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {/* Filter Gender */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 min-h-[40px]"
            >
              <option value="">เพศ (ทั้งหมด)</option>
              <option value="M">ชาย</option>
              <option value="F">หญิง</option>
            </select>

            {/* Filter Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 min-h-[40px]"
            >
              <option value="">บทบาท (ทั้งหมด)</option>
              <option value="duty">เข้าเวร (ปฏิบัติงาน)</option>
              <option value="inspector">ผู้ตรวจเวร</option>
            </select>

            {/* Filter Point */}
            <select
              value={filterPoint}
              onChange={(e) => setFilterPoint(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 max-w-[180px] truncate min-h-[40px]"
            >
              <option value="">จุดประจำเวร (ทั้งหมด)</option>
              {Array.from(new Set(dutyPoints.map(p => p.name))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Rows Limit */}
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 min-h-[40px]"
            >
              <option value="all">แสดงทั้งหมด ({personnel.length})</option>
              <option value="10">10 แถว</option>
              <option value="20">20 แถว</option>
              <option value="50">50 แถว</option>
            </select>
          </div>

        </div>

        {/* Tip for Drag and Drop */}
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <Move className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>เคล็ดลับ: สามารถคลิกค้างที่แถวข้อมูลเพื่อ<strong>ลากและสลับคู่เวร / ลำดับคิว</strong> ระบบจะบันทึกซิงค์ Google Sheet อัตโนมัติ</span>
        </p>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 w-16 text-center">คู่ที่</th>
                <th className="p-3">ชื่อ-นามสกุล</th>
                <th className="p-3">ตำแหน่ง</th>
                <th className="p-3">สำนัก/กอง</th>
                <th className="p-3 text-center">เพศ</th>
                <th className="p-3">จุดประจำเวร</th>
                <th className="p-3 text-center">บทบาท</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length > 0 ? (
                paginatedList.map((p, idx) => {
                  const isDragging = draggedId === p.id;
                  const rowNumber = rowsPerPage === 'all' ? idx + 1 : (currentPage - 1) * parseInt(rowsPerPage, 10) + idx + 1;

                  return (
                    <tr
                      key={p.id}
                      draggable
                      onDragStart={() => handleDragStart(p.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(p.id)}
                      className={`hover:bg-blue-50/50 transition-colors cursor-grab active:cursor-grabbing ${
                        isDragging ? 'opacity-40 bg-blue-100' : ''
                      }`}
                    >
                      <td className="p-3 text-center text-slate-400 flex items-center justify-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                        {rowNumber}
                      </td>

                      <td className="p-3 text-center font-bold">
                        {p.isInspector ? (
                          <span className="text-slate-300">-</span>
                        ) : p.pairNo ? (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.gender === 'M'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-pink-100 text-pink-800 border border-pink-300'
                          }`}>
                            {p.pairNo}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-slate-900">
                        {p.fname} {p.lname}
                      </td>

                      <td className="p-3 text-slate-600">{p.position}</td>
                      <td className="p-3 text-slate-600">{p.dept}</td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.gender === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {p.gender === 'M' ? 'ชาย' : 'หญิง'}
                        </span>
                      </td>

                      <td className="p-3 font-medium text-slate-700">
                        {p.isInspector ? '-' : (p.dutyPoint || '-')}
                      </td>

                      <td className="p-3 text-center">
                        {p.isInspector ? (
                          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full text-[11px] border border-purple-200">
                            ผู้ตรวจเวร
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full text-[11px]">
                            เข้าเวร
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingPerson(p)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="ลบข้อมูล"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    ไม่พบข้อมูลบุคลากรที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {rowsPerPage !== 'all' && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              หน้า {currentPage} จาก {totalPages} (ทั้งหมด {filteredList.length} คน)
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-900" />
                เพิ่มข้อมูลบุคลากรจัดเวรยาม
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ชื่อ (รวมคำนำหน้า)</label>
                  <input
                    type="text"
                    required
                    value={formFname}
                    onChange={(e) => setFormFname(e.target.value)}
                    placeholder="เช่น นายสมชาย"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formLname}
                    onChange={(e) => setFormLname(e.target.value)}
                    placeholder="เช่น มุ่งมั่นสุข"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    required
                    value={formPos}
                    onChange={(e) => setFormPos(e.target.value)}
                    placeholder="เช่น เจ้าพนักงานธุรการ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">สำนัก / กอง</label>
                  <input
                    type="text"
                    required
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="เช่น สำนักปลัดเทศบาล"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">เพศ</label>
                  <select
                    value={formGender}
                    onChange={(e) => {
                      const g = e.target.value as Gender;
                      setFormGender(g);
                      setFormPairNo(calculateNextPairNo(g, formPoint));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="M">ชาย</option>
                    <option value="F">หญิง</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">บทบาทหน้าที่</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-blue-900"
                  >
                    <option value="duty">เข้าเวร (ปฏิบัติงาน)</option>
                    <option value="inspector">ผู้ตรวจเวร</option>
                  </select>
                </div>
              </div>

              {formRole === 'duty' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <div>
                    <label className="block text-blue-900 font-semibold mb-1">จุดประจำเวร</label>
                    <select
                      value={formPoint}
                      onChange={(e) => {
                        setFormPoint(e.target.value);
                        setFormPairNo(calculateNextPairNo(formGender, e.target.value));
                      }}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl"
                    >
                      {dutyPoints.filter(p => p.gender === formGender).map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-900 font-semibold mb-1">จัดอยู่คู่ที่ (ตัวเลข)</label>
                    <input
                      type="text"
                      value={formPairNo}
                      onChange={(e) => setFormPairNo(e.target.value)}
                      placeholder="เช่น 1"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>
              )}

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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-900" />
                แก้ไขข้อมูลบุคลากร
              </h3>
              <button onClick={() => setEditingPerson(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ชื่อ</label>
                  <input
                    type="text"
                    required
                    value={formFname}
                    onChange={(e) => setFormFname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formLname}
                    onChange={(e) => setFormLname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    required
                    value={formPos}
                    onChange={(e) => setFormPos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">สังกัด</label>
                  <input
                    type="text"
                    required
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">เพศ</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="M">ชาย</option>
                    <option value="F">หญิง</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">บทบาทหน้าที่</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="duty">เข้าเวร (ปฏิบัติงาน)</option>
                    <option value="inspector">ผู้ตรวจเวร</option>
                  </select>
                </div>
              </div>

              {formRole === 'duty' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <div>
                    <label className="block text-blue-900 font-semibold mb-1">จุดประจำเวร</label>
                    <select
                      value={formPoint}
                      onChange={(e) => setFormPoint(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl"
                    >
                      <option value="">-- ไม่ระบุ --</option>
                      {dutyPoints.filter(p => p.gender === formGender).map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-900 font-semibold mb-1">จัดอยู่คู่ที่ (ตัวเลข)</label>
                    <input
                      type="text"
                      value={formPairNo}
                      onChange={(e) => setFormPairNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-md"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPerson && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">ยืนยันการลบข้อมูล</h3>
              <p className="text-xs text-slate-500 mt-1">
                ต้องการลบ <strong>{deletingPerson.fname} {deletingPerson.lname}</strong> ออกจากระบบจัดเวรยามใช่หรือไม่?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingPerson(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
