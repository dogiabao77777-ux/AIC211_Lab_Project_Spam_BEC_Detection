# AIC211: AI for Cybersecurity — Email Spam & BEC Detection Pipeline

Dự án máy học hoàn chỉnh phát hiện **Spam Email & Tấn công giả mạo email doanh nghiệp (Business Email Compromise - BEC)**, được tổ chức toàn bộ trong **1 file code duy nhất** theo chuẩn các bài Lab môn **AIC211** (như `AIC211_Lab2_IDS_Pipeline_Imbalance_GOOD.ipynb`).

---

## 1. Cấu trúc thư mục dự án

```text
lab_project_aic/
├── AIC211_Lab_Project_Spam_BEC_Detection.ipynb  # File Jupyter Notebook chia từng Step (chuẩn Lab 2)
├── lab_project_aic.ipynb                       # Bản sao notebook tiện mở trực tiếp
├── lab_project_aic.py                          # File Python tổng hợp duy nhất chạy toàn bộ pipeline
├── datasets/
│   ├── emails.csv                              # Tập Enron gốc (1.36 GB, 517,401 emails nội bộ Enron)
│   └── enron_spam_data.csv                     # Tập benchmark có nhãn (Metsis et al., 33,716 emails)
├── models/
│   ├── logistic_regression_email.joblib        # Model Logistic Regression đã train
│   ├── random_forest_email.joblib              # Model Random Forest đã train
│   └── test_split.joblib                       # Tập Test độc lập đã lưu (6,028 emails)
├── results/
│   ├── fig1_data_distribution.png              # Biểu đồ phân bố nhãn & độ dài email
│   ├── fig2_confusion_matrices.png             # Ma trận nhầm lẫn (Confusion Matrix) 4 mô hình
│   ├── fig3_model_comparison.png               # Biểu đồ cột so sánh Precision, Recall, F1, PR-AUC
│   ├── fig4_precision_recall_curves.png        # Đường cong Precision-Recall
│   ├── metrics.csv                             # Bảng số liệu chi tiết dạng CSV
│   ├── metrics.json                            # Bảng số liệu chi tiết dạng JSON
│   └── error_analysis.txt                      # Báo cáo phân tích lỗi bảo mật (FP vs FN)
├── requirements.txt                            # Danh sách thư viện cần thiết
└── README.md                                   # Hướng dẫn chi tiết này
```

---

## 2. Hướng dẫn chạy Code (2 cách)

### Cách 1: Chạy bằng 1 file Python duy nhất trong Terminal
Mở terminal tại thư mục dự án và gõ lệnh:

```bash
python lab_project_aic.py
```

Toàn bộ 10 bước sẽ tự động thực thi tuần tự từ đầu đến cuối: tải dữ liệu, tiền xử lý, chia tập train/test chống rò rỉ dữ liệu, huấn luyện 4 mô hình (Baseline & Balanced), xuất bảng so sánh, vẽ và lưu các biểu đồ vào `results/`, chạy demo nhận diện email theo thời gian thực.

---

### Cách 2: Chạy trong Jupyter Notebook / VS Code
1. Mở file `AIC211_Lab_Project_Spam_BEC_Detection.ipynb` (hoặc `lab_project_aic.ipynb`) trong VS Code hoặc Jupyter Notebook.
2. Chọn Python Kernel tương ứng.
3. Nhấn **Run All** hoặc chạy từng cell tương ứng với từng Step.

---

## 3. Nội dung 10 Bước (Steps) trong Pipeline

Mỗi bước được thiết kế rõ ràng với banner phân cách chuẩn AIC211:

- **STEP 0: Load Raw Data & Schema Inspection**
  - Kiểm tra file `datasets/emails.csv` (1.36 GB, 517,401 dòng, cột `['file', 'message']`).
  - Làm rõ hạn chế: Tập Enron thô chỉ gồm email nội bộ hợp pháp của tập đoàn Enron, **hoàn toàn không có nhãn ground-truth cho Spam hay BEC**.
  - Tích hợp tập benchmark chuẩn học thuật **Enron-Spam (Metsis et al., 2006)** gồm 16,545 email hợp lệ của Enron (Ham, nhãn 0) ghép với 17,171 email rác/lừa đảo đã xác thực (Spam, nhãn 1).
- **STEP 1: Preprocessing & Feature Engineering**
  - Chuẩn hóa văn bản nhưng **bảo tồn dấu hiệu an ninh mạng**:
    - URL $\rightarrow$ token ` URL ` (dấu hiệu phishing/spam).
    - Email $\rightarrow$ token ` EMAIL ` (dấu hiệu lừa đảo/spoofing).
    - Số tiền $\rightarrow$ token ` CURRENCY ` (dấu hiệu lừa đảo chuyển tiền BEC).
  - Loại bỏ email rỗng và **3,528 email trùng lặp tuyệt đối** để chống rò rỉ dữ liệu (Data Leakage) giữa train và test.
- **STEP 2: Stratified Train / Test Split**
  - Tách tập dữ liệu theo tỷ lệ 80% Train (24,109 email) / 20% Test (6,028 email) với `stratify=y` và `random_state=42`.
  - Nghiêm cấm fit TF-IDF trên toàn bộ tập dữ liệu; tập Test được giữ độc lập tuyệt đối.
