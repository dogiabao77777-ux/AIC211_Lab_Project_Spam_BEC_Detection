import React, { useState, useRef } from 'react';
import { 
  Database, Plus, History, Download, FileSpreadsheet, 
  RotateCcw, Search, Trash2, Scan, X, MailPlus,
  Upload, CloudDownload, HelpCircle, Globe, Share2, FileUp, CheckCircle2, AlertTriangle,
  GitBranch, GitCommit, GitPullRequest, Copy, Check
} from 'lucide-react';
import { EmailRecord, EmailCategory, GatewayStatus, AuditLogEntry } from '../types';

interface DatasetManagerProps {
  dataset: EmailRecord[];
  auditLog: AuditLogEntry[];
  onAddEmail: (email: EmailRecord) => void;
  onDeleteEmail: (id: string) => void;
  onResetDataset: () => void;
  onInspectEmail: (email: EmailRecord) => void;
  onImportDataset?: (emails: EmailRecord[], replaceMode: boolean) => void;
  onFetchCloudDataset?: () => Promise<number>;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  dataset,
  auditLog,
  onAddEmail,
  onDeleteEmail,
  onResetDataset,
  onInspectEmail,
  onImportDataset,
  onFetchCloudDataset
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);

  // Form states for modal
  const [newSender, setNewSender] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newCategory, setNewCategory] = useState<EmailCategory>('bec');
  const [newStatus, setNewStatus] = useState<GatewayStatus>('BLOCKED');
  const [newContent, setNewContent] = useState<string>('');

  const filteredDataset = dataset.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newContent.trim()) {
      alert("Vui lòng nhập đầy đủ Tiêu đề và Nội dung email!");
      return;
    }

    const newRecord: EmailRecord = {
      id: `EML-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString('vi-VN'),
      sender: newSender.trim() || "analyst.external@partner-corp.com",
      subject: newSubject.trim(),
      category: newCategory,
      score: newCategory === 'bec' ? 96 : (newCategory === 'phishing' ? 86 : (newCategory === 'spam' ? 76 : 5)),
      status: newStatus,
      content: newContent.trim(),
      custom: true
    };

    onAddEmail(newRecord);
    setIsAddModalOpen(false);
    // Reset form
    setNewSender('');
    setNewSubject('');
    setNewContent('');
  };

  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isFetchingCloud, setIsFetchingCloud] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string>('https://raw.githubusercontent.com/dogiabao77777/AIC211-Project/main/public/data/enron_sample_dataset.json');
  const [isFetchingGithub, setIsFetchingGithub] = useState<boolean>(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchCloud = async () => {
    setIsFetchingCloud(true);
    setCloudSyncStatus(null);
    try {
      if (onFetchCloudDataset) {
        const count = await onFetchCloudDataset();
        setCloudSyncStatus(`Đã nạp thành công ${count} email chuẩn từ Cloud (/data/enron_sample_dataset.json)!`);
      } else {
        const res = await fetch('/data/enron_sample_dataset.json');
        if (!res.ok) throw new Error('Không thể tải file cloud');
        const data = await res.json();
        if (onImportDataset) {
          onImportDataset(data, false);
          setCloudSyncStatus(`Đã nạp ${data.length} email chuẩn từ Cloud!`);
        }
      }
    } catch (err) {
      console.error(err);
      setCloudSyncStatus("Không thể tải file cloud. Vui lòng kiểm tra mạng hoặc thử lại.");
    } finally {
      setIsFetchingCloud(false);
      setTimeout(() => setCloudSyncStatus(null), 6000);
    }
  };

  const handleFetchFromGitHub = async (customUrl?: string) => {
    let targetUrl = (customUrl || githubUrl).trim();
    if (!targetUrl) {
      alert("Vui lòng nhập URL file dataset trên GitHub!");
      return;
    }

    // Auto convert github.com/.../blob/... to raw.githubusercontent.com/...
    if (targetUrl.includes('github.com') && targetUrl.includes('/blob/')) {
      targetUrl = targetUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    setIsFetchingGithub(true);
    setCloudSyncStatus(null);
    try {
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Không thể tải file từ GitHub`);
      const text = await res.text();

      let parsedEmails: EmailRecord[] = [];
      try {
        const raw = JSON.parse(text);
        if (Array.isArray(raw)) {
          parsedEmails = raw.map((item, idx) => ({
            id: item.id || `GIT-${Date.now().toString().slice(-4)}-${idx}`,
            time: item.time || new Date().toLocaleTimeString('vi-VN'),
            sender: item.sender || "github@enron-dataset.org",
            subject: item.subject || "No Subject",
            category: (item.category && ['bec', 'phishing', 'spam', 'ham'].includes(item.category.toLowerCase()))
              ? item.category.toLowerCase() as EmailCategory
              : (item.label === 1 || item.label === '1' || item.spam ? 'spam' : 'ham'),
            score: typeof item.score === 'number' ? item.score : (item.category === 'bec' ? 95 : 10),
            status: item.status || (item.category === 'bec' ? 'BLOCKED' : (item.category === 'ham' ? 'DELIVERED' : 'QUARANTINED')),
            content: item.content || item.text || item.body || "",
            custom: true
          }));
        }
      } catch {
        // Try parsing as CSV
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            if (cols.length >= 2) {
              parsedEmails.push({
                id: cols[0] || `GIT-${i}`,
                time: cols[1] || new Date().toLocaleTimeString('vi-VN'),
                sender: cols[2] || `user${i}@enron.com`,
                category: (['bec', 'phishing', 'spam', 'ham'].includes((cols[3] || '').toLowerCase()) ? cols[3].toLowerCase() : 'ham') as EmailCategory,
                score: Number(cols[4]) || 50,
                status: (cols[5] as GatewayStatus) || 'QUARANTINED',
                subject: cols[6] || `Record ${i}`,
                content: cols[7] || cols[6] || "",
                custom: true
              });
            }
          }
        }
      }

      if (parsedEmails.length === 0) {
        throw new Error("Không thể trích xuất danh sách email hợp lệ từ file GitHub!");
      }

      if (onImportDataset) {
        onImportDataset(parsedEmails, false);
      }
      setCloudSyncStatus(`Kết nối Git thành công! Đã nạp ${parsedEmails.length} email trực tiếp từ GitHub.`);
      setIsSyncModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi kết nối GitHub: ${err.message || 'Không thể tải file'}. Hãy đảm bảo repository ở chế độ Public hoặc dùng GitHub Raw URL.`);
    } finally {
      setIsFetchingGithub(false);
      setTimeout(() => setCloudSyncStatus(null), 6000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        let parsedEmails: EmailRecord[] = [];
        if (file.name.toLowerCase().endsWith('.json')) {
          const raw = JSON.parse(text);
          if (Array.isArray(raw)) {
            parsedEmails = raw.map((item, idx) => ({
              id: item.id || `IMP-${Date.now().toString().slice(-4)}-${idx}`,
              time: item.time || new Date().toLocaleTimeString('vi-VN'),
              sender: item.sender || "imported@dataset-source.com",
              subject: item.subject || "No Subject",
              category: (item.category && ['bec', 'phishing', 'spam', 'ham'].includes(item.category.toLowerCase()))
                ? item.category.toLowerCase() as EmailCategory
                : (item.label === 1 || item.label === '1' || item.spam ? 'spam' : 'ham'),
              score: typeof item.score === 'number' ? item.score : (item.category === 'bec' ? 95 : (item.category === 'spam' ? 80 : 5)),
              status: item.status || (item.category === 'bec' ? 'BLOCKED' : (item.category === 'ham' ? 'DELIVERED' : 'QUARANTINED')),
              content: item.content || item.text || item.body || "",
              custom: true
            }));
          }
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
          if (lines.length > 1) {
            const headerLine = lines[0].toLowerCase();
            const isLabelTextFormat = headerLine.includes('label') || headerLine.includes('text') || headerLine.includes('message');
            
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
              if (cols.length >= 2) {
                if (isLabelTextFormat) {
                  const label = cols[0].toLowerCase();
                  const content = cols[1] || "";
                  const isSpam = label.includes('spam') || label === '1' || label.includes('bec');
                  const isBec = label.includes('bec');
                  parsedEmails.push({
                    id: `CSV-${Date.now().toString().slice(-4)}-${i}`,
                    time: new Date().toLocaleTimeString('vi-VN'),
                    sender: `sample-user-${i}@enron-corpus.org`,
                    subject: content.slice(0, 45) + (content.length > 45 ? '...' : ''),
                    category: isBec ? 'bec' : (isSpam ? 'spam' : 'ham'),
                    score: isBec ? 96 : (isSpam ? 84 : 4),
                    status: isBec ? 'BLOCKED' : (isSpam ? 'QUARANTINED' : 'DELIVERED'),
                    content: content,
                    custom: true
                  });
                } else {
                  parsedEmails.push({
                    id: cols[0] || `CSV-${i}`,
                    time: cols[1] || new Date().toLocaleTimeString('vi-VN'),
                    sender: cols[2] || `user${i}@domain.com`,
                    category: (['bec', 'phishing', 'spam', 'ham'].includes((cols[3] || '').toLowerCase()) ? cols[3].toLowerCase() : 'ham') as EmailCategory,
                    score: Number(cols[4]) || 50,
                    status: (cols[5] as GatewayStatus) || 'QUARANTINED',
                    subject: cols[6] || `Record ${i}`,
                    content: cols[7] || cols[6] || "",
                    custom: true
                  });
                }
              }
            }
          }
        }

        if (parsedEmails.length === 0) {
          alert("Không tìm thấy dữ liệu email hợp lệ trong file!");
          return;
        }

        const isAppend = confirm(
          `Đã nhận diện thành công ${parsedEmails.length} email từ file "${file.name}".\n\n- Bấm [OK] để GỘP THÊM vào kho hiện tại.\n- Bấm [Cancel] để THAY THẾ TOÀN BỘ dữ liệu bằng file này.`
        );

        if (onImportDataset) {
          onImportDataset(parsedEmails, !isAppend);
        }
        setCloudSyncStatus(`Đã nạp thành công ${parsedEmails.length} email từ file ${file.name}!`);
        setTimeout(() => setCloudSyncStatus(null), 5000);
      } catch (err) {
        console.error("Lỗi đọc file:", err);
        alert("Lỗi khi đọc file. Vui lòng kiểm tra định dạng .CSV hoặc .JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataset, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `vanguard_soc_emails_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Time,Sender,Category,ThreatScore,Status,Subject,Content\n";
    dataset.forEach((row) => {
      const cleanSubject = `"${(row.subject || '').replace(/"/g, '""')}"`;
      const cleanContent = `"${(row.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      csvContent += `${row.id},${row.time},${row.sender},${row.category},${row.score},${row.status},${cleanSubject},${cleanContent}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vanguard_soc_emails_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for CSV/JSON upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json,.csv"
        className="hidden"
      />

      {/* Cloud Sync Toast Notification */}
      {cloudSyncStatus && (
        <div className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{cloudSyncStatus}</span>
          </div>
          <button onClick={() => setCloudSyncStatus(null)} className="text-cyan-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner and Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Quản Lý Kho Dữ Liệu Email & Cách Ly (Quarantine Storage Manager)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tập dữ liệu trực quan hỗ trợ tải lên/xuất file CSV/JSON, nạp từ Đám Mây Vercel và đồng bộ đa thiết bị.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Guide Button for Multi-device connection */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition-all"
              title="Xem hướng dẫn cách liên kết dataset để mọi máy tính khác cùng xem và làm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Cách Liên Kết Cho Mọi Máy?</span>
            </button>

            {/* Git / GitHub Sync Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition-all"
              title="Đồng bộ dataset trực tiếp từ GitHub Repository hoặc Git Push CI/CD"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Kết Nối Git</span>
            </button>

            {/* Cloud Fetch Button */}
            <button
              onClick={handleFetchCloud}
              disabled={isFetchingCloud}
              className="px-3 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Tải nạp dữ liệu Enron Benchmark trực tiếp từ file tĩnh trên Vercel"
            >
              <CloudDownload className={`w-3.5 h-3.5 text-cyan-400 ${isFetchingCloud ? 'animate-bounce' : ''}`} />
              <span>{isFetchingCloud ? 'Đang Nạp...' : 'Nạp Dataset Cloud'}</span>
            </button>

            {/* Import Local File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Tải lên file CSV hoặc JSON từ máy tính của bạn"
            >
              <FileUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nhập File (.CSV/.JSON)</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Email Mới</span>
            </button>

            <button
              onClick={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audit Log ({auditLog.length})</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center gap-1 transition-all"
              title="Xuất file JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center gap-1 transition-all"
              title="Xuất file CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={onResetDataset}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-slate-700 font-medium text-xs rounded-xl flex items-center gap-1 transition-all"
              title="Khôi phục dữ liệu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-semibold mr-1">Bộ lọc:</span>
            {[
              { id: 'all', label: `Tất cả (${dataset.length})` },
              { id: 'bec', label: `BEC (${dataset.filter(e => e.category === 'bec').length})` },
              { id: 'phishing', label: `Phishing (${dataset.filter(e => e.category === 'phishing').length})` },
              { id: 'spam', label: `Spam (${dataset.filter(e => e.category === 'spam').length})` },
              { id: 'ham', label: `Ham (${dataset.filter(e => e.category === 'ham').length})` }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveCategory(btn.id)}
                className={`px-3 py-1 rounded-lg font-mono font-medium transition-all ${
                  activeCategory === btn.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo ID, người gửi, chủ đề..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Mã ID / Giờ</th>
                <th className="py-3 px-3">Người Gửi (From)</th>
                <th className="py-3 px-3">Chủ Đề & Đoạn Trích Nội Dung</th>
                <th className="py-3 px-3">Phân Loại</th>
                <th className="py-3 px-3">Điểm Rủi Ro</th>
                <th className="py-3 px-3">Trạng Thái Gateway</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
              {filteredDataset.length > 0 ? (
                filteredDataset.map((item) => {
                  let badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                  if (item.category === 'bec') {
                    badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  } else if (item.category === 'phishing') {
                    badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  } else if (item.category === 'spam') {
                    badgeClass = 'bg-amber-400/10 text-amber-300 border-amber-400/30';
                  }

                  let statusColor = 'text-emerald-400';
                  if (item.status === 'BLOCKED') statusColor = 'text-rose-400 font-bold';
                  else if (item.status === 'QUARANTINED') statusColor = 'text-amber-400 font-bold';

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors group">
                      <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                        <span className="text-white font-bold">{item.id}</span>
                        <span className="block text-[10px] text-slate-500">{item.time}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300 truncate max-w-[140px]" title={item.sender}>
                        {item.sender}
                      </td>
                      <td className="py-2.5 px-3 max-w-[280px]">
                        <div className="font-semibold text-slate-200 truncate" title={item.subject}>
                          {item.subject}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                          {item.content}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClass}`}>
                          {item.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={item.score > 70 ? 'text-rose-400' : (item.score > 35 ? 'text-amber-400' : 'text-emerald-400')}>
                          {item.score}%
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 font-mono text-[10px] whitespace-nowrap ${statusColor}`}>
                        {item.status}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onInspectEmail(item)}
                            className="p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all"
                            title="Kiểm định trong Sandbox"
                          >
                            <Scan className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEmail(item.id)}
                            className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                            title="Xóa bản ghi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    Không tìm thấy bản ghi email nào khớp với tiêu chí tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            Đang hiển thị <strong className="text-white">{filteredDataset.length}</strong> / {dataset.length} bản ghi email
          </span>
          <span className="text-cyan-400 font-mono">
            • Dữ liệu lưu trữ bền vững trên trình duyệt (LocalStorage Active)
          </span>
        </div>
      </div>

      {/* Audit History Log Drawer */}
      {isAuditDrawerOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Nhật Ký Thay Đổi Dữ Liệu & Kiểm Toán (Dataset Audit Log)
              </h3>
            </div>
            <button
              onClick={() => setIsAuditDrawerOpen(false)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đóng</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Lưu vết tự động và bất biến mọi hành động Thêm (ADD), Xóa (DELETE) và Phục hồi (RESET) để đáp ứng quy định kiểm toán điều tra số của SOC.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Hành động</th>
                  <th className="py-2.5 px-3">Mã ID</th>
                  <th className="py-2.5 px-3">Chủ đề tóm tắt</th>
                  <th className="py-2.5 px-3">Phân loại</th>
                  <th className="py-2.5 px-3">Người thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-[11px]">
                {auditLog.map((log) => {
                  let actionBadge = <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">{log.action}</span>;
                  if (log.action === 'ADD') {
                    actionBadge = <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">ADDED</span>;
                  } else if (log.action === 'DELETE') {
                    actionBadge = <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">DELETED</span>;
                  }
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{log.time}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{actionBadge}</td>
                      <td className="py-2 px-3 text-slate-300 font-bold whitespace-nowrap">{log.recordId}</td>
                      <td className="py-2 px-3 text-slate-200 truncate max-w-[200px]" title={log.subject}>{log.subject}</td>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{log.category}</td>
                      <td className="py-2 px-3 text-cyan-300 whitespace-nowrap">{log.operator}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Email Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <MailPlus className="w-5 h-5 text-cyan-400" />
                <span>Thêm Email Mới vào Kho Dữ Liệu Cách Ly</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Địa chỉ người gửi (Sender Email):</label>
                <input
                  type="text"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  placeholder="Ví dụ: cfo.finance@partner-supplier.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tiêu đề thư (Subject Line):</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ví dụ: Yêu cầu cập nhật số tài khoản nhận tiền chuyển khoản hợp đồng..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phân loại (Category):</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EmailCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="bec">BEC (Lừa đảo chuyển tiền CEO)</option>
                    <option value="phishing">Phishing (Đánh cắp tài khoản)</option>
                    <option value="spam">Spam (Thư rác quảng cáo)</option>
                    <option value="ham">Ham (Email doanh nghiệp hợp lệ)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trạng thái Cổng Gateway:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GatewayStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="BLOCKED">BLOCKED (Chặn đứng)</option>
                    <option value="QUARANTINED">QUARANTINED (Cách ly)</option>
                    <option value="DELIVERED">DELIVERED (Giao hộp thư)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nội dung thân thư (Body Payload):</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết email..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20"
                >
                  Lưu & Ghi Vào Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Device Connection & Cloud Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Cách Liên Kết Dataset Cho Mọi Máy Tính Cùng Xem &amp; Làm Việc
                  </h3>
                  <p className="text-xs text-indigo-300">
                    Triển khai trên Vercel: <span className="font-mono text-cyan-300">https://aiemailspambecdetectionsocdashboard-six.vercel.app/</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Root Cause Explanation */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Nguyên nhân máy tính khác vào chưa thấy dữ liệu bạn vừa chỉnh sửa:
              </span>
              <p className="text-slate-300 leading-relaxed">
                Khi deploy lên Vercel dạng frontend tĩnh (SPA), mặc định ứng dụng lưu các thay đổi thêm/xóa/sửa vào <code className="text-cyan-300 font-mono">LocalStorage</code> của từng trình duyệt riêng lẻ. Vì vậy máy tính của bạn và máy tính của bạn bè/thầy cô là hai vùng nhớ độc lập.
              </p>
            </div>

            {/* 4 Practical Solutions with Git Featured */}
            <div className="space-y-3.5 text-xs">
              {/* Solution 1: Git & GitHub Connection (Primary) */}
              <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/40 space-y-3 shadow-md shadow-purple-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5 text-sm">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    Cách 1: Kết Nối Trực Tiếp Bằng Git / GitHub (Khuyên Dùng Cho Nhóm Làm Việc)
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    CHUẨN GITOPS
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Vì bạn đã liên kết dự án với Vercel qua GitHub, bạn có <strong>2 cách kết nối bằng Git</strong>:
                </p>

                {/* Sub-A: Push Git to Vercel CI/CD */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-[11px] flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                      1.1. Cập nhật Dataset tự động qua Git Push (Vercel tự Auto-Deploy):
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`git add public/data/\ngit commit -m "feat: sync email dataset for team"\ngit push origin main`);
                        setCopiedGitCmd(true);
                        setTimeout(() => setCopiedGitCmd(false), 2000);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono flex items-center gap-1 border border-slate-700"
                    >
                      {copiedGitCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedGitCmd ? 'Đã chép!' : 'Copy lệnh Git'}</span>
                    </button>
                  </div>
                  <pre className="p-2 bg-slate-950 rounded font-mono text-[10px] text-emerald-400 overflow-x-auto">
{`git add public/data/
git commit -m "feat: sync email dataset for team"
git push origin main`}
                  </pre>
                  <p className="text-slate-400 text-[10px]">
                    &rarr; Ngay khi bạn push, Vercel sẽ tự động build lại trong 30 giây. 100% mọi máy tính vào link web sẽ tự động nhận dataset mới nhất qua địa chỉ tĩnh: <span className="text-cyan-300 font-mono">/data/enron_sample_dataset.json</span>.
                  </p>
                </div>

                {/* Sub-B: Interactive GitHub Raw Link Fetcher */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 text-[11px] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    1.2. Hoặc Đồng Bộ Trực Tiếp Từ File Trên GitHub (Không Cần Chờ Deploy Lại):
                  </span>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Dán URL GitHub Raw (ví dụ: https://raw.githubusercontent.com/.../dataset.json)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleFetchFromGitHub()}
                      disabled={isFetchingGithub}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-900/30"
                    >
                      <GitPullRequest className={`w-3.5 h-3.5 ${isFetchingGithub ? 'animate-spin' : ''}`} />
                      <span>{isFetchingGithub ? 'Đang Tải...' : 'Đồng Bộ Từ GitHub'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>* Gợi ý: Hỗ trợ cả link GitHub thông thường (sẽ tự động chuyển thành Raw) và file .JSON hoặc .CSV.</span>
                  </div>
                </div>
              </div>

              {/* Solution 2: Public Cloud Bundle */}
              <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Cách 2: Đóng gói Dataset vào thư mục Public của Vercel (Tự Động Nạp Sẵn)
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    TỰ ĐỘNG 100%
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Chúng tôi đã tích hợp cơ chế tự động nạp (Auto-Seed on First Visit). Bất kỳ máy nào mở web lần đầu tiên đều sẽ tự động tải file <code className="text-cyan-300 font-mono">/data/enron_sample_dataset.json</code>, đảm bảo mọi thành viên đều có chung dữ liệu khởi điểm để phân tích.
                </p>
              </div>

              {/* Solution 3: Direct File Import */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                    <FileUp className="w-4 h-4 text-emerald-400" />
                    Cách 3: Dùng nút &ldquo;Nhập File (.CSV/.JSON)&rdquo; Trực Tiếp
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    NHANH CHÓNG
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Bạn có thể gửi file <code className="text-emerald-300 font-mono">emails.csv</code> từ bài Lab AIC211 hoặc file xuất JSON từ máy bạn. Thành viên ở máy khác mở link web lên, bấm nút <strong className="text-white">&ldquo;Nhập File (.CSV/.JSON)&rdquo;</strong> để nạp vào trình duyệt của họ làm việc ngay lập tức.
                </p>
              </div>

              {/* Solution 4: Realtime Database */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5 text-sm">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    Cách 4: Tích Hợp Cloud Database Thời Gian Thực (Firebase Firestore)
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    REALTIME 2 CHIỀU
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Nếu nhóm của bạn muốn khi <strong>Máy A thêm/xóa email</strong> thì <strong>Máy B lập tức tự nhảy cập nhật thời gian thực</strong> trên màn hình, ta chỉ cần kết nối Firebase Firestore để lưu tập trung toàn bộ cơ sở dữ liệu.
                </p>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <a
                  href="/data/enron_sample_dataset.json"
                  download="enron_sample_dataset.json"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tải File .JSON Mẫu</span>
                </a>
                <a
                  href="/data/enron_sample_dataset.csv"
                  download="enron_sample_dataset.csv"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1 border border-slate-700"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tải File .CSV Mẫu</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSyncModalOpen(false);
                    handleFetchCloud();
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <CloudDownload className="w-3.5 h-3.5" />
                  <span>Nạp Dataset Cloud Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
