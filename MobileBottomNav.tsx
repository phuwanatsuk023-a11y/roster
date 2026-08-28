import React from 'react';
import { 
  CalendarCheck, 
  ClipboardList, 
  Clock, 
  ShieldCheck, 
  LayoutDashboard, 
  LogIn,
  User,
  Users
} from 'lucide-react';
import { UserSession } from './types';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  session: UserSession;
  onOpenLogin: () => void;
  activeDutySubTab?: string;
  onSelectDutySubTab?: (subTab: 'search' | 'today' | 'inspectors') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  session,
  onOpenLogin,
  activeDutySubTab,
  onSelectDutySubTab
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] print:hidden pb-[max(0px,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-4 items-center h-16 px-1">
        
        {/* Tab 1: Check Duty (Search) */}
        <button
          onClick={() => {
            onSelectTab('duty-check');
            if (onSelectDutySubTab) onSelectDutySubTab('search');
          }}
          className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all ${
            currentTab === 'duty-check' && (!activeDutySubTab || activeDutySubTab === 'search')
              ? 'text-blue-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <CalendarCheck className={`w-5 h-5 ${
              currentTab === 'duty-check' && (!activeDutySubTab || activeDutySubTab === 'search')
                ? 'text-blue-900 scale-110' 
                : 'text-slate-500'
            } transition-transform`} />
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
            ค้นหาเวร
          </span>
        </button>

        {/* Tab 2: Today's Duty */}
        <button
          onClick={() => {
            onSelectTab('duty-check');
            if (onSelectDutySubTab) onSelectDutySubTab('today');
          }}
          className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all ${
            currentTab === 'duty-check' && activeDutySubTab === 'today'
              ? 'text-blue-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Clock className={`w-5 h-5 ${
              currentTab === 'duty-check' && activeDutySubTab === 'today'
                ? 'text-blue-900 scale-110' 
                : 'text-slate-500'
            } transition-transform`} />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
            เวรวันนี้
          </span>
        </button>

        {/* Tab 3: Monthly Roster */}
        <button
          onClick={() => onSelectTab('public-roster')}
          className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all ${
            currentTab === 'public-roster'
              ? 'text-blue-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className={`w-5 h-5 ${
            currentTab === 'public-roster' ? 'text-blue-900 scale-110' : 'text-slate-500'
          } transition-transform`} />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
            ตารางเวร
          </span>
        </button>

        {/* Tab 4: Admin / User Profile */}
        {session.isLoggedIn ? (
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all ${
              currentTab === 'dashboard' || currentTab === 'personnel' || currentTab === 'duty-points' || currentTab === 'holidays' || currentTab === 'roster-gen'
                ? 'text-blue-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`w-5 h-5 ${
                currentTab === 'dashboard' ? 'text-blue-900 scale-110' : 'text-slate-500'
              } transition-transform`} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
              แดชบอร์ด
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex flex-col items-center justify-center h-full py-1 px-1 text-slate-500 hover:text-blue-900 transition-all"
          >
            <LogIn className="w-5 h-5 text-slate-500" />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
              ผู้ดูแล
            </span>
          </button>
        )}

      </div>
    </nav>
  );
};
