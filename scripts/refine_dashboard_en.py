import re

with open("/app/applet/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update header deliverables to clean English
old_header_btns = '''      <!-- Quick Deliverables & Actions -->
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
      </div>'''

new_header_btns = '''      <!-- Quick Deliverables & Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <a href="/AI_Powered_Email_Spam_and_BEC_Detection_Paper.pdf" download="AI_Powered_Email_Spam_and_BEC_Detection_Paper.pdf" target="_blank"
           class="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-rose-500/10"
           title="Download IEEE Camera-Ready 5-Page Paper PDF">
          <i data-lucide="file-text" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>Paper (PDF)</span>
        </a>
        <a href="/AIC211_Email_Spam_BEC_Detection_Final_Report.md" download="AIC211_Email_Spam_BEC_Detection_Final_Report.md" target="_blank"
           class="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
           title="Download Full Capstone Technical Report Markdown">
          <i data-lucide="book-open" class="w-3.5 h-3.5 text-indigo-400"></i>
          <span>Report (MD)</span>
        </a>
        <a href="/project_source_code.zip" download="project_source_code.zip"
           class="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/10"
           title="Download Full Project Source Code ZIP Archive">
          <i data-lucide="package" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Source (ZIP)</span>
        </a>
      </div>'''

if old_header_btns in content:
    content = content.replace(old_header_btns, new_header_btns)
    print("Updated header buttons to English.")

# 2. Remove Rubric button from Navigation Tabs
old_rubric_btn = '''        <button id="tab-rubric-btn" onclick="switchTab('rubric')" class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all">
          <i data-lucide="award" class="w-3.5 h-3.5"></i>
          4. Rubric & Architecture
        </button>'''

if old_rubric_btn in content:
    content = content.replace(old_rubric_btn, "")
    print("Removed tab-rubric-btn from navigation.")

# 3. Update Dataset action bar buttons to English
old_cloud_btn = '''<button onclick="fetchCloudDataset()" class="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all" title="Nạp trực tiếp dataset 30,137 emails từ /data/enron_sample_dataset.json trên cloud">
              <i data-lucide="cloud-download" class="w-3.5 h-3.5"></i> Nạp Cloud Dataset
            </button>'''

new_cloud_btn = '''<button onclick="fetchCloudDataset()" class="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all" title="Synchronize benchmark corpus directly from Cloud (/data/enron_sample_dataset.json)">
              <i data-lucide="cloud-download" class="w-3.5 h-3.5"></i> Fetch Cloud Dataset
            </button>'''

if old_cloud_btn in content:
    content = content.replace(old_cloud_btn, new_cloud_btn)
    print("Updated cloud dataset button to English.")

old_import_btn = '''<button onclick="document.getElementById('json-file-input').click()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-soc-border font-medium text-xs rounded-xl flex items-center gap-1 transition-all" title="Nạp bất kỳ file .json nào từ máy tính của bạn">'''
new_import_btn = '''<button onclick="document.getElementById('json-file-input').click()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-soc-border font-medium text-xs rounded-xl flex items-center gap-1 transition-all" title="Import custom JSON dataset from your computer">'''

if old_import_btn in content:
    content = content.replace(old_import_btn, new_import_btn)
    print("Updated import button title to English.")

# 4. Remove section-rubric completely
# Find from <!-- TAB 4: RUBRIC ALIGNMENT to </main>
rubric_pattern = r'<!-- =+\s*-->\s*<!-- TAB 4: RUBRIC ALIGNMENT.*?<!-- =+\s*-->\s*<div id="section-rubric".*?</div>\s*</div>\s*</div>\s*</div>'
match = re.search(r'<!--\s*=+\s*-->\s*<!--\s*TAB 4: RUBRIC ALIGNMENT.*?</div>\s*</main>', content, re.DOTALL)
if match:
    # We want to keep </main>
    content = content[:match.start()] + '</main>' + content[match.end():]
    print("Removed section-rubric from main container.")
else:
    # Fallback search for id="section-rubric"
    start_idx = content.find('<div id="section-rubric"')
    if start_idx != -1:
        # Find </main>
        main_end = content.find('</main>', start_idx)
        if main_end != -1:
            # find the comment before section-rubric
            comment_start = content.rfind('<!-- ===', 0, start_idx)
            cut_from = comment_start if comment_start != -1 else start_idx
            content = content[:cut_from] + content[main_end:]
            print("Removed section-rubric via fallback search.")

# 5. Update switchTab function in JS
content = re.sub(
    r"const tabs = \['inspector', 'dataset', 'analytics', 'rubric'\];",
    "const tabs = ['inspector', 'dataset', 'analytics'];",
    content
)
print("Updated switchTab to 3 tabs.")

# 6. Update JavaScript messages and toasts to English
content = content.replace('Đang kết nối Cloud Dataset /data/enron_sample_dataset.json...', 'Connecting to Cloud Dataset /data/enron_sample_dataset.json...')
content = content.replace('Đồng bộ thành công ${data.length} mẫu email từ Cloud Dataset!', 'Successfully synchronized ${data.length} email records from Cloud Dataset!')
content = content.replace('Đồng bộ ${data.length} emails từ Cloud Dataset', 'Synchronized ${data.length} emails from Cloud Dataset')
content = content.replace('Dữ liệu rỗng hoặc sai cấu trúc.', 'Empty or invalid dataset structure.')
content = content.replace('Không thể nạp từ Cloud: ', 'Failed to fetch from Cloud: ')
content = content.replace('Đã nạp thành công ${data.length} email từ file ${file.name}!', 'Successfully imported ${data.length} emails from file ${file.name}!')
content = content.replace('Nạp ${data.length} emails từ file ${file.name}', 'Imported ${data.length} emails from file ${file.name}')
content = content.replace('File JSON không hợp lệ hoặc không chứa danh sách email.', 'Invalid JSON file or missing email records list.')
content = content.replace('Lỗi đọc file JSON: ', 'Error parsing JSON file: ')

with open("/app/applet/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Wrote updated index.html successfully.")
