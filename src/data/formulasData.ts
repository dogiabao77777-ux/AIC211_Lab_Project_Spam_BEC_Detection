import { MathFormulaItem } from '../types';

export const MATHEMATICAL_FORMULAS: MathFormulaItem[] = [
  {
    id: "tf-formula",
    title: "1. Term Frequency (Tần số xuất hiện từ t trong văn bản d)",
    category: "nlp",
    formulaLaTeX: "TF(t, d) = \\frac{f_{t, d}}{\\sum_{t' \\in d} f_{t', d}} \\quad \\text{hoặc Sublinear:} \\quad TF_{\\text{sub}}(t, d) = 1 + \\ln(f_{t, d}) \\; (\\forall f_{t,d} > 0)",
    variables: [
      { name: "f_{t, d}", meaning: "Số lần từ khóa hoặc n-gram t xuất hiện trong văn bản email d" },
      { name: "\\sum_{t' \\in d} f_{t', d}", meaning: "Tổng số từ xuất hiện trong văn bản d (chuẩn hóa theo độ dài email)" },
      { name: "TF_{sub}", meaning: "Biến đổi logarit dưới tuyến tính (sublinear tf=True) để triệt tiêu ảnh hưởng của việc kẻ tấn công lặp từ quá nhiều lần (Keyword Stuffing)" }
    ],
    mathExplanation: "Trong xử lý ngôn ngữ tự nhiên cho an ninh mạng, một từ xuất hiện 20 lần không có nghĩa là nguy hiểm gấp 20 lần so với xuất hiện 1 lần. Công thức Sublinear TF giúp giảm độ dốc tăng trưởng giá trị đặc trưng, ngăn chặn hiện tượng làm sai lệch trọng số do email quá dài.",
    cybersecuritySignificance: "Ngăn chặn các kỹ thuật lẩn tránh (Evasion Attacks) khi kẻ tấn công cố tình spam lặp đi lặp lại một từ khóa lành tính hoặc từ khóa đe dọa trong email."
  },
  {
    id: "idf-formula",
    title: "2. Inverse Document Frequency (Nghịch đảo tần suất văn bản mượt)",
    category: "nlp",
    formulaLaTeX: "IDF(t, D) = \\ln\\left( \\frac{1 + |D|}{1 + |\\{d \\in D : t \\in d\\}|} \\right) + 1",
    variables: [
      { name: "|D|", meaning: "Tổng số lượng email trong toàn bộ tập ngữ cảnh huấn luyện (ví dụ: 24,109 email)" },
      { name: "|\\{d \\in D : t \\in d\\}|", meaning: "Số lượng email có chứa từ khóa t" },
      { name: "+ 1", meaning: "Smooth IDF (làm mịn Laplace) ngăn chặn lỗi chia cho 0 và tránh việc IDF bị triệt tiêu về 0" }
    ],
    mathExplanation: "Từ xuất hiện ở hầu hết mọi email (như 'the', 'is', 'com') sẽ có mẫu số xấp xỉ tử số, khiến ln(1) = 0 và IDF nhỏ nhất. Ngược lại, các từ đặc thù gian lận tài chính (như 'wire_transfer', 'routing_number', 'confidential_acquisition') chỉ xuất hiện trong rất ít email sẽ có IDF rất cao.",
    cybersecuritySignificance: "Tự động hạ thấp trọng số của các stop-word thông thường trong giao tiếp doanh nghiệp và tập trung độ nhạy vào các token dấu hiệu xâm nhập (IoC)."
  },
  {
    id: "tfidf-composite",
    title: "3. Composite TF-IDF Weight & L2 Vector Normalization",
    category: "nlp",
    formulaLaTeX: "W(t, d, D) = TF(t, d) \\times IDF(t, D), \\quad \\mathbf{v}_{\\text{norm}} = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|_2} = \\frac{\\mathbf{v}}{\\sqrt{\\sum_{j=1}^M v_j^2}}",
    variables: [
      { name: "W(t, d, D)", meaning: "Trọng số kết hợp biểu diễn mức độ quan trọng của từ t đối với email d" },
      { name: "\\mathbf{v}_{\\text{norm}}", meaning: "Vector đặc trưng văn bản đã chuẩn hóa Euclidean độ dài bằng 1" },
      { name: "M", meaning: "Kích thước không gian từ điển (max_features = 50,000 unigrams + bigrams)" }
    ],
    mathExplanation: "Chuẩn hóa L2 triệt tiêu hoàn toàn sự chênh lệch về độ dài email giữa thư ngắn (ngắn gọn chỉ 1 dòng yêu cầu chuyển tiền) và thư báo cáo dài hàng nghìn từ, đưa tất cả về cùng mặt cầu đơn vị.",
    cybersecuritySignificance: "Đặc biệt hiệu quả cho tấn công BEC, bởi vì thư BEC thực tế thường rất ngắn (dưới 50 từ) nhằm ép nạn nhân hành động nhanh chóng mà không kịp suy xét."
  },
  {
    id: "logreg-sigmoid",
    title: "4. Logistic Regression Sigmoid Hypothesis (Hàm Sigmoid xác suất)",
    category: "ml",
    formulaLaTeX: "P(Y=1 | \\mathbf{x}) = \\sigma(\\mathbf{w}^T \\mathbf{x} + b) = \\frac{1}{1 + e^{-(\\sum_{j=1}^M w_j x_j + b)}}",
    variables: [
      { name: "\\mathbf{w}", meaning: "Vector trọng số học được của các đặc trưng n-gram (w_j > 0: dấu hiệu tấn công; w_j < 0: dấu hiệu lành tính)" },
      { name: "\\mathbf{x}", meaning: "Vector TF-IDF thưa của email cần kiểm tra (chiều M = 50,000)" },
      { name: "b", meaning: "Hệ số chặn (bias / intercept)" },
      { name: "P(Y=1|\\mathbf{x})", meaning: "Xác suất email là hiểm họa (Spam / Phishing / BEC)" }
    ],
    mathExplanation: "Sigmoid ánh xạ tích vô hướng tuyến tính từ (-inf, +inf) về đoạn xác suất trơn [0, 1]. Do bài toán tối ưu là hàm lồi nghiêm ngặt (Convex Optimization), Logistic Regression không bị kẹt ở cực tiểu cục bộ và đạt độ ổn định toán học tuyệt đối.",
    cybersecuritySignificance: "Cung cấp khả năng giải thích (XAI) minh bạch: mỗi trọng số w_j thể hiện trực tiếp mức tăng tỷ lệ log-odds của mối đe dọa khi từ khóa đó xuất hiện, cho phép chuyên viên SOC truy vết ngay lập tức."
  },
  {
    id: "class-weights",
    title: "5. Inverse Class-Balancing Weight (Trọng số nghịch đảo cân bằng lớp)",
    category: "imbalance",
    formulaLaTeX: "w_j = \\frac{N_{\\text{total}}}{K \\times N_j} \\implies w_{\\text{BEC}} = \\frac{24,109}{2 \\times 1,675} \\approx 7.197",
    variables: [
      { name: "N_{\\text{total}}", meaning: "Tổng số lượng mẫu huấn luyện (ví dụ: 24,109 email trong tập Train)" },
      { name: "K", meaning: "Số lượng lớp (K = 2: Ham và Threat/Spam/BEC)" },
      { name: "N_j", meaning: "Số lượng mẫu của lớp thứ j trong tập huấn luyện" },
      { name: "w_{\\text{BEC}}", meaning: "Hệ số phạt nhân thêm khi mô hình đoán sai mẫu hiểm họa BEC (~7.2 lần)" }
    ],
    mathExplanation: "Khi tỷ lệ lớp thiểu số chỉ chiếm <7% toàn bộ luồng email, thuật toán tối ưu tiêu chuẩn sẽ có xu hướng đoán toàn bộ là 'Lành tính' (Ham) để đạt Accuracy cao giả tạo. Bằng việc nhân hệ số w_j vào gradient descent, mỗi lần bỏ lọt 1 email BEC, mô hình bị phạt gấp 7.2 lần so với đoán nhầm email thông thường.",
    cybersecuritySignificance: "Buộc mô hình phải đặc biệt cảnh giác với các dấu hiệu lừa đảo BEC mà không cần can thiệp tạo dữ liệu nhân tạo gây nhiễu (như SMOTE trong không gian từ vựng rời rạc)."
  },
  {
    id: "weighted-bce",
    title: "6. Weighted Binary Cross-Entropy Loss (Hàm mất mát entropy chéo có trọng số)",
    category: "imbalance",
    formulaLaTeX: "\\mathcal{L}_{\\text{WBCE}}(\\mathbf{w}, b) = -\\frac{1}{N} \\sum_{i=1}^N \\left[ w_{y_i} \\cdot \\left( y_i \\ln(\\hat{y}_i) + (1 - y_i) \\ln(1 - \\hat{y}_i) \\right) \\right] + \\frac{\\lambda}{2} \\|\\mathbf{w}\\|_2^2",
    variables: [
      { name: "y_i \\in \\{0, 1\\}", meaning: "Nhãn thực tế (0: Ham, 1: Threat/Spam/BEC)" },
      { name: "\\hat{y}_i = \\sigma(\\mathbf{w}^T \\mathbf{x}_i + b)", meaning: "Xác suất dự đoán hiểm họa từ mô hình" },
      { name: "w_{y_i}", meaning: "Trọng số phạt tương ứng với nhãn lớp y_i" },
      { name: "\\frac{\\lambda}{2} \\|\\mathbf{w}\\|_2^2", meaning: "Thành phần điều chuẩn L2 (Ridge Regularization) ngăn ngừa hiện tượng quá khớp (Overfitting)" }
    ],
    mathExplanation: "Hàm mất mát định lượng khoảng cách thông tin Kullback-Leibler giữa phân phối thực tế và phân phối dự đoán. Đạo hàm của hàm mất mát có trọng số điều khiển bước nhảy gradient dW cập nhật mạnh hơn khi gặp các mẫu nguy hiểm.",
    cybersecuritySignificance: "Tối ưu hóa trực tiếp độ nhạy an ninh (Recall) mà vẫn duy trì tính tổng quát hóa trên dữ liệu email mới chưa từng thấy."
  },
  {
    id: "asymmetric-cost",
    title: "7. Asymmetric Security Cost Penalty (Hàm phạt chi phí an ninh phi đối xứng)",
    category: "security",
    formulaLaTeX: "\\text{Cost}_{\\text{SOC}}(\\tau) = C_{\\text{FP}} \\times \\text{FP}(\\tau) + C_{\\text{FN}} \\times \\text{FN}(\\tau) \\quad \\text{với } C_{\\text{FN}} \\gg C_{\\text{FP}} \\; (C_{\\text{FN}} \\approx 100 \\cdot C_{\\text{FP}})",
    variables: [
      { name: "C_{\\text{FP}}", meaning: "Chi phí của 1 lỗi Báo động giả (False Positive: Chặn nhầm email hợp lệ, gây gián đoạn công việc, tốn thời gian SOC kiểm tra lại)" },
      { name: "C_{\\text{FN}}", meaning: "Chi phí của 1 lỗi Lọt hiểm họa (False Negative: Bỏ sót thư BEC chuyển tiền, gây thất thoát hàng trăm nghìn hoặc hàng triệu USD)" },
      { name: "\\tau", meaning: "Ngưỡng phân loại xác suất (Decision Threshold)" }
    ],
    mathExplanation: "Trong bài toán thông thường, ngưỡng phân loại mặc định là 0.5. Tuy nhiên trong an ninh mạng, vì C_FN >> C_FP, ngưỡng tối ưu phải được hạ thấp xuống tau* sao cho tổng tổn thất vận hành đạt giá trị nhỏ nhất: tau* = arg min Cost_SOC(tau).",
    cybersecuritySignificance: "Nghiên cứu của đồ án xác định ngưỡng tối ưu tau = 0.42, giúp đẩy Spam Recall lên 99.88% trong khi vẫn giữ False Positive Rate ở mức cực thấp 0.018%."
  },
  {
    id: "evaluation-metrics",
    title: "8. Cybersecurity Performance Evaluation Metrics",
    category: "evaluation",
    formulaLaTeX: "\\text{Precision} = \\frac{TP}{TP + FP}, \\quad \\text{Recall} = \\frac{TP}{TP + FN}, \\quad \\text{FPR} = \\frac{FP}{FP + TN}, \\quad F_1 = \\frac{2 \\cdot P \\cdot R}{P + R}",
    variables: [
      { name: "TP (True Positive)", meaning: "Hiểm họa BEC/Spam được phát hiện và ngăn chặn thành công" },
      { name: "TN (True Negative)", meaning: "Email doanh nghiệp hợp lệ được phân phối an toàn vào hòm thư" },
      { name: "FP (False Positive)", meaning: "Email hợp lệ bị cách ly oan (Báo động giả)" },
      { name: "FN (False Negative)", meaning: "Hiểm họa lọt qua cổng kiểm soát vào hòm thư nạn nhân (Bỏ lọt)" }
    ],
    mathExplanation: "Không thể chỉ dùng Accuracy (Độ chính xác tổng thể) để đánh giá hệ thống phòng thủ email vì dữ liệu mất cân bằng. Hệ thống bắt buộc phải báo cáo đầy đủ cả Precision, Recall, FPR, F1 và PR-AUC (Average Precision) trên tập kiểm thử cô lập.",
    cybersecuritySignificance: "Tiêu chuẩn vàng trong vận hành Cổng an ninh thư điện tử (Secure Email Gateway - SEG) chuẩn quốc tế."
  }
];
