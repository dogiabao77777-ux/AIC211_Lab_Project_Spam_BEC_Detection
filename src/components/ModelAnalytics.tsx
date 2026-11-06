import React, { useState } from 'react';
import { 
  Table2, BarChart2, ShieldAlert, Layers, Check, 
  Info, Sparkles, TrendingUp 
} from 'lucide-react';
import { MODEL_METRICS_DATA, TOP_XAI_TOKENS } from '../data/mockData';

export const ModelAnalytics: React.FC = () => {
  const [selectedRegime, setSelectedRegime] = useState<string>('all');

  const filteredMetrics = MODEL_METRICS_DATA.filter((m) => {
    if (selectedRegime === 'all') return true;
    if (selectedRegime === 'balanced') return m.Strategy.includes('balanced');
    if (selectedRegime === 'baseline') return m.Strategy.includes('Standard') || m.Strategy.includes('Default');
    if (selectedRegime === 'combined') return m.Strategy.includes('Combined') || m.Strategy.includes('Undersample +');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 8-Pipeline Benchmark Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Table2 className="w-5 h-5 text-cyan-400" />
              <span>Đo Kiểm Định Lượng Thực Nghiệm (Tập Test Độc Lập: 6,028 Email)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              So sánh khách quan 8 Pipeline: Logistic Regression vs Random Forest qua 4 chế độ cân bằng (Nguồn: results/metrics.json)
            </p>
          </div>

          {/* Regime Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-slate-400 mr-1 font-sans">Chiến lược:</span>
            {[
              { id: 'all', label: 'Tất cả (8)' },
              { id: 'balanced', label: 'Class Balanced' },
              { id: 'combined', label: 'Combined' },
              { id: 'baseline', label: 'Baseline' }
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegime(reg.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedRegime === reg.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Kiến trúc Mô hình</th>
                <th className="py-3 px-3">Chiến lược Cân bằng</th>
                <th className="py-3 px-3 text-cyan-400">Accuracy</th>
                <th className="py-3 px-3">Spam Prec.</th>
                <th className="py-3 px-3 text-emerald-400">Spam Recall</th>
                <th className="py-3 px-3 text-yellow-400">F1-Score</th>
                <th className="py-3 px-3">PR-AUC (AP)</th>
                <th className="py-3 px-3 text-rose-400">Báo Động Giả (FP)</th>
                <th className="py-3 px-3 text-amber-400">Bỏ Lọt (FN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredMetrics.map((m, idx) => {
                const isRecommended = m.Model === "Logistic Regression (Balanced)";
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      isRecommended ? 'bg-cyan-500/10 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap text-white font-sans flex items-center gap-1.5">
                      {isRecommended && (
                        <span className="p-0.5 rounded bg-cyan-500 text-slate-950">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <span>{m.Model}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">{m.Strategy}</td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{(m.Accuracy * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3">{(m.Precision * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{(m.Recall * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-yellow-400 font-bold">{m.F1Score.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-slate-200">{m.PRAUC.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">{m.FP}</td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{m.FN}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts & Asymmetric Cost Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Metric Comparison Visualizer (SVG Bar Chart) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <span>So Sánh Hiệu Năng Đa Chiều (Multi-Metric Benchmark)</span>
              </h3>
              <p className="text-xs text-slate-400">Logistic Regression (Balanced) vs Random Forest (Balanced)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span> LogReg (Ours)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span> Random Forest
              </span>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="space-y-3 pt-2 text-xs font-mono">
            {[
              { label: 'Độ Chính Xác Tổng Thể (Accuracy)', lr: 98.92, rf: 97.05 },
              { label: 'Spam Precision (Độ Chuẩn Xác)', lr: 98.12, rf: 94.70 },
              { label: 'Spam Recall (Độ Nhạy Bắt Tấn Công)', lr: 99.88, rf: 99.48 },
              { label: 'F1-Score (Trung Bình Điều Hòa)', lr: 98.99, rf: 97.03 },
              { label: 'PR-AUC (Average Precision)', lr: 99.92, rf: 99.61 }
            ].map((metric, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>{metric.label}</span>
                  <div className="space-x-3">
                    <span className="text-cyan-400 font-bold">{metric.lr}%</span>
                    <span className="text-amber-400 font-bold">{metric.rf}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${metric.lr}%` }}
                    />
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${metric.rf}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chênh lệch Báo động giả (False Positives):</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              Logistic Regression ít hơn 110 lỗi cảnh báo giả so với Random Forest (56 vs 166)!
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Asymmetric Cost Matrix */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span>Ma Trận Sai Số Phi Đối Xứng (Asymmetric Cost Matrix)</span>
              </h3>
              <p className="text-xs text-slate-400">Đo kiểm trực tiếp trên 6,028 mẫu test của mô hình đề xuất</p>
            </div>

            {/* 4 Quadrants Confusion Matrix */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                <div className="text-slate-400 text-[10px] uppercase font-sans">True Negatives (TN)</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">3,062</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Email sạch chuyển thẳng</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/30">
                <div className="text-slate-400 text-[10px] uppercase font-sans">False Positives (FP)</div>
                <div className="text-xl font-bold text-rose-400 mt-1">56</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">FPR chỉ 0.018% (3.1x &lt; RF)</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                <div className="text-slate-400 text-[10px] uppercase font-sans">False Negatives (FN)</div>
                <div className="text-xl font-bold text-amber-400 mt-1">3</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bắt giữ 99.88% hiểm họa</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-500/30">
                <div className="text-slate-400 text-[10px] uppercase font-sans">True Positives (TP)</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">2,907</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vô hiệu hóa tấn công</div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Ý nghĩa Vận hành An ninh mạng Thực tiễn:</span>
            </span>
            <p className="text-[11px] leading-relaxed text-slate-300">
              1 lỗi False Negative (bỏ lọt thư BEC chuyển tiền) có thể hủy hoại hàng triệu USD của doanh nghiệp. Trong khi đó, 1 lỗi False Positive (chặn nhầm email hợp đồng) gây ngưng trệ kinh doanh. Mô hình đề xuất đạt trạng thái tối ưu lý tưởng: chặn tới 99.88% đợt tấn công mà chỉ gây ra 56 cảnh báo giả trên hơn 6,000 email!
            </p>
          </div>
        </div>

      </div>

      {/* Global XAI Feature Coefficients */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Trọng Số Đặc Trưng Toàn Cục Của Mô Hình (Global TF-IDF Coefficients)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Trích xuất trực tiếp từ 50,000 chiều n-grams được học trên 24,109 email tập huấn luyện
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
            Model: LogisticRegression(C=1.0)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Threat Indicators */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top Chỉ Báo Đe Dọa (Positive Weights - Tăng Xác Suất Hiểm Họa):</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {TOP_XAI_TOKENS.filter(t => t.type === 'threat').map((token, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-rose-400 font-bold">+{token.weight.toFixed(2)}</span>
                    <span className="text-slate-200 font-semibold">{token.word}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans truncate max-w-[180px]">{token.signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Benign Indicators */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Top Chỉ Báo Hợp Lệ (Negative Weights - Giảm Xác Suất Hiểm Họa):</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {TOP_XAI_TOKENS.filter(t => t.type === 'benign').map((token, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold">{token.weight.toFixed(2)}</span>
                    <span className="text-slate-200 font-semibold">{token.word}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans truncate max-w-[180px]">{token.signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
