import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  ListOrdered,
  RotateCcw
} from 'lucide-react';
import { SheetService } from './sheetService';
import { APPS_SCRIPT_CODE_SAMPLE } from './initialData';

interface GoogleSheetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: (url: string) => void;
  onResetData: () => void;
  showToast: (msg: string) => void;
}

export const GoogleSheetSetupModal: React.FC<GoogleSheetSetupModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
  onResetData,
  showToast
}) => {
  const [urlInput, setUrlInput] = useState<string>(SheetService.getAppsScriptUrl());
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'url' | 'code' | 'guide'>('url');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_SAMPLE);
    setCopied(true);
    showToast('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    SheetService.setAppsScriptUrl(urlInput);
    onUrlUpdated(urlInput);
    showToast('บันทึกการตั้งค่า Web App URL เรียบร้อย');
    onClose();
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: 'กรุณากรอก Web App URL ก่อนทดสอบ' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await SheetService.testConnection(urlInput.trim());
    setTestResult(res);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              ตั้งค่าฐานข้อมูล Google Sheets (Apps Script API)
            </h2>
            <p className="text-xs text-slate-500">
              เชื่อมโยงระบบเข้ากับ Google Sheets เพื่อจัดเก็บบุคลากรและตารางเวรแบบ Real-time
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'url' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500'
            }`}
          >
            ตั้งค่า URL & ทดสอบ
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'code' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500'
            }`}
          >
            โค้ด Google Apps Script
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'guide' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500'
            }`}
          >
            ขั้นตอนการเชื่อมต่อ (How to)
          </button>
        </div>

        {/* TAB 1: URL & Test */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Google Apps Script Web App URL
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                * ต้องเป็น URL ที่ได้จากการ Deploy เป็น Web app และตั้งค่า "Who has access" เป็น "Anyone"
              </p>
            </div>

            {/* Test Connection Button & Result */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ (Test Connection)'}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs border flex items-start gap-2 ${
                testResult.success 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                    onResetData();
                  }
                }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ตข้อมูลตัวอย่าง
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Apps Script Code */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-700" />
                โค้ด Code.gs สำหรับวางใน Google Apps Script Editor:
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 text-[11px] rounded-2xl max-h-72 overflow-y-auto font-mono leading-relaxed select-all">
              {APPS_SCRIPT_CODE_SAMPLE}
            </pre>
          </div>
        )}

        {/* TAB 3: Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-emerald-700" />
              วิธีติดตั้ง Google Apps Script เชื่อมต่อ Sheet ใน 4 ขั้นตอน:
            </h4>
            
            <ol className="list-decimal pl-5 space-y-2 text-xs leading-relaxed">
              <li>
                สร้าง Google Sheets ใหม่ขึ้นมา 1 ไฟล์ (เช่น ตั้งชื่อว่า "ระบบจัดเวรยาม เทศบาลเมืองวารินชำราบ")
              </li>
              <li>
                ไปที่เมนูด้านบนของ Google Sheets: <strong>Extensions (ส่วนขยาย) &gt; Apps Script</strong>
              </li>
              <li>
                ลบโค้ดเดิมในไฟล์ <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-800">Code.gs</code> แล้ววางโค้ดจากแท็บ <strong>"โค้ด Google Apps Script"</strong> ลงไปแทน จากนั้นกดปุ่ม Save (💾)
              </li>
              <li>
                กดปุ่ม <strong>Deploy (ทำให้ใช้งานได้) &gt; New deployment (การทำให้ใช้งานได้ใหม่)</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                  <li>เลือกประเภท: <strong>Web app</strong></li>
                  <li>Execute as: <strong>Me (ฉัน)</strong></li>
                  <li>Who has access: <strong>Anyone (ทุกคน)</strong></li>
                </ul>
              </li>
              <li>
                คัดลอก <strong>Web app URL</strong> ที่ได้มา วางลงในช่อง URL ในหน้านี้ แล้วกด <strong>"บันทึกการตั้งค่า"</strong>
              </li>
            </ol>
          </div>
        )}

      </div>
    </div>
  );
};
