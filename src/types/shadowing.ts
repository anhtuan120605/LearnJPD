// Định nghĩa các kiểu dữ liệu cho tính năng Shadowing & Dictation qua Video

export interface FuriganaToken {
  text: string;
  ruby?: string; // Cách đọc Hiragana đặt phía trên chữ Hán
}

export interface VideoSubtitleCue {
  id: string;               // 'c1', 'c2', ...
  order: number;            // 1, 2, 3...
  startTime: number;        // Giây bắt đầu (vd: 12.5)
  endTime: number;          // Giây kết thúc (vd: 17.8)
  text: string;             // Câu tiếng Nhật gốc (Kanji + Kana)
  kana?: string;            // Câu chỉ có Kana để kiểm tra so sánh âm
  vietnamese: string;       // Dịch nghĩa tiếng Việt
  speaker?: string;         // 'ナレーション', '男の人', '女の人', etc.
  furiganaTokens?: FuriganaToken[]; // Dùng để render thẻ <ruby>
  words?: string[];         // Các khối từ để phục vụ chế độ "Ghép câu"
  notes?: string;           // Giải thích ngữ pháp hoặc từ mới
  
  // Dành riêng cho dạng bài thi nghe JLPT có câu hỏi
  questionNum?: string;     // '1番', '4番', v.v.
  options?: string[];       // 4 lựa chọn [1, 2, 3, 4]
  correctAnswer?: number;   // Đáp án đúng (1, 2, 3, hoặc 4)
  explanation?: string;     // Giải thích tại sao chọn đáp án này
}

export interface ShadowingVideoItem {
  id: string;
  youtubeId: string;        // ID video YouTube (ví dụ 'dQw4w9WgXcQ')
  title: string;
  channelName: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'ALL';
  topic: string;            // 'Luyện thi JLPT', 'Podcast', 'Giao tiếp đời sống', 'IT'
  thumbnailUrl?: string;
  duration: number;         // Thời lượng tính theo giây
  isJlptTest?: boolean;     // Có phải đề thi nghe JLPT không
  cues: VideoSubtitleCue[]; // Danh sách các câu thoại có timestamp
  authorBadge?: string;
}

export interface CueDictationResult {
  mistakeCount: number;
  replayCount: number;
  userAnswer: string;
  isCorrect: boolean;
  completedAt?: string;
}

export interface VideoDictationProgress {
  videoId: string;
  completedCues: Record<string, CueDictationResult>;
  bookmarkedCues: string[]; // Danh sách ID câu được gắn cờ yêu thích
  lastCueIndex: number;
  quizAnswers?: Record<string, number>; // Lưu đáp án bài thi JLPT: { questionId: selectedOption }
}

export interface UserCustomVideo {
  id: string;
  youtubeId: string;
  title: string;
  channelName: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'ALL';
  topic: string;
  addedAt: string;
  cues: VideoSubtitleCue[];
}
