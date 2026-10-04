# Hướng Dẫn Thiết Lập Supabase Cho LearnJPD

LearnJPD hỗ trợ đồng bộ tiến độ học tập trên đám mây thông qua **Supabase**. Dưới đây là các bước thiết lập nhanh trong vòng 3 phút:

---

## 1. Tạo Project trên Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (hoặc tạo tài khoản miễn phí).
2. Nhấn **"New project"**.
3. Điền tên dự án (ví dụ: `LearnJPD`) và tạo mật khẩu Database. Chọn khu vực gần Việt Nam (như `Singapore`).
4. Nhấn **"Create new project"** và đợi khoảng 1-2 phút để Supabase khởi tạo.

---

## 2. Khởi tạo Database Schema
1. Trong giao diện Supabase Dashboard, điều hướng đến mục **SQL Editor** (biểu tượng `>_` ở thanh menu bên trái).
2. Nhấn **"New query"**.
3. Mở file [schema.sql](schema.sql), sao chép toàn bộ nội dung và dán vào SQL Editor.
4. Nhấn **"Run"** (hoặc bấm `Cmd + Enter` / `Ctrl + Enter`).
5. Kết quả báo `Success. No rows returned` là bạn đã tạo xong bảng `profiles`, `user_progress` và cấu hình bảo mật RLS!

---

## 3. Cấu hình Biến Môi Trường (.env)
1. Trong Supabase Dashboard, vào mục **Project Settings** (biểu tượng bánh răng ⚙️ ở góc dưới bên trái) -> chọn **API**.
2. Sao chép hai thông số:
   - **Project URL**: Ví dụ `https://xyzcompany.supabase.co`
   - **anon / public key**: Chuỗi key công khai bắt đầu bằng `eyJ...`
3. Trong thư mục gốc của dự án `LearnJPD`, tạo file `.env` (dựa trên mẫu `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Khởi động lại ứng dụng nếu đang chạy (`npm run dev`).

---

## 4. Bật Xác Thực Người Dùng (Auth)
1. Vào **Authentication** -> **Providers** -> Chọn **Email**.
2. Đảm bảo mục **"Enable Email provider"** đang bật (ON).
3. *(Tùy chọn)* Nếu muốn người dùng đăng nhập ngay mà không cần xác nhận email trong lúc thử nghiệm: Tắt mục **"Confirm email"** -> Nhấn **Save**.

---

## 5. Trải nghiệm
- Khi mở LearnJPD, nhấn vào biểu tượng đám mây hoặc nút **"Đăng nhập"** trên thanh Navbar.
- Đăng ký tài khoản và đăng nhập.
- Toàn bộ từ vựng đã thuộc, Kanji yêu thích, chuỗi ngày streak và điểm số bài thi sẽ tự động được đồng bộ an toàn và tức thì lên cơ sở dữ liệu Supabase!
