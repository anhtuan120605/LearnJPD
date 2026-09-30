# 🎌 LearnJPD - Ứng Dụng Học Toàn Diện Tiếng Nhật & Kanji (Minna no Nihongo N5 ➔ N1)

> **LearnJPD** được xây dựng chuẩn mực theo cấu trúc các tập giáo trình của nhà xuất bản **3A Corporation (Minna no Nihongo)** kết hợp trọn bộ kho **Kanji & Từ vựng chuyên sâu chuẩn JLPT N5 đến N1**, tích hợp 5 chế độ học thông minh và đồng bộ đám mây **Supabase**.

---

## 📚 1. Cấu Trúc Các Tập Giáo Trình Chuẩn Minna no Nihongo

Ứng dụng chia rõ ràng thành **5 phân hệ tập sách**:

### 1. 🟢 Minna no Nihongo Sơ Cấp 1 (Bài 1 ➔ Bài 25)
* **Trình độ:** **JLPT N5**
* **Số lượng bài:** 25 bài học
* **Nội dung:** Toàn bộ từ vựng cơ bản Minna 1 kèm Hiragana, Kanji, Âm Hán Việt, Nghĩa tiếng Việt và **câu ví dụ ngữ pháp / Kaiwa theo từng bài**.

### 2. 🔵 Minna no Nihongo Sơ Cấp 2 (Bài 26 ➔ Bài 50)
* **Trình độ:** **JLPT N4**
* **Số lượng bài:** 25 bài học (từ Bài 26 đến Bài 50)
* **Nội dung:** Toàn bộ từ vựng Minna 2 hoàn thành toàn bộ ngữ pháp và từ vựng sơ cấp kèm ví dụ ngữ cảnh thực tế.

### 3. 🟡 Minna no Nihongo Trung Cấp 1 (Chūkyū 1 - Bài 1 ➔ Bài 12)
* **Trình độ:** **JLPT N3**
* **Nội dung:** Từ vựng trung cấp N3 phục vụ giao tiếp thực tế và ôn thi JLPT N3.

### 4. 🟠 Minna no Nihongo Trung Cấp 2 (Chūkyū 2 - Bài 13 ➔ Bài 24)
* **Trình độ:** **JLPT N2**
* **Nội dung:** Toàn bộ từ vựng trung cao cấp N2 của bộ sách Minna Trung cấp 2.

### 5. 🔴 Giáo Trình Chuyên Sâu Cao Cấp N1 (Trọn bộ 108 bài học)
* **Trình độ:** **JLPT N1**
* **Số lượng từ:** **2.699 từ vựng** cao cấp
* **Nội dung:** Giáo trình luyện thi cao cấp chuẩn JLPT N1 dành cho người học chuyên sâu.

---

## 🎯 2. Trọn Bộ 5 Chế Độ Học Tập Hiện Đại

1. **Thẻ Flashcard 3D**: Lật thẻ 3 chiều mượt mà, mặt trước hiển thị Kanji/Kana, mặt sau hiển thị Âm Hán Việt, nghĩa tiếng Việt và **câu ví dụ ngữ pháp / Kaiwa** kèm phát âm native audio.
2. **Trắc nghiệm (Quiz)**: Làm bài kiểm tra phản xạ 4 đáp án với bộ đếm giờ, chấm điểm tự động và hiệu ứng ăn mừng pháo hoa.
3. **Nhồi nhét (Cramming Mode)**: Giao diện thẻ tối phong cách cao cấp, hỗ trợ gõ Romaji tự động chuyển đổi sang Hiragana theo thời gian thực (IME), hệ thống vạch gạch chân `_ _ _` và trợ giúp gợi ý `(0/3)`.
4. **Dịch câu (Sentence Puzzle)**: Sắp xếp các cụm từ tiếng Nhật để dịch câu ví dụ ngữ pháp hoặc câu Kaiwa của bài học.
5. **Nghe đuổi (Shadowing Mode)**: Luyện phát âm và ngữ điệu người bản xứ với tính năng tùy chỉnh tốc độ (0.8x, 1.0x, 1.2x), số lần lặp lại, khoảng nghỉ delay, chế độ "Nghe mù" và chuyển đổi giữa **Nghe từ vựng** và **Nghe câu / Kaiwa**.

---

## 🀄 3. Kho Kanji Chuyên Sâu Theo Cấp Độ (N5 ➔ N1)

Tích hợp hơn **2.100 chữ Hán**:
* **JLPT N5**: 79 chữ căn bản
* **JLPT N4**: 166 chữ sơ trung cấp
* **JLPT N3**: 367 chữ trung cấp
* **JLPT N2**: 367 chữ trung cao cấp
* **JLPT N1**: 1.232 chữ cao cấp
* **Chi tiết mỗi chữ:** Âm Hán Việt in hoa, Âm Onyomi, Âm Kunyomi, Số nét, Bộ thủ cấu thành và Nghĩa tiếng Việt.

---

## ☁️ 4. Đồng Bộ Đám Mây Với Supabase

LearnJPD hỗ trợ lưu trữ cục bộ (Offline LocalStorage) và tự động đồng bộ đám mây với **Supabase**:
- Tệp Schema SQL đã chuẩn bị sẵn tại: [`supabase/schema.sql`](file:///Users/ghan81/Downloads/LearnJPD/supabase/schema.sql)
- Hướng dẫn thiết lập từng bước: [`supabase/README.md`](file:///Users/ghan81/Downloads/LearnJPD/supabase/README.md)

### Cấu hình `.env`:
Tạo file `.env` ở thư mục gốc:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🚀 5. Khởi Chạy Dự Án

```bash
# Cài đặt thư viện (nếu mới clone)
npm install

# Khởi chạy máy chủ phát triển
npm run dev

# Build kiểm tra đóng gói
npm run build
```

Mở trình duyệt tại: **`http://localhost:5173`**
