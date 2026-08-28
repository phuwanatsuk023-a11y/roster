import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { PublicDutyCheck } from './PublicDutyCheck';
import { PublicRosterView } from './PublicRosterView';
import { AdminDashboard } from './AdminDashboard';
import { PersonnelManagement } from './PersonnelManagement';
import { DutyPointsManagement } from './DutyPointsManagement';
import { HolidaysManagement } from './HolidaysManagement';
import { RosterGenerator } from './RosterGenerator';
import { AdminLoginModal } from './AdminLoginModal';
import { GoogleSheetSetupModal } from './GoogleSheetSetupModal';
import { PrintPersonnelListModal } from './PrintPersonnelListModal';
import { SheetService } from './sheetService';
import { Personnel, DutyPoint, Holiday, SavedRoster, UserSession, SyncStatus, Gender, RosterDayEntry } from './types';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // State
  const [currentTab, setCurrentTab] = useState<string>('duty-check');
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    username: '',
    name: 'ผู้เข้าชมทั่วไป',
    role: 'guest'
  });

  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [dutyPoints, setDutyPoints] = useState<DutyPoint[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>([]);
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnectedToSheet: SheetService.isConnected(),
    sheetUrl: SheetService.getAppsScriptUrl(),
    lastSyncedAt: null,
    isSyncing: false
  });

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState(false);
  const [isPrintPersonnelOpen, setIsPrintPersonnelOpen] = useState(false);

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(prev => prev === msg ? null : prev);
    }, 3500);
  };

  // Initial Data Load
  const loadAllData = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const [pList, dpList, hList, rList] = await Promise.all([
        SheetService.getPersonnel(),
        SheetService.getDutyPoints(),
        SheetService.getHolidays(),
        SheetService.getSavedRosters()
      ]);

      setPersonnel(pList);
      setDutyPoints(dpList);
      setHolidays(hList);
      setSavedRosters(rList);

      setSyncStatus({
        isConnectedToSheet: SheetService.isConnected(),
        sheetUrl: SheetService.getAppsScriptUrl(),
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false
      });
    } catch (err: any) {
      console.error('Data load error:', err);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Data Mutations
  const handleAddPersonnel = async (person: Omit<Personnel, 'id'>) => {
    await SheetService.addPersonnel(person);
    await loadAllData();
  };

  const handleUpdatePersonnel = async (person: Personnel) => {
    await SheetService.updatePersonnel(person);
    await loadAllData();
  };

  const handleDeletePersonnel = async (id: string) => {
    await SheetService.deletePersonnel(id);
    await loadAllData();
  };

  const handleBatchUpdateGuards = async (guards: Personnel[]) => {
    await SheetService.batchUpdateGuards(guards);
    await loadAllData();
  };

  const handleAddDutyPoint = async (name: string, gender: Gender) => {
    await SheetService.addDutyPoint(name, gender);
    await loadAllData();
  };

  const handleDeleteDutyPoint = async (id: string | number) => {
    await SheetService.deleteDutyPoint(id);
    await loadAllData();
  };

  const handleAddHoliday = async (date: string, name: string, type: 'official' | 'special') => {
    await SheetService.addHoliday(date, name, type);
    await loadAllData();
  };

  const handleDeleteHoliday = async (id: string | number) => {
    await SheetService.deleteHoliday(id);
    await loadAllData();
  };

  const handleSaveRoster = async (month: number, year: number, gender: Gender, schedule: RosterDayEntry[]) => {
    await SheetService.saveRoster(month, year, gender, schedule);
    await loadAllData();
  };

  const handleResetData = () => {
    SheetService.resetToDemoData();
    loadAllData();
    showToast('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
  };

  const handleLoginSuccess = (user: UserSession) => {
    setSession(user);
    setCurrentTab('dashboard'); // Jump to admin dashboard
    showToast(`ยินดีต้อนรับ ${user.name} เข้าสู่ระบบ`);
  };

  const handleLogout = () => {
    setSession({
      isLoggedIn: false,
      username: '',
      name: 'ผู้เข้าชมทั่วไป',
      role: 'guest'
    });
    setCurrentTab('duty-check');
    showToast('ออกจากระบบเรียบร้อย');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        session={session}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
        syncStatus={syncStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PUBLIC TAB 1: Check Duty (No Login Required) */}
        {currentTab === 'duty-check' && (
          <PublicDutyCheck
            personnel={personnel}
            dutyPoints={dutyPoints}
            holidays={holidays}
            savedRosters={savedRosters}
            onOpenRosterView={(m, y, g) => {
              setCurrentTab('public-roster');
            }}
            onPrintPersonnelList={() => setIsPrintPersonnelOpen(true)}
          />
        )}

        {/* PUBLIC TAB 2: Full Monthly Roster & Printable Command */}
        {currentTab === 'public-roster' && (
          <PublicRosterView
            personnel={personnel}
            dutyPoints={dutyPoints}
            holidays={holidays}
            savedRosters={savedRosters}
          />
        )}

        {/* ADMIN TABS (Protected: only visible or accessible when logged in) */}
        {session.isLoggedIn && (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard
                personnel={personnel}
                dutyPoints={dutyPoints}
                holidays={holidays}
                syncStatus={syncStatus}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
                onOpenAddPersonnel={() => setCurrentTab('personnel')}
              />
            )}

            {currentTab === 'personnel' && (
              <PersonnelManagement
                personnel={personnel}
                dutyPoints={dutyPoints}
                onAddPersonnel={handleAddPersonnel}
                onUpdatePersonnel={handleUpdatePersonnel}
                onDeletePersonnel={handleDeletePersonnel}
                onBatchUpdateGuards={handleBatchUpdateGuards}
                onPrintPersonnelList={() => setIsPrintPersonnelOpen(true)}
                showToast={showToast}
              />
            )}

            {currentTab === 'duty-points' && (
              <DutyPointsManagement
                dutyPoints={dutyPoints}
                personnel={personnel}
                onAddDutyPoint={handleAddDutyPoint}
                onDeleteDutyPoint={handleDeleteDutyPoint}
                showToast={showToast}
              />
            )}

            {currentTab === 'holidays' && (
              <HolidaysManagement
                holidays={holidays}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                showToast={showToast}
              />
            )}

            {currentTab === 'roster-gen' && (
              <RosterGenerator
                personnel={personnel}
                dutyPoints={dutyPoints}
                holidays={holidays}
                onSaveRoster={handleSaveRoster}
                showToast={showToast}
                onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>ระบบจัดเวรยามและตรวจสอบตารางเวรออนไลน์</strong> &bull; เทศบาลเมืองวารินชำราบ
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ฐานข้อมูล Google Sheets Real-time</span>
            <button
              onClick={() => setIsSheetConfigOpen(true)}
              className="text-blue-700 hover:underline font-semibold"
            >
              ตั้งค่า Apps Script
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <GoogleSheetSetupModal
        isOpen={isSheetConfigOpen}
        onClose={() => setIsSheetConfigOpen(false)}
        onUrlUpdated={(url) => {
          setSyncStatus(prev => ({
            ...prev,
            isConnectedToSheet: Boolean(url && url.startsWith('https://script.google.com/')),
            sheetUrl: url
          }));
          loadAllData();
        }}
        onResetData={handleResetData}
        showToast={showToast}
      />

      <PrintPersonnelListModal
        isOpen={isPrintPersonnelOpen}
        onClose={() => setIsPrintPersonnelOpen(false)}
        personnel={personnel}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce print:hidden">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

    </div>
  );
}
