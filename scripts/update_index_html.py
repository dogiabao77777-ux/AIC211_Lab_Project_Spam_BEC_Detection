import re

src_path = "/app/applet/public/assets/aistudio/ai_email_spam_bec_detection_soc_dashboard_6ecc217c.html"
with open(src_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Deliverable Download Buttons to Header Navigation
header_buttons = '''      <!-- Quick Deliverables & Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <a href="/AI_Powered_Email_Spam_and_BEC_Detection_Paper.pdf" download="AI_Powered_Email_Spam_and_BEC_Detection_Paper.pdf" target="_blank"
           class="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-rose-500/10"
           title="Tải Paper IEEE chuẩn camera-ready 5 trang PDF">
          <i data-lucide="file-text" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>Tải Paper .PDF</span>
        </a>
        <a href="/AIC211_Email_Spam_BEC_Detection_Final_Report.md" download="AIC211_Email_Spam_BEC_Detection_Final_Report.md" target="_blank"
           class="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
           title="Tải Báo cáo Đồ án chi tiết Markdown">
          <i data-lucide="book-open" class="w-3.5 h-3.5 text-indigo-400"></i>
          <span>Report .MD</span>
        </a>
        <a href="/project_source_code.zip" download="project_source_code.zip"
           class="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/10"
           title="Tải toàn bộ mã nguồn Project ZIP để deploy lên GitHub / Vercel">
          <i data-lucide="package" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Source .ZIP</span>
        </a>
      </div>
'''

target_nav = '<div class="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-soc-border">'
if target_nav in content and 'Tải Paper .PDF' not in content:
    content = content.replace(target_nav, header_buttons + '\n      ' + target_nav)
    print("Added header deliverable buttons.")

# 2. Add 'Nạp Cloud Dataset' button to Dataset Action Bar
cloud_btn = '''            <button onclick="fetchCloudDataset()" class="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all" title="Nạp trực tiếp dataset 30,137 emails từ /data/enron_sample_dataset.json trên cloud">
              <i data-lucide="cloud-download" class="w-3.5 h-3.5"></i> Nạp Cloud Dataset
            </button>'''

target_add_btn = '<button onclick="openAddEmailModal()"'
if target_add_btn in content and 'fetchCloudDataset' not in content:
    content = content.replace(target_add_btn, cloud_btn + '\n            ' + target_add_btn)
    print("Added Cloud Dataset button.")

# 3. Add fetchCloudDataset JS implementation
js_func = '''    // Fetch Cloud Dataset from /data/enron_sample_dataset.json
    async function fetchCloudDataset() {
      showToast("Đang kết nối Cloud Dataset /data/enron_sample_dataset.json...", "info");
      try {
        const res = await fetch('/data/enron_sample_dataset.json');
        if (!res.ok) throw new Error("HTTP " + res.status + " " + res.statusText);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          currentDataset = data;
          saveDatasetToStorage();
          renderDatasetTable();
          updateTopMetrics();
          showToast(`Đồng bộ thành công ${data.length} mẫu email từ Cloud Dataset!`, "success");
          currentAuditLog.unshift({
            time: new Date().toLocaleTimeString(),
            action: "CLOUD_SYNC",
            id: "CLOUD-01",
            subject: `Đồng bộ ${data.length} emails từ Cloud Dataset`,
            category: "SYSTEM",
            operator: "CloudSync"
          });
          saveAuditLogToStorage();
          renderAuditLogTable();
        } else {
          throw new Error("Dữ liệu rỗng hoặc sai cấu trúc.");
        }
      } catch (err) {
        console.error("Cloud fetch error:", err);
        showToast("Không thể nạp từ Cloud: " + err.message, "danger");
      }
    }
'''

target_js = 'function initDataStorage()'
if target_js in content and 'async function fetchCloudDataset()' not in content:
    content = content.replace(target_js, js_func + '\n    ' + target_js)
    print("Added fetchCloudDataset JS function.")

# Write to /index.html
with open("/app/applet/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated /index.html successfully.")

# Also mirror to /public/index.html and /public/dashboard.html
with open("/app/applet/public/index.html", "w", encoding="utf-8") as f:
    f.write(content)
with open("/app/applet/public/dashboard.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated /public/index.html and /public/dashboard.html.")
