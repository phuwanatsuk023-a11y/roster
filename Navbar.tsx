import React from 'react';
import { 
  Shield, 
  LogIn, 
  LogOut, 
  FileSpreadsheet, 
  CalendarCheck, 
  ClipboardList, 
  LayoutDashboard, 
  Users, 
  MapPin, 
  CalendarOff, 
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserSession, SyncStatus } from './types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  session: UserSession;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSheetConfig: () => void;
  syncStatus: SyncStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  session,
  onOpenLogin,
  onLogout,
  onOpenSheetConfig,
  syncStatus
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const publicTabs = [
    { id: 'duty-check', label: 'ตรวจสอบเวรของฉัน', icon: CalendarCheck },
    { id: 'public-roster', label: 'ตารางเวรประจำเดือน', icon: ClipboardList }
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'แดชบอร์ดสถิติ', icon: LayoutDashboard },
    { id: 'personnel', label: 'จัดการบุคลากร', icon: Users },
    { id: 'duty-points', label: 'จุดประจำเวร', icon: MapPin },
    { id: 'holidays', label: 'วันหยุดราชการ', icon: CalendarOff },
    { id: 'roster-gen', label: 'สร้างตารางเวร', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Org Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md font-bold text-lg">
              <Shield className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  ระบบจัดเวรยามออนไลน์
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  เทศบาลเมืองวารินชำราบ
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ฐานข้อมูล Google Sheets Real-time ผ่าน Apps Script
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Public Links */}
            {publicTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-btn-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}

            {/* Admin Only Links */}
            {session.isLoggedIn && (
              <>
                <div className="h-5 w-px bg-slate-200 mx-1" />
                {adminTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`nav-btn-${tab.id}`}
                      onClick={() => onSelectTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-900 text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Google Sheet Sync Status Button */}
            <button
              id="btn-sheet-config"
              onClick={onOpenSheetConfig}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                syncStatus.isConnectedToSheet
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="ตั้งค่าเชื่อมต่อ Google Sheet API"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {syncStatus.isConnectedToSheet ? 'Sheet: เชื่อมต่อแล้ว' : 'Sheet: โหมดทดสอบ'}
              </span>
              {syncStatus.isConnectedToSheet ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Login / User Status */}
            {session.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {session.name}
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">
                    ผู้ดูแลระบบ (Admin)
                  </span>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออก</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-open-login"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-300" />
                <span>เข้าสู่ระบบเจ้าหน้าที่</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            บริการสำหรับเจ้าหน้าที่ (ไม่ต้อง Login)
          </p>
          {publicTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                {tab.label}
              </button>
            );
          })}

          {session.isLoggedIn ? (
            <>
              <div className="my-2 border-t border-slate-200" />
              <p className="px-3 py-1 text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                เมนูผู้ดูแลระบบ (Admin Only)
              </p>
              {adminTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-blue-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </>
          ) : (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-900 text-white py-2 rounded-lg text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบผู้ดูแลเพื่อจัดการข้อมูล
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
