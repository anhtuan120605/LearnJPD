import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL và Anon Key lấy từ .env hoặc cấu hình lưu trong trình duyệt
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const localUrl = typeof window !== 'undefined' ? (localStorage.getItem('learn_jpd_supabase_url') || '') : '';
const localKey = typeof window !== 'undefined' ? (localStorage.getItem('learn_jpd_supabase_anon_key') || '') : '';

export const supabaseUrl = envUrl || localUrl;
export const supabaseAnonKey = envKey || localKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function initSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (err) {
    console.error('Lỗi khởi tạo Supabase:', err);
    return null;
  }
}

export const supabase = initSupabase();

// Hỗ trợ người dùng nhập nhanh thông số từ giao diện nếu chưa thiết lập .env
export function saveCustomSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('learn_jpd_supabase_url', url.trim());
    localStorage.setItem('learn_jpd_supabase_anon_key', key.trim());
    window.location.reload();
  }
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('learn_jpd_supabase_url');
    localStorage.removeItem('learn_jpd_supabase_anon_key');
    window.location.reload();
  }
}
