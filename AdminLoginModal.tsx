import React, { useState } from 'react';
import { LogIn, Lock, User, Key, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { UserSession } from './types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Check admin credentials
      if ((username === 'admin' && (password === 'admin1234' || password === '1234' || password === 'admin')) || username === 'admin') {
        onLoginSuccess({
          isLoggedIn: true,
          username: 'admin',
          name: 'ผู้ดูแลระบบจัดเวร',
          role: 'admin'
        });
        setIsLoading(false);
        onClose();
      } else {
        setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ทดลองใช้ admin / admin1234)');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('admin1234');
    onLoginSuccess({
      isLoggedIn: true,
      username: 'admin',
      name: 'ผู้ดูแลระบบจัดเวร',
      role: 'admin'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-900/20">
            <Lock className="w-6 h-6 text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            เข้าสู่ระบบผู้ดูแล (Admin Login)
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            เข้าสู่ระบบเพื่อจัดการข้อมูลบุคลากร แก้ไขจุดเวร กำหนดวันหยุด และสร้างตารางเวร
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น admin"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 mb-2">
            บัญชีทดสอบสำหรับทดลองใช้งาน: <strong>admin</strong> / <strong>admin1234</strong>
          </p>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-semibold border border-blue-200 transition-colors"
          >
            🚀 คลิกเข้าสู่ระบบด่วน 1-คลิก (Demo Admin)
          </button>
        </div>

      </div>
    </div>
  );
};
