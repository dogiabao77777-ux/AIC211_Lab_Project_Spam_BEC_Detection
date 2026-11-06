import { EmailRecord, ModelMetric, XAIToken } from '../types';

export const INITIAL_EMAILS: EmailRecord[] = [
  {
    id: "EML-1001",
    time: "10:42:15",
    sender: "executive-ceo@holding-corp-partners.com",
    subject: "URGENT CONFIDENTIAL: Executive Wire Transfer ($85,000)",
    category: "bec",
    score: 98,
    status: "BLOCKED",
    content: "URGENT CONFIDENTIAL REQUEST: Executive Wire Transfer required before EOD ($85,000). Please process immediately to foreign vendor account for project acquisition. Do not discuss over phone as meeting is in progress."
  },
  {
    id: "EML-1002",
    time: "10:38:02",
    sender: "security-alert@microsoft-outlook-verify.com",
    subject: "CRITICAL: Password Expiry Notification - Re-authenticate",
    category: "phishing",
    score: 88,
    status: "QUARANTINED",
    content: "CRITICAL ACCOUNT SUSPENSION NOTICE: Your Microsoft 365 password expires today. Click here http://outlook-login-portal-verify.com to confirm your password credentials immediately to prevent email disruption."
  },
  {
    id: "EML-1003",
    time: "10:29:44",
    sender: "vince.kaminski@enron.com",
    subject: "Revised Q3 Financial Forecast Model & Strategy Review",
    category: "ham",
    score: 4,
    status: "DELIVERED",
    content: "Hi Team, attached is the revised Q3 Financial Forecast report. The strategy review meeting is scheduled for tomorrow at 2:00 PM on Teams. Please let me know if you have questions."
  },
  {
    id: "EML-1004",
    time: "10:15:19",
    sender: "special-promo@discount-software-hub.net",
    subject: "Exclusive 70% Discount Voucher on Enterprise Licenses",
    category: "spam",
    score: 82,
    status: "QUARANTINED",
    content: "LIMITED TIME EXCLUSIVE PROMO OFFER! Get 70% discount on all software licenses today only! Click http://cheap-deals-online.net to claim your free voucher now!"
  },
  {
    id: "EML-1005",
    time: "09:58:11",
    sender: "billing@vendor-supply-chain.org",
    subject: "Updated Bank Wire Instructions for Pending Invoice #84102",
    category: "bec",
    score: 96,
    status: "BLOCKED",
    content: "Important update regarding outstanding invoice. Our banking partner has changed due to routine financial audit. Please route the wire transfer of $42,600 to new account details attached immediately."
  },
  {
    id: "EML-1006",
    time: "09:44:30",
    sender: "phillip.allen@enron.com",
    subject: "Gas Trading Desk Daily Schedule & Allocation Summary",
    category: "ham",
    score: 6,
    status: "DELIVERED",
    content: "Please find the daily gas allocation sheets for our West power desk. Thanks for coordinating the transport nominations with our pipeline operators."
  },
  {
    id: "EML-1007",
    time: "09:30:15",
    sender: "service@it-helpdesk-portal365.online",
    subject: "Action Required: Verify Suspended Mailbox Storage",
    category: "phishing",
    score: 86,
    status: "QUARANTINED",
    content: "Your mailbox has exceeded the storage allocation limit. Inbound emails have been paused. Verify your credentials at http://verify-storage-webmail.com to resume normal email receipt."
  },
  {
    id: "EML-1008",
    time: "09:12:44",
    sender: "louise.kitchen@enron.com",
    subject: "Weekly Trading Executive Summary & Legal Notes",
    category: "ham",
    score: 5,
    status: "DELIVERED",
    content: "Attached are the meeting minutes from yesterday's risk committee session. Please review section 4 before the board call tomorrow morning."
  }
];

