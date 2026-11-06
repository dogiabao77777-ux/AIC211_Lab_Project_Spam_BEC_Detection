import React, { useState } from 'react';
import { 
  Terminal, Play, BookOpen, AlertTriangle, 
  ChevronRight, Copy, Check, CheckCircle2 
} from 'lucide-react';
import { PIPELINE_STEPS_GUIDE, SHELL_COMMANDS_GUIDE } from '../data/runGuideData';

export const RunGuideView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentStep = PIPELINE_STEPS_GUIDE[activeStep];

  return (
    <div className="space-y-6">
      {/* Top Banner: Shell Command Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Cẩm Nang Hướng Dẫn Cách Chạy Chi Tiết (Full Execution Guide)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tài liệu hướng dẫn thực thi độc lập từ thiết lập môi trường, chạy 1 dòng lệnh đến kiểm thử từng bước Step 0 &rarr; Step 12
            </p>
          </div>
          <span className="text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded">
            Hỗ trợ: Python 3.10 - 3.12 • Jupyter • React Dev Server
          </span>
        </div>

        {/* Shell Commands Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHELL_COMMANDS_GUIDE.map((cmdGroup, idx) => {
            const codeBlock = cmdGroup.commands.join('\n');
            const isCopied = copiedIndex === idx;
            return (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cmdGroup.category}</span>
                  </span>
                  <button
                    onClick={() => handleCopy(codeBlock, idx)}
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-mono transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Đã copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800/80">
                  {codeBlock}
                </pre>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 13-Step Pipeline Flow Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Quy Trình 13 Bước Thực Thi Pipeline (Step-by-Step Breakdown)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Khớp chuẩn xác 100% giữa Notebook (AIC211_Lab_Project_Spam_BEC_Detection.ipynb) và Script (lab_project_aic.py)
          </p>
        </div>

        {/* Step Selector Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-mono">
          {PIPELINE_STEPS_GUIDE.map((step) => {
            const isActive = activeStep === step.stepNumber;
            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStep(step.stepNumber)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all font-semibold ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Step {step.stepNumber}
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Viewer */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                BƯỚC {currentStep.stepNumber} / 12
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {currentStep.title}
              </h4>
            </div>
            <button
              onClick={() => handleCopy(currentStep.codeSnippet, 999)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 w-fit transition-all"
            >
              {copiedIndex === 999 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã copy code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Python Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Snippet Box */}
          <pre className="p-3.5 bg-slate-900/90 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800/80">
            {currentStep.codeSnippet}
          </pre>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mục đích & Đầu vào/Đầu ra (I/O Contract):</span>
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">{currentStep.purpose}</p>
              <div className="pt-1.5 text-[10px] font-mono text-slate-500 space-y-0.5">
                <div>• Input: {currentStep.inputs}</div>
                <div>• Output: {currentStep.outputs}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ý nghĩa Bảo mật & Nghiên cứu Khoa học:</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {currentStep.securityImpact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting & Edge Cases FAQ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Giải Quyết Sự Cố Thường Gặp Khi Thực Thi (Troubleshooting & FAQs)</span>
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300 text-sm">
              Lỗi 1: Không tải được file `enron_spam_data.csv` do mạng chặn kết nối GitHub?
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              *Khắc phục:* Nếu lệnh tải tự động gặp lỗi timeout, bạn có thể tải thủ công file ZIP từ repository `MWiechmann/enron_spam_data`, giải nén và đặt trực tiếp file `enron_spam_data.csv` vào thư mục `datasets/`. Script sẽ tự động nhận diện file local mà không cần tải lại.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300 text-sm">
              Lỗi 2: Tràn bộ nhớ (MemoryError) khi sinh 50,000 đặc trưng TF-IDF trên máy tính cấu hình thấp?
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              *Khắc phục:* Scikit-learn mặc định lưu trữ ma trận TF-IDF dưới dạng Scipy CSR Matrix (Compressed Sparse Row), chiếm chưa tới 60 MB RAM. Tuy nhiên, nếu bạn gọi lệnh `.toarray()` hoặc `.todense()`, ma trận 50,000 chiều sẽ phình to lên nhiều Gigabytes! Tuyệt đối giữ nguyên dạng ma trận thưa (sparse) khi truyền vào `fit` của Logistic Regression.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300 text-sm">
              Lỗi 3: Kết quả số lượng FP/FN có thể bị lệch nếu chạy lại trên máy khác?
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              *Khắc phục:* Toàn bộ code của đồ án đã được ghim chặt chẽ hạt giống giả ngẫu nhiên `random_state=42` ở các hàm `train_test_split`, `LogisticRegression`, `RandomForestClassifier` và `np.random.seed(42)`. Đảm bảo kết quả kiểm thử trên 6,028 email test luôn luôn tái lập 100% khớp từng con số.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
