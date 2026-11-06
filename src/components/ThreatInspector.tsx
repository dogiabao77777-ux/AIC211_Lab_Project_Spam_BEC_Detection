import React, { useState, useEffect } from 'react';
import { 
  Scan, RotateCcw, PlusCircle, AlertCircle, 
  CheckCircle2, Sliders, Binary, Command, Cpu 
} from 'lucide-react';
import { VOCABULARY_WEIGHTS } from '../data/mockData';
import { EmailRecord, EmailCategory, GatewayStatus } from '../types';

interface ThreatInspectorProps {
  onAddEmailToDataset: (email: EmailRecord) => void;
}

export const ThreatInspector: React.FC<ThreatInspectorProps> = ({ onAddEmailToDataset }) => {
  const scenarios = {
    bec: "URGENT CONFIDENTIAL REQUEST: Executive Wire Transfer required before EOD ($85,000). Please process immediately to foreign vendor account for project acquisition. Do not discuss over phone as meeting is in progress.",
    phishing: "CRITICAL ACCOUNT SUSPENSION NOTICE: Your Microsoft 365 password expires today. Click here http://outlook-login-portal-verify.com to confirm your password credentials immediately to prevent email disruption.",
    spam: "LIMITED TIME EXCLUSIVE PROMO OFFER! Get 70% discount on all software licenses today only! Click http://cheap-deals-online.net to claim your free voucher now!",
    ham: "Hi Team, attached is the revised Q3 Financial Forecast report. The strategy review meeting is scheduled for tomorrow at 2:00 PM on Teams. Please let me know if you have questions."
  };

  const [inputContent, setInputContent] = useState<string>(scenarios.bec);
  const [riskPercent, setRiskPercent] = useState<number>(98);
  const [positiveTokens, setPositiveTokens] = useState<{ word: string; weight: number }[]>([]);
  const [negativeTokens, setNegativeTokens] = useState<{ word: string; weight: number }[]>([]);
  const [metrics, setMetrics] = useState({
    urgency: 92,
    financial: 95,
    cred: 20,
    benign: 10
  });
  const [lastScanTime, setLastScanTime] = useState<string>('Vừa quét lúc khởi tạo');

  const runAnalysis = (textToAnalyze?: string) => {
    const text = (textToAnalyze !== undefined ? textToAnalyze : inputContent).trim();
    if (!text) {
      setRiskPercent(0);
      setPositiveTokens([]);
      setNegativeTokens([]);
      setMetrics({ urgency: 0, financial: 0, cred: 0, benign: 0 });
      return;
    }

    const words = text.toLowerCase().match(/\b[a-z0-9_$-]+\b|https?:\/\/\S+/g) || [];
    let rawScore = 0;
    const matchedPositives: { word: string; weight: number }[] = [];
    const matchedNegatives: { word: string; weight: number }[] = [];

    let urgencyCount = 0;
    let financialCount = 0;
    let credCount = 0;
    let benignCount = 0;

    words.forEach((word) => {
      if (Object.prototype.hasOwnProperty.call(VOCABULARY_WEIGHTS, word)) {
        const weight = VOCABULARY_WEIGHTS[word];
        rawScore += weight;

        if (weight > 0) {
          if (!matchedPositives.some((p) => p.word === word.toUpperCase())) {
            matchedPositives.push({ word: word.toUpperCase(), weight });
          }
          if (['urgent', 'immediately', 'confidential', 'eod', 'expiration', 'expire'].includes(word)) urgencyCount++;
          if (['wire', 'transfer', '$85,000', '$42,600', 'acquisition', 'vendor', 'invoice', 'routing'].includes(word)) financialCount++;
          if (['password', 'credentials', 'login', 'http', 'https', 'suspension', 'confirm', 'verify', 'suspended'].includes(word)) credCount++;
        } else {
          if (!matchedNegatives.some((n) => n.word === word.toUpperCase())) {
            matchedNegatives.push({ word: word.toUpperCase(), weight });
          }
          benignCount++;
        }
      }
    });

    // Logistic Sigmoid Function: 1 / (1 + exp(-(z - threshold_bias)))
    const sigmoidScore = 1 / (1 + Math.exp(-(rawScore - 0.4)));
    const calculatedPercent = Math.min(Math.max(Math.round(sigmoidScore * 100), 2), 99);

    setRiskPercent(calculatedPercent);
    setPositiveTokens(matchedPositives);
    setNegativeTokens(matchedNegatives);

    setMetrics({
      urgency: Math.min(urgencyCount * 30 + (calculatedPercent > 50 ? 25 : 0), 100),
      financial: Math.min(financialCount * 32 + (calculatedPercent > 70 ? 20 : 0), 100),
      cred: Math.min(credCount * 32 + (calculatedPercent > 60 ? 30 : 0), 100),
      benign: Math.min(benignCount * 30 + (calculatedPercent < 30 ? 40 : 0), 100)
    });

    setLastScanTime(new Date().toLocaleTimeString('vi-VN'));
  };

  useEffect(() => {
    runAnalysis(scenarios.bec);
  }, []);

  const handleLoadScenario = (type: keyof typeof scenarios) => {
    setInputContent(scenarios[type]);
    runAnalysis(scenarios[type]);
  };

  const handleClear = () => {
    setInputContent('');
    setRiskPercent(0);
    setPositiveTokens([]);
    setNegativeTokens([]);
    setMetrics({ urgency: 0, financial: 0, cred: 0, benign: 0 });
  };

  const handleAddInspectedToDataset = () => {
    if (!inputContent.trim()) {
      alert("Vui lòng nhập hoặc nạp một mẫu email trước khi lưu.");
      return;
    }

    let category: EmailCategory = 'spam';
    let status: GatewayStatus = 'QUARANTINED';
    if (riskPercent >= 80) {
      category = 'bec';
      status = 'BLOCKED';
    } else if (riskPercent >= 45) {
      category = 'phishing';
      status = 'QUARANTINED';
    } else {
      category = 'ham';
      status = 'DELIVERED';
    }

    const defaultSubject = inputContent.slice(0, 48) + '...';
    const subjectPrompt = prompt("Nhập Tiêu đề (Subject) cho mẫu email này:", defaultSubject);
    if (subjectPrompt === null) return;

    const senderPrompt = prompt("Nhập Địa chỉ Người gửi (Sender):", "inspected.threat@external-partner.com");

    const newRecord: EmailRecord = {
      id: `EML-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString('vi-VN'),
      sender: senderPrompt?.trim() || "inspected.threat@external-partner.com",
      subject: subjectPrompt.trim() || defaultSubject,
      category,
      score: riskPercent,
      status,
      content: inputContent,
      custom: true
    };

    onAddEmailToDataset(newRecord);
    alert(`Đã lưu thành công email ${newRecord.id} vào kho dữ liệu cách ly và ghi nhận vào Audit Log!`);
  };

  // SVG circular gauge math
  const strokeDashoffset = 289 - (289 * riskPercent) / 100;
  let gaugeColor = '#06b6d4';
  let verdictTitle = 'BENIGN CORPORATE EMAIL';
  let verdictBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let verdictDesc = 'Nội dung email phù hợp với giao tiếp kinh doanh chuẩn mực, không phát hiện dấu hiệu lừa đảo.';
  let recommendedAction = 'DELIVER SAFELY TO INBOX (Phân phối trực tiếp vào hòm thư nhân viên)';

  if (riskPercent >= 80) {
    gaugeColor = '#f43f5e';
    verdictTitle = '🚨 CRITICAL THREAT / HIGH-RISK BEC';
    verdictBadgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold';
    verdictDesc = 'Phát hiện dấu hiệu Lừa đảo Thư điện tử Doanh nghiệp (Executive Impersonation / Wire Fraud) với độ tin cậy rất cao.';
    recommendedAction = 'IMMEDIATE SEG BLOCK & QUARANTINE (Chặn đứng, cách ly và phát cảnh báo tới SOC Tier 2)';
  } else if (riskPercent >= 45) {
    gaugeColor = '#f59e0b';
    verdictTitle = '⚠️ SUSPICIOUS PHISHING / SPAM';
    verdictBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
    verdictDesc = 'Phát hiện dấu hiệu lừa đảo đánh cắp danh tính (Credential Phishing) hoặc email tiếp thị rác.';
    recommendedAction = 'QUARANTINE & URL REWRITE (Gắn nhãn cảnh báo vàng, ghi đè liên kết và chuyển vào Junk Folder)';
  }

  return (
    <div className="space-y-6">
      {/* Top 2 Columns: Input Sandbox & Real-time Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Input & Scenarios */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold text-white text-sm sm:text-base">
                Threat Inspector & Payload Sandbox
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Inference: Balanced LogReg (Sublinear TF-IDF)
            </span>
          </div>

          {/* Pre-loaded Scenarios */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Kịch bản Kiểm thử Mẫu (Pre-loaded SOC Scenarios):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleLoadScenario('bec')}
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 group-hover:text-rose-300">
                    1. BEC Wire Transfer ($85,000)
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    HIGH RISK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Giả mạo CEO yêu cầu chuyển khoản tiền khẩn cấp cuối ngày (EOD).
                </p>
              </button>

              <button
                onClick={() => handleLoadScenario('phishing')}
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    2. Credential Harvester
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    SUSPICIOUS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Cảnh báo khóa hộp thư Microsoft 365, đính kèm link giả mạo.
                </p>
              </button>

              <button
                onClick={() => handleLoadScenario('spam')}
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-amber-400/50 hover:bg-amber-400/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                    3. Commercial Promo
                  </span>
                  <span className="text-[10px] bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    SPAM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Thư rác thương mại quảng cáo giảm giá phần mềm 70%.
                </p>
              </button>

              <button
                onClick={() => handleLoadScenario('ham')}
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    4. Enron Corporate Mail
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    BENIGN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Báo cáo dự báo chiến lược Q3 và thông báo lịch họp hợp lệ.
                </p>
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <label htmlFor="email-input-box" className="font-semibold text-slate-300">
                Nội dung Email cần Kiểm định (Raw Payload Buffer):
              </label>
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa trắng</span>
              </button>
            </div>
            <textarea
              id="email-input-box"
              rows={6}
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value);
                runAnalysis(e.target.value);
              }}
              placeholder="Dán nội dung bức thư điện tử đáng ngờ vào đây để phân tích IoC..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-all resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ngưỡng phân loại tối ưu: <strong className="text-slate-200">τ = 0.42</strong> (FPR ≤ 0.018%)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddInspectedToDataset}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Lưu vào Dataset Cách Ly</span>
              </button>
              <button
                onClick={() => runAnalysis()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Chạy Phân Tích Nguy Cơ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Analysis Result Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-sm sm:text-base">
                Quyết Định Phân Loại Cổng SEG
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {lastScanTime}
            </span>
          </div>

          {/* Score Circle & Main Verdict */}
          <div className="text-center py-4 px-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="289"
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono" style={{ color: gaugeColor }}>
                  {riskPercent}%
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">
                  ĐIỂM RỦI RO
                </span>
              </div>
            </div>

            <div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${verdictBadgeClass}`}>
                {verdictTitle}
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                {verdictDesc}
              </p>
            </div>
          </div>

          {/* Action Recommendation Box */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hành Động Khuyến Nghị Của Gateway (MTA Action):</span>
            </div>
            <div className="text-xs font-mono font-bold pl-5" style={{ color: gaugeColor }}>
              {recommendedAction}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Columns: Explainable AI (XAI) Tokens & Threat Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: XAI Feature Tokens */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Explainable AI (XAI): Trọng Số Đặc Trưng Tuyến Tính (Linear Weights)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              w_j * x_j Attribution
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Các token có trọng số dương ($w_j &gt; 0$) đóng góp trực tiếp làm tăng log-odds xác suất đe dọa (Đỏ/Vàng), trong khi các token có trọng số âm ($w_j &lt; 0$) đóng vai trò mỏ neo chứng thực thư doanh nghiệp lành tính (Xanh lá).
          </p>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Chỉ báo Nguy cơ Đe dọa (Positive Feature Weights):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {positiveTokens.length > 0 ? (
                  positiveTokens.map((p, idx) => (
                    <span
                      key={idx}
                      className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1"
                    >
                      <span>{p.word}</span>
                      <span className="text-[9px] text-rose-400 font-bold">+{p.weight.toFixed(2)}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-xs">
                    Không phát hiện token đe dọa đáng kể trong payload này.
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Chỉ báo Ngữ cảnh Hợp lệ (Negative Benign Weights):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {negativeTokens.length > 0 ? (
                  negativeTokens.map((n, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1"
                    >
                      <span>{n.word}</span>
                      <span className="text-[9px] text-emerald-400 font-bold">{n.weight.toFixed(2)}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-xs">
                    Không có chỉ báo ngữ cảnh hành chính nội bộ đặc trưng.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Threat Vector Breakdown Meters */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Phân Rã Vector Tấn Công
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Heuristic NLP</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Áp lực Thời gian / Social Engineering:</span>
                <span className="text-rose-400 font-bold">{metrics.urgency}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full transition-all duration-700"
                  style={{ width: `${metrics.urgency}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ý đồ Tài chính / Yêu cầu Chuyển tiền (Wire):</span>
                <span className="text-amber-400 font-bold">{metrics.financial}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-400 h-full transition-all duration-700"
                  style={{ width: `${metrics.financial}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Thu thập Thông tin Đăng nhập (Credential Theft):</span>
                <span className="text-rose-400 font-bold">{metrics.cred}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full transition-all duration-700"
                  style={{ width: `${metrics.cred}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Bối cảnh Trao đổi Doanh nghiệp Hợp lệ:</span>
                <span className="text-emerald-400 font-bold">{metrics.benign}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-400 h-full transition-all duration-700"
                  style={{ width: `${metrics.benign}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
