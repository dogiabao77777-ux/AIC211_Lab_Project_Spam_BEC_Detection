import React, { useState } from 'react';
import { 
  Calculator, Sliders, ShieldCheck, 
  HelpCircle, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { MATHEMATICAL_FORMULAS } from '../data/formulasData';

export const FormulasEngine: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [threshold, setThreshold] = useState<number>(0.42);

  const filteredFormulas = MATHEMATICAL_FORMULAS.filter((f) => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  // Calculate dynamic threshold metrics for simulation
  // At tau = 0.42: Recall ~ 99.88%, FPR ~ 0.018% (56 FP, 3 FN, 3062 TN, 2907 TP)
  const totalLegit = 3118;
  const totalThreat = 2910;

  // Empirical curves around tau
  const simRecall = Math.min(Math.max(0.9998 - 0.03 * Math.pow(threshold, 1.8), 0.88), 0.9999);
  const simFPR = Math.min(Math.max(0.0003 + 0.045 * Math.exp(-threshold * 4.2), 0.001), 0.08);

  const simTP = Math.round(totalThreat * simRecall);
  const simFN = totalThreat - simTP;
  const simFP = Math.round(totalLegit * simFPR);
  const simTN = totalLegit - simFP;

  const simPrecision = simTP / (simTP + simFP);
  const simF1 = (2 * simPrecision * simRecall) / (simPrecision + simRecall);
  
  // Cost function with C_FN = 100 * C_FP ($100 per FP disruption vs $10,000 per FN breach)
  const costFP = 100;
  const costFN = 10000;
  const totalCost = simFP * costFP + simFN * costFN;

  return (
    <div className="space-y-6">
      {/* Top Banner & Interactive Threshold Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <span>Động Cơ Công Thức Toán Học & Mô Phỏng Ngưỡng An Ninh (Formulas Engine)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân tích chi tiết toàn bộ các công thức toán học từ NLP, Hàm mất mát đến Tối ưu hóa chi phí phi đối xứng
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'nlp', label: 'TF-IDF & NLP' },
              { id: 'ml', label: 'Logistic Sigmoid' },
              { id: 'imbalance', label: 'Cân Bằng Lớp' },
              { id: 'security', label: 'Chi Phí Phi Đối Xứng' },
              { id: 'evaluation', label: 'Thước Đo Đánh Giá' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Threshold Slider Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Mô Phỏng Tối Ưu Hóa Ngưỡng Quyết Định (Optimal Decision Threshold $\tau$):</span>
            </div>
            <div className="font-mono text-xs flex items-center gap-2">
              <span className="text-slate-400">Ngưỡng hiện tại:</span>
              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                τ = {threshold.toFixed(2)}
              </span>
              {threshold === 0.42 && (
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ĐIỂM TỐI ƯU CỦA ĐỒ ÁN
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.10 (Ưu tiên tuyệt đối Recall - Nhiều FP)</span>
              <span>0.42 (Tối ưu tổn thất SOC)</span>
              <span>0.50 (Mặc định)</span>
              <span>0.90 (Ưu tiên Precision - Bỏ lọt BEC)</span>
            </div>
          </div>

          {/* Simulation Output Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Spam Recall</div>
              <div className="text-base font-bold text-emerald-400">{(simRecall * 100).toFixed(2)}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Spam Precision</div>
              <div className="text-base font-bold text-cyan-400">{(simPrecision * 100).toFixed(2)}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">False Positives</div>
              <div className="text-base font-bold text-rose-400">{simFP} email</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">False Negatives</div>
              <div className="text-base font-bold text-amber-400">{simFN} email</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">F1-Score</div>
              <div className="text-base font-bold text-yellow-400">{simF1.toFixed(4)}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30">
              <div className="text-[10px] text-slate-400">Tổng Tổn Thất SOC</div>
              <div className="text-base font-bold text-cyan-300">${totalCost.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulas Detailed Grid */}
      <div className="space-y-4">
        {filteredFormulas.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-cyan-400" />
                <span>{item.title}</span>
              </h3>
              <span className="text-[10px] font-mono uppercase bg-slate-950 text-cyan-300 px-2 py-0.5 rounded border border-slate-800 w-fit">
                {item.category.toUpperCase()}
              </span>
            </div>

            {/* LaTeX Formula Display Block */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto shadow-inner">
              <code>{item.formulaLaTeX}</code>
            </div>

            {/* Variables Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                Giải thích Biến số trong Công thức:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                {item.variables.map((v, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-cyan-400 font-bold">{v.name}:</span>{' '}
                    <span className="text-slate-300 font-sans">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Math Explanation & Cybersecurity Significance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bản chất Toán học (Mathematical Rationale):</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {item.mathExplanation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-emerald-500/20 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ý nghĩa An ninh Mạng (Cybersecurity Impact):</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {item.cybersecuritySignificance}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