- **STEP 3: Baseline Models (No Imbalance Handling)**
  - Huấn luyện Logistic Regression và Random Forest ở cấu hình mặc định.
- **STEP 4: Imbalance Handling (class_weight="balanced")**
  - Huấn luyện cả hai mô hình có xử lý mất cân bằng lớp bằng trọng số `class_weight="balanced"`.
- **STEP 5: Comprehensive Comparison — Finding the Best**
  - Bảng tổng hợp các chỉ số: Accuracy, Precision, Recall, F1-Score, PR-AUC (Average Precision), False Positives, False Negatives.
- **STEP 6: Security Impact Analysis (FP vs FN)**
  - Phân tích chi phí bất đối xứng trong an ninh mạng:
    - **False Negative (FN - Bỏ sót tấn công):** Email độc hại/phishing lọt vào hộp thư nhân viên $\rightarrow$ Hậu quả **CỰC KỲ NGUY HIỂM** (lộ mật khẩu, ransomware, lừa chuyển tiền BEC).
    - **False Positive (FP - Báo động giả):** Email công việc hợp pháp bị cách ly $\rightarrow$ Hậu quả **GIÁN ĐOẠN CÔNG VIỆC** (lỡ hợp đồng, email khẩn của sếp).
- **STEP 7: Explainable AI — Top Cybersecurity Risk Indicators**
  - Trích xuất các n-gram quan trọng nhất:
    - Từ khóa Spam: `http`, `money`, `software`, `online`, `now`, `your`, `mobile`...
    - Từ khóa Ham (Doanh nghiệp): `enron`, `thanks`, `attached`, `gas`, `please`, `will`, `doc`...
- **STEP 8: Visualizations**
  - Tự động sinh và lưu 4 hình ảnh chất lượng cao vào `results/`:
    - `fig1_data_distribution.png`: Phân bố lớp và độ dài từ.
    - `fig2_confusion_matrices.png`: Ma trận nhầm lẫn 4 mô hình.
    - `fig3_model_comparison.png`: Biểu đồ so sánh hiệu năng.
    - `fig4_precision_recall_curves.png`: Đường cong Precision-Recall.
- **STEP 9: Save Models & Real-Time Prediction Demo**
  - Lưu model vào thư mục `models/` bằng `joblib`.
  - Chạy thử nghiệm phân loại trực tiếp trên 3 kịch bản thực tế: Email nội bộ hợp pháp, Email phishing chiếm đoạt tài khoản Microsoft, Email lừa đảo chuyển tiền BEC khẩn cấp.
- **STEP 10: Final Summary & Cybersecurity Recommendations**
  - Kết luận kỹ thuật và khuyến nghị triển khai thực tế trên Gateway thư điện tử.

---

## 4. Kết quả thực nghiệm thực tế (Trên tập Test 6,028 email)

| Mô hình | Accuracy | Spam Precision | Spam Recall | Spam F1-Score | PR-AUC (AP) | False Positives (Báo sai) | False Negatives (Bỏ lọt) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Baseline)** | **98.95%** | **98.17%** | **99.66%** | **0.9891** | **0.9988** | **54** | **10** |
| **Logistic Regression (Balanced)** | **98.91%** | **98.11%** | **99.66%** | **0.9887** | **0.9988** | **56** | **10** |
| **Random Forest (Baseline)** | 97.16% | 94.82% | 99.45% | 0.9708 | 0.9961 | 158 | 16 |
| **Random Forest (Balanced)** | 96.80% | 94.18% | 99.59% | 0.9681 | 0.9960 | 179 | 12 |

---

## 5. Điểm số học thuật bảo vệ đồ án: Tại sao Logistic Regression tốt hơn Random Forest?

1. **Bản chất không gian văn bản (High-Dimensional & Sparse):**
   - Với TF-IDF trích xuất 50,000 n-gram (1, 2), vector đại diện cho mỗi email có kích thước rất lớn và chứa hầu hết các giá trị bằng 0 (thưa - sparse).
   - **Logistic Regression** xây dựng siêu phẳng tuyến tính trong không gian lồi (convex optimization), tối ưu hóa hàm Log-loss với điều chuẩn L2 ($C=1.0$). Điều này giúp mô hình tổng quát hóa cực kỳ tốt mà không bị overfitting.
   - **Random Forest** phân tách ngẫu nhiên $\sqrt{p}$ đặc trưng tại mỗi nhánh cây. Trong không gian thưa, tập con đặc trưng được chọn ngẫu nhiên thường xuyên chứa toàn các từ có giá trị 0, khiến các cây quyết định bị nông và kém hiệu quả, dẫn đến số ca báo động giả (False Positive) tăng gấp hơn **3 lần** so với Logistic Regression (179 FP so với 56 FP).

2. **Khuyến nghị an ninh:**
   - Trong hệ thống Email Gateway bảo vệ doanh nghiệp, nên triển khai Logistic Regression kết hợp n-gram TF-IDF và điều chỉnh ngưỡng tin cậy (Threshold Tuning) theo từng đối tượng người dùng (ví dụ: siết chặt kiểm tra thư cho ban giám đốc và bộ phận tài chính để chống BEC).
