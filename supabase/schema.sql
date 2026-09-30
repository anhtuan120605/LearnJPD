-- ==============================================================================
-- LearnJPD: Schema Database Supabase chuẩn hóa
-- Hỗ trợ: Lưu trữ hồ sơ, đồng bộ tiến độ học từ vựng, Kanji, streak và quiz score
-- ==============================================================================

-- 1. Kích hoạt tiện ích mở rộng UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- BẢNG 1: PROFILES (Thông tin người dùng liên kết với Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- BẢNG 2: USER_PROGRESS (Tiến độ học tập cá nhân của người dùng)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mastered_words JSONB DEFAULT '[]'::JSONB,     -- Danh sách ID từ vựng đã thuộc
  favorite_words JSONB DEFAULT '[]'::JSONB,     -- Danh sách ID từ vựng yêu thích
  mistake_words JSONB DEFAULT '[]'::JSONB,      -- Danh sách ID từ hay làm sai
  mastered_kanji JSONB DEFAULT '[]'::JSONB,     -- Danh sách ID Kanji đã thuộc
  favorite_kanji JSONB DEFAULT '[]'::JSONB,     -- Danh sách ID Kanji yêu thích
  streak INTEGER DEFAULT 1,                     -- Số ngày học liên tục
  last_active_date DATE DEFAULT CURRENT_DATE,   -- Ngày hoạt động gần nhất
  quiz_scores JSONB DEFAULT '[]'::JSONB,        -- Lịch sử điểm làm bài kiểm tra
  progress_data JSONB,                          -- JSON lưu trữ linh hoạt toàn bộ tiến độ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index tối ưu truy vấn theo user_id
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- Đảm bảo mỗi người dùng chỉ có thể đọc và ghi dữ liệu của chính mình
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Chính sách cho bảng profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Chính sách cho bảng user_progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS TỰ ĐỘNG
-- ==============================================================================

-- 1. Hàm tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER set_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Hàm tự động tạo profile và bản ghi progress khi người dùng mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Tạo tiến độ học tập ban đầu
  INSERT INTO public.user_progress (
    user_id,
    mastered_words,
    favorite_words,
    mistake_words,
    mastered_kanji,
    favorite_kanji,
    streak,
    last_active_date,
    quiz_scores,
    progress_data
  )
  VALUES (
    NEW.id,
    '[]'::JSONB,
    '[]'::JSONB,
    '[]'::JSONB,
    '[]'::JSONB,
    '[]'::JSONB,
    1,
    CURRENT_DATE,
    '[]'::JSONB,
    jsonb_build_object(
      'masteredWords', '[]'::jsonb,
      'favoriteWords', '[]'::jsonb,
      'mistakeWords', '[]'::jsonb,
      'masteredKanji', '[]'::jsonb,
      'favoriteKanji', '[]'::jsonb,
      'streak', 1,
      'lastActiveDate', CURRENT_DATE::text,
      'quizScores', '[]'::jsonb
    )
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger kích hoạt khi có người dùng mới ở auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
