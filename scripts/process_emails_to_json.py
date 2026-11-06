#!/usr/bin/env python3
"""
=============================================================================
AIC211 - Data Pipeline: Downsample & Extract emails.csv to enron_sample_dataset.json
=============================================================================
Mục đích:
  - Xử lý file dữ liệu lớn (emails.csv 1.32GB hoặc enron_spam_data.csv 49.2MB)
  - Đọc theo từng khối (Chunking) để KHÔNG BAO GIỜ bị tràn bộ nhớ RAM
  - Tách Email Header (From, Subject, Date, Body) chuẩn RFC 822
  - Phân loại 4 nhóm an ninh mạng: BEC (CEO/Invoice Fraud), Phishing, Spam, Ham
  - Tính điểm rủi ro Threat Score (0 - 100) và trạng thái Gateway
  - Trích xuất mẫu cân bằng (Stratified Sampling) ra file JSON & CSV siêu nhẹ cho Web Vercel
=============================================================================
"""

import os
import sys
import re
import json
import email
from email.policy import default
from pathlib import Path
import argparse

def parse_mime_message(raw_message):
    """Trích xuất Header và Thân thư từ raw MIME email format của Enron (1.32GB)."""
    sender = "unknown@enron.com"
    subject = "(No Subject)"
    date_str = "09:00:00"
    body = ""

    if not isinstance(raw_message, str) or not raw_message.strip():
        return sender, subject, date_str, ""

    try:
        msg = email.message_from_string(raw_message, policy=default)
        sender = msg.get("From", "unknown@enron.com")
        subject = msg.get("Subject", "(No Subject)")
        raw_date = msg.get("Date", "")
        
        # Lấy giờ phút từ trường Date
        time_match = re.search(r"\b(\d{2}:\d{2}:\d{2})\b", raw_date)
        if time_match:
            date_str = time_match.group(1)
        else:
            date_str = "10:15:00"

        # Lấy thân thư
        if msg.is_multipart():
            parts = []
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    parts.append(part.get_content())
            body = " ".join(parts)
        else:
            body = msg.get_content()
    except Exception:
        # Fallback bằng regex nếu format bị lỗi
        from_m = re.search(r"^From:\s*(.+)$", raw_message, re.M | re.I)
        sub_m = re.search(r"^Subject:\s*(.+)$", raw_message, re.M | re.I)
        sender = from_m.group(1).strip() if from_m else "unknown@enron.com"
        subject = sub_m.group(1).strip() if sub_m else "(No Subject)"
        
        # Cắt bỏ phần header lấy phần thân
        parts = re.split(r"\n\s*\n", raw_message, maxsplit=1)
        body = parts[1] if len(parts) > 1 else raw_message

    # Dọn dẹp khoảng trắng
    body = re.sub(r"\s+", " ", body).strip()
    return sender, subject, date_str, body

def classify_threat_category(subject, body, original_label=None):
    """
    Phân loại chính xác 4 tầng an ninh mạng AIC211:
      - BEC: CEO fraud, wire transfer, thay đổi số tài khoản ngân hàng, hóa đơn khẩn
      - Phishing: Đánh cắp mật khẩu, link xác thực tài khoản Microsoft 365, mailbox đầy
      - Spam: Quảng cáo thương mại, trúng thưởng, giảm giá voucher, casino
      - Ham: Email công việc trao đổi nghiệp vụ hợp lệ
    """
    text = f"{subject} {body}".lower()

    # BEC Regex Patterns
    bec_patterns = [
        r"wire transfer", r"swift", r"bank account", r"remittance", r"invoice\s*#?\d+",
        r"urgent confidential", r"vendor payment", r"settlement", r"beneficiary",
        r"overdue invoice", r"routing number", r"escrow", r"acquisition"
    ]
    # Phishing Regex Patterns
    phishing_patterns = [
        r"password", r"re-authenticate", r"account (?:suspended|expiry|limited)",
        r"click here", r"login to verify", r"docusign", r"mailbox storage",
        r"it helpdesk", r"security alert", r"update direct deposit", r"w-2"
    ]
    # Spam Patterns
    spam_patterns = [
        r"discount", r"promo", r"winner", r"jackpot", r"free voucher",
        r"limited time offer", r"casino", r"congratulations", r"special promo",
        r"cheap-deals", r"unsubscribe", r"viagra", r"weight loss"
    ]

    is_bec = any(re.search(p, text) for p in bec_patterns)
    is_phishing = any(re.search(p, text) for p in phishing_patterns)
    is_spam = any(re.search(p, text) for p in spam_patterns)

    # Ưu tiên tầng rủi ro cao nhất
    if is_bec and (is_phishing or original_label in [1, '1', 'spam', 'bec']):
        return "bec", 95, "BLOCKED"
    elif is_bec:
        return "bec", 92, "BLOCKED"
    elif is_phishing and (original_label in [1, '1', 'spam', 'phishing'] or is_spam):
        return "phishing", 88, "QUARANTINED"
    elif is_spam or original_label in [1, '1', 'spam']:
        return "spam", 78, "QUARANTINED"
    else:
        return "ham", 5, "DELIVERED"