export const MODEL_METRICS_DATA: ModelMetric[] = [
  {
    Model: "Logistic Regression (Balanced)",
    Strategy: "class_weight='balanced'",
    Accuracy: 0.9892,
    Precision: 0.9812,
    Recall: 0.9988,
    F1Score: 0.9899,
    PRAUC: 0.9992,
    FP: 56,
    FN: 3,
    Description: "Mô hình sản xuất khuyến nghị: Phạt ngược tần số lớp (~7.2x), bắt 99.88% mối đe dọa với chỉ 56 False Positives trên 6,028 mẫu test."
  },
  {
    Model: "Logistic Regression (Baseline)",
    Strategy: "Standard Cross-Entropy",
    Accuracy: 0.9894,
    Precision: 0.9817,
    Recall: 0.9966,
    F1Score: 0.9891,
    PRAUC: 0.9988,
    FP: 54,
    FN: 10,
    Description: "Đường cơ sở tuyến tính chuẩn: Độ chính xác tổng thể cao nhất (98.94%), nhưng để lọt 10 mẫu tấn công (FN) do không ưu tiên lớp BEC."
  },
  {
    Model: "Logistic Regression (Combined)",
    Strategy: "Undersample + Balanced",
    Accuracy: 0.9889,
    Precision: 0.9807,
    Recall: 0.9969,
    F1Score: 0.9886,
    PRAUC: 0.9988,
    FP: 57,
    FN: 9,
    Description: "Kết hợp Random Undersampling tập Train với class balancing, đem lại sự cân bằng gradient tuyệt đối."
  },
  {
    Model: "Logistic Regression (Undersample)",
    Strategy: "Random Undersampling",
    Accuracy: 0.9867,
    Precision: 0.9768,
    Recall: 0.9959,
    F1Score: 0.9862,
    PRAUC: 0.9985,
    FP: 71,
    FN: 12,
    Description: "Cắt giảm lớp đa số (Ham) trên Train bằng số mẫu Spam; huấn luyện nhanh nhưng mất một phần phương sai từ vựng Benign."
  },
  {
    Model: "Random Forest (Baseline)",
    Strategy: "Default Ensemble (150 trees)",
    Accuracy: 0.9711,
    Precision: 0.9482,
    Recall: 0.9945,
    F1Score: 0.9708,
    PRAUC: 0.9964,
    FP: 162,
    FN: 16,
    Description: "Ensemble không gian thưa: Do chỉ lấy mẫu sqrt(p) tính năng tại mỗi node, gặp phải đa số số 0 dẫn đến 162 FP (gấp 3.0x so với LR)."
  },
  {
    Model: "Random Forest (Balanced)",
    Strategy: "class_weight='balanced'",
    Accuracy: 0.9705,
    Precision: 0.9470,
    Recall: 0.9948,
    F1Score: 0.9703,
    PRAUC: 0.9961,
    FP: 166,
    FN: 15,
    Description: "Cân bằng trọng số cây quyết định: Tăng nhẹ Recall nhưng chi phí cảnh báo giả vẫn ở mức cao (166 FP)."
  },
  {
    Model: "Random Forest (Combined)",
    Strategy: "Undersample + Balanced",
    Accuracy: 0.9688,
    Precision: 0.9445,
    Recall: 0.9938,
    F1Score: 0.9685,
    PRAUC: 0.9957,
    FP: 173,
    FN: 18,
    Description: "Thử nghiệm kết hợp trên Random Forest: Tỷ lệ báo động giả tăng lên 173 FP do mất mát dữ liệu đào tạo."
  },
  {
    Model: "Random Forest (Undersample)",
    Strategy: "Random Undersampling",
    Accuracy: 0.9675,
    Precision: 0.9420,
    Recall: 0.9931,
    F1Score: 0.9669,
    PRAUC: 0.9952,
    FP: 181,
    FN: 20,
    Description: "Undersampling làm suy yếu tính đa dạng của cây quyết định trên dữ liệu văn bản thưa 50,000 chiều."
  }
];

export const TOP_XAI_TOKENS: XAIToken[] = [
  { word: "wire_transfer", weight: 3.82, type: "threat", signal: "BEC Yêu cầu chuyển tiền tài chính khẩn cấp" },
  { word: "confidential_request", weight: 3.21, type: "threat", signal: "Social Engineering & Gây áp lực cô lập" },
  { word: "__URL_LINK__ verify", weight: 2.94, type: "threat", signal: "Credential Phishing thu thập thông tin đăng nhập" },
  { word: "password expire", weight: 2.41, type: "threat", signal: "Cảnh báo hết hạn tài khoản giả mạo" },
  { word: "urgent eod", weight: 2.38, type: "threat", signal: "Tạo cảm giác cấp bách cuối ngày làm việc" },
  { word: "acquisition pending", weight: 2.15, type: "threat", signal: "Cớ mua lại doanh nghiệp bí mật" },
  { word: "routing number", weight: 2.05, type: "threat", signal: "Thông tin tài khoản ngân hàng chuyển đổi" },
  { word: "meeting scheduled", weight: -2.52, type: "benign", signal: "Bối cảnh doanh nghiệp họp định kỳ nội bộ" },
  { word: "attached forecast", weight: -3.44, type: "benign", signal: "Hồ sơ dự báo tài chính hợp lệ" },
  { word: "enron gas desk", weight: -4.12, type: "benign", signal: "Hoạt động điều phối gas tiêu chuẩn" },
  { word: "thanks regards", weight: -3.85, type: "benign", signal: "Văn phong thư từ giao tiếp thường nhật" },
  { word: "strategy review", weight: -2.18, type: "benign", signal: "Thảo luận chiến lược nội bộ tổ chức" }
];

export const VOCABULARY_WEIGHTS: Record<string, number> = {
  // Threat indicators
  'urgent': 2.8, 'confidential': 2.4, 'wire': 3.5, 'transfer': 3.1, 'acquisition': 2.2,
  'expiration': 2.5, 'expire': 2.3, 'password': 2.9, 'credentials': 3.2, 'suspension': 2.7,
  'click': 1.8, 'immediately': 2.1, 'http': 3.0, 'https': 1.2, 'confirm': 1.9, 'login': 2.8,
  'verify': 2.4, 'promo': 2.0, 'discount': 1.9, 'free': 1.8, 'voucher': 2.1, 'claim': 2.0,
  'account': 1.5, 'vendor': 1.9, 'eod': 2.0, '$85,000': 3.4, '$42,600': 3.2, 'offer': 1.6,
  'routing': 2.3, 'invoice': 2.1, 'suspended': 2.6, 'storage': 1.8, 'overdue': 2.1,
  
  // Benign indicators
  'attached': -2.1, 'forecast': -2.5, 'meeting': -2.8, 'teams': -2.4, 'scheduled': -2.2,
  'report': -1.9, 'questions': -1.8, 'review': -1.7, 'revised': -1.5, 'strategy': -1.6,
  'hi': -0.8, 'team': -1.2, 'thanks': -1.5, 'regards': -1.4, 'project': -0.5,
  'enron': -4.5, 'kaminski': -3.8, 'allocation': -2.1, 'pipeline': -1.9, 'desk': -1.8
};
