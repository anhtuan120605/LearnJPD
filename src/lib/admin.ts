/**
 * Quản lý quyền Quản trị viên (Admin)
 * Chỉ cấp quyền duy nhất cho tài khoản email được chỉ định.
 */

export const PRIMARY_ADMIN_EMAIL = 'anhtuan120605@gmail.com';

// Danh sách email admin bổ sung từ biến môi trường (nếu có)
const envAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Kiểm tra xem một email có phải là Admin không
 * Chỉ DUY NHẤT anhtuan120605@gmail.com (hoặc VITE_ADMIN_EMAILS) mới có quyền.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (lower === PRIMARY_ADMIN_EMAIL.toLowerCase()) return true;
  if (envAdminEmails.includes(lower)) return true;
  return false;
}

/**
 * Kiểm tra quyền Admin của tài khoản người dùng hiện tại
 */
export function checkIsAdmin(userEmail?: string | null): boolean {
  return isAdminEmail(userEmail);
}