def process_and_downsample(input_path, output_json, output_csv=None, target_samples=50):
    """
    Đọc file CSV (hỗ trợ chunking cho file 1.32GB) và xuất ra file JSON mẫu.
    """
    input_file = Path(input_path)
    if not input_file.exists():
        print(f"[!] Lỗi: Không tìm thấy file nguồn tại: {input_file.resolve()}")
        print("    Vui lòng kiểm tra lại đường dẫn file emails.csv hoặc enron_spam_data.csv!")
        return False

    file_size_mb = input_file.stat().st_size / (1024 * 1024)
    print(f"[*] Bắt đầu xử lý file: {input_file.name} (Dung lượng: {file_size_mb:.2f} MB)")
    print(f"[*] Mục tiêu: Trích xuất {target_samples} mẫu đại diện phân tầng (Stratified Sampling)")

    import csv
    
    # Bộ đệm phân loại
    buckets = {
        "bec": [],
        "phishing": [],
        "spam": [],
        "ham": []
    }

    per_category_target = max(5, target_samples // 4)
    total_processed = 0

    # Sử dụng csv.reader với max field size lớn để xử lý được cả các email dài trong file 1.32GB
    csv.field_size_limit(sys.maxsize if sys.maxsize < 2**31 else 2**31 - 1)

    with open(input_file, mode="r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        try:
            headers = [h.strip().lower() for h in next(reader)]
        except StopIteration:
            print("[!] File rỗng!")
            return False

        print(f"[*] Headers nhận diện: {headers}")

        is_raw_enron_format = "message" in headers and ("file" in headers or len(headers) == 2)
        message_idx = headers.index("message") if "message" in headers else -1
        subject_idx = headers.index("subject") if "subject" in headers else -1
        body_idx = headers.index("body") if "body" in headers else (headers.index("content") if "content" in headers else -1)
        label_idx = headers.index("spam/ham") if "spam/ham" in headers else (headers.index("label") if "label" in headers else -1)
        sender_idx = headers.index("from") if "from" in headers else (headers.index("sender") if "sender" in headers else -1)

        for row in reader:
            if not row or len(row) == 0:
                continue

            total_processed += 1
            sender, subject, time_str, content = "unknown@enron.com", "(No Subject)", "09:00:00", ""
            orig_label = None

            if is_raw_enron_format and message_idx != -1 and len(row) > message_idx:
                raw_msg = row[message_idx]
                sender, subject, time_str, content = parse_mime_message(raw_msg)
            else:
                # Định dạng bảng chuẩn (enron_spam_data.csv)
                if subject_idx != -1 and len(row) > subject_idx:
                    subject = row[subject_idx].strip()
                if body_idx != -1 and len(row) > body_idx:
                    content = row[body_idx].strip()
                elif message_idx != -1 and len(row) > message_idx:
                    content = row[message_idx].strip()
                if sender_idx != -1 and len(row) > sender_idx:
                    sender = row[sender_idx].strip()
                if label_idx != -1 and len(row) > label_idx:
                    orig_label = row[label_idx].strip()

            if not content or len(content) < 15:
                continue

            category, score, status = classify_threat_category(subject, content, orig_label)

            # Giới hạn số lượng từng nhóm để giữ cân bằng
            if len(buckets[category]) < per_category_target * 2:
                email_id = f"EML-{1000 + len(buckets['bec']) + len(buckets['phishing']) + len(buckets['spam']) + len(buckets['ham']) + 1}"
                record = {
                    "id": email_id,
                    "time": time_str,
                    "sender": sender[:60],
                    "subject": subject[:90] if subject else "(No Subject)",
                    "category": category,
                    "score": score,
                    "status": status,
                    "content": content[:400] + ("..." if len(content) > 400 else "")
                }
                buckets[category].append(record)

            # Dừng sớm nếu đã thu thập đủ mẫu ở mọi nhóm (tiết kiệm CPU)
            if all(len(b) >= per_category_target for b in buckets.values()):
                break

            if total_processed % 5000 == 0:
                print(f"  -> Đã quét {total_processed} dòng | BEC: {len(buckets['bec'])}, Phishing: {len(buckets['phishing'])}, Spam: {len(buckets['spam'])}, Ham: {len(buckets['ham'])}")

    # Gộp mẫu đại diện cân bằng
    final_dataset = []
    for cat in ["bec", "phishing", "spam", "ham"]:
        final_dataset.extend(buckets[cat][:per_category_target])

    print(f"\n[+] Tổng kết mẫu đã trích xuất: {len(final_dataset)} emails")
    print(f"    - BEC: {sum(1 for e in final_dataset if e['category'] == 'bec')}")
    print(f"    - Phishing: {sum(1 for e in final_dataset if e['category'] == 'phishing')}")
    print(f"    - Spam: {sum(1 for e in final_dataset if e['category'] == 'spam')}")
    print(f"    - Ham: {sum(1 for e in final_dataset if e['category'] == 'ham')}")

    # Xuất ra file JSON
    out_json = Path(output_json)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(final_dataset, f, indent=2, ensure_ascii=False)
    print(f"[✓] Đã tạo file JSON siêu nhẹ: {out_json.resolve()} ({out_json.stat().st_size / 1024:.1f} KB)")

    # Xuất file CSV nếu yêu cầu
    if output_csv:
        out_csv = Path(output_csv)
        out_csv.parent.mkdir(parents=True, exist_ok=True)
        with open(out_csv, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "time", "sender", "subject", "category", "score", "status", "content"])
            for e in final_dataset:
                writer.writerow([e["id"], e["time"], e["sender"], e["subject"], e["category"], e["score"], e["status"], e["content"]])
        print(f"[✓] Đã tạo file CSV mẫu: {out_csv.resolve()} ({out_csv.stat().st_size / 1024:.1f} KB)")

    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Downsample emails.csv to enron_sample_dataset.json for Vercel Web Dashboard")
    parser.add_argument("--input", default="datasets/enron_spam_data.csv", help="Đường dẫn file gốc (emails.csv hoặc enron_spam_data.csv)")
    parser.add_argument("--samples", type=int, default=32, help="Tổng số mẫu email muốn trích xuất (mặc định: 32 emails cân bằng)")
    parser.add_argument("--out-json", default="public/data/enron_sample_dataset.json", help="Đường dẫn file JSON xuất ra")
    parser.add_argument("--out-csv", default="public/data/enron_sample_dataset.csv", help="Đường dẫn file CSV xuất ra")
    
    args = parser.parse_args()

    # Tự động tìm file nếu chưa có
    chosen_input = args.input
    if not Path(chosen_input).exists():
        candidates = [
            "datasets/emails.csv",
            "emails.csv",
            "datasets/enron_spam_data.csv",
            "enron_spam_data.csv",
            "public/assets/aistudio/emails.csv"
        ]
        for c in candidates:
            if Path(c).exists():
                chosen_input = c
                break

    process_and_downsample(
        input_path=chosen_input,
        output_json=args.out_json,
        output_csv=args.out_csv,
        target_samples=args.samples
    )
