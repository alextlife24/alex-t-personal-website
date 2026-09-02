/**
 * Supabase 連線設定。
 *
 * 這兩個值是 public 的（anon key 受 Row Level Security 保護），
 * 因此可以安全地出現在瀏覽器端。
 *
 * SUPABASE_SERVICE_ROLE_KEY 絕對不會在這裡出現，
 * 只有 scripts/seed.ts 這種在你自己電腦上執行的腳本才會讀取它。
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 尚未設定環境變數時回傳 false。
 * 前台會自動退回 src/data 的靜態內容，後台會顯示設定指引，
 * 網站不會因此壞掉。
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Supabase Storage 的 bucket 名稱 */
export const MEDIA_BUCKET = 'media';

/** 上傳限制 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp';
