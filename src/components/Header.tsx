import React from 'react';
import { ShieldCheck, Download, Archive } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onDownloadReport }) => {
  const navItems = [
    { id: 'inspector', label: '1. Threat Inspector' },
    { id: 'dataset', label: '2. Dataset & Quarantine' },
    { id: 'analytics', label: '3. Model Analytics & XAI' },
    { id: 'formulas', label: '4. Mathematical Formulas' },
    { id: 'runguide', label: '5. Run Guide & Pipeline' },
    { id: 'report', label: '6. AIC211 Report Revamp' },
    { id: 'rubric', label: '7. Rubric & Oral Defense' }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Warning Banner / Live Status */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-mono text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
            VANGUARD SEG DEFENSE GATEWAY
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            AIC211 AI for Cybersecurity Capstone • Class-Balanced ML & XAI
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="hidden md:inline text-emerald-400">Spam Recall: 99.88%</span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="text-cyan-300">FPR: 0.018%</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Latency: 14.2ms</span>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand), Zone 2 (Nav Links), Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Zone 1: Single element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
                VANGUARD SEG
              </span>
              <span className="bg-cyan-500/15 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 font-semibold">
                v4.2 AIC211
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-none">
              AI Email Spam & BEC Defense Architecture
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/project_source_code.zip"
            download="project_source_code.zip"
            className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/30"
            title="Tải toàn bộ mã nguồn dự án định dạng .ZIP đầy đủ để đẩy lên GitHub"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Tải Code .ZIP</span>
          </a>
          <a
            href="/AI_Powered_Email_Spam_and_BEC_Detection_Paper.pdf"
            download="AI_Powered_Email_Spam_and_BEC_Detection_Paper.pdf"
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-rose-900/30"
            title="Tải về file PDF Camera-Ready IEEE Paper định dạng chuẩn A4 (5 trang hoàn chỉnh)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Paper .PDF</span>
          </a>
          <button
            onClick={onDownloadReport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
            title="Tải về bản Báo cáo Đồ án hoàn chỉnh định dạng Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Report .MD</span>
          </button>
        </div>
      </div>
    </header>
  );
};
