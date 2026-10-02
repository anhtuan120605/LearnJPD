/**
 * Audio Engine cho LearnJPD
 * Hỗ trợ:
 * 1. Primary Engine: Native Japanese Neural Audio (Google TTS engine - phát âm tự nhiên cả từ vựng và câu văn, chuẩn Tokyo)
 * 2. Fallback Engine: Web Speech Synthesis API (hỗ trợ offline & tương thích mọi trình duyệt Safari, Chrome, Edge, Firefox, iOS, Android)
 */

// Quản lý active HTML5 Audio element
let currentAudio: HTMLAudioElement | null = null;
let currentPlaylist: string[] = [];
let currentPlaylistIndex = 0;
let currentPlaylistRate = 0.9;
let currentPlaylistOnEnd: (() => void) | undefined = undefined;

// Quản lý active SpeechSynthesisUtterances để ngăn V8 Garbage Collection bug làm mất tiếng giữa chừng
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Cache danh sách voices của trình duyệt
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
}

// Khởi tạo eager load voices ngay khi tải script
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Làm sạch và chuẩn hóa văn bản tiếng Nhật trước khi phát âm
 * Xử lý hoàn hảo cả: từ vựng đơn lẻ, mẫu câu ngữ pháp, hội thoại dài, furigana markdown, chú thích trong ngoặc
 */
export function cleanJapaneseForSpeech(text: string): string {
  if (!text) return '';

  let clean = text.trim();

  // 1. Loại bỏ thẻ HTML nếu có
  clean = clean.replace(/<[^>]+>/g, '');

  // 2. Loại bỏ tiền tố người nói trong hội thoại như "A: ", "B: ", "田中: ", "ミラー："
  clean = clean.replace(/^[A-Za-z0-9\u3040-\u30ff\u4e00-\u9faf]+[:：]\s*/, '');

  // 3. Xử lý furigana dạng markdown [Kanji](kana) -> trích lấy kana để phát âm chuẩn ngữ âm
  clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');

  // 4. Loại bỏ các phần chú thích giải nghĩa chứa chữ cái Latin / tiếng Việt trong ngoặc
  // Ví dụ: "佐藤さんは先生じゃありません。(Không phải giáo viên)" -> "佐藤さんは先生じゃありません。"
  clean = clean.replace(/[\(（][^()（）]*[a-zA-Zà-ỹÀ-Ỹ][^()（）]*[\)）]/g, '');

  // 5. Kiểm tra nếu là từ vựng có cách đọc bổ trợ (ví dụ: "なんさい（おいくつ）")
  const isSentence = /[。、？！\n]/.test(clean) || clean.length > 18;
  if (!isSentence) {
    const parenMatch = clean.match(/^([^\(（]+)[\(（](.*?)[\)）]/);
    if (parenMatch && parenMatch[1].trim()) {
      clean = parenMatch[1].trim();
    }
  }

  // 6. Xóa các dấu ngoặc còn sót lại nhưng giữ lại nội dung tiếng Nhật bên trong
  clean = clean.replace(/[（\(\)）「」『』【】［］\[\]"'`]/g, '');

  // 7. Xóa gạch nối, tilde sóng ở đầu từ (ví dụ: －かい -> かい, 〜さん -> さん)
  clean = clean.replace(/^[－ー―\-~～〜]+/g, '');
  clean = clean.replace(/[~～〜]/g, '');

  // 8. Xóa các ký tự ngăn cách như gạch chéo, bullet
  clean = clean.replace(/[/／・\\|｜…\^]/g, ' ');

  // 9. Chuẩn hóa khoảng trắng
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Tìm giọng đọc tiếng Nhật tốt nhất trong hệ thống
 */
function getBestJapaneseVoice(): SpeechSynthesisVoice | null {
  loadVoices();
  if (cachedVoices.length === 0) return null;

  // Ưu tiên 1: Các giọng tiếng Nhật chất lượng cao nổi tiếng của Apple, Google, Microsoft
  const premiumKeywords = ['google 日本語', 'kyoko', 'otoya', 'haruka', 'ayumi', 'nanami', 'ichiro', 'keita', 'siri'];
  const premiumVoice = cachedVoices.find(v => {
    const nameLower = v.name.toLowerCase();
    const langLower = v.lang.toLowerCase();
    return (langLower.startsWith('ja')) && premiumKeywords.some(k => nameLower.includes(k));
  });
  if (premiumVoice) return premiumVoice;

  // Ưu tiên 2: Bất kỳ giọng nào có mã ngôn ngữ ja
  const jaVoice = cachedVoices.find(v => v.lang.toLowerCase().startsWith('ja'));
  if (jaVoice) return jaVoice;

  // Ưu tiên 3: Tên voice có chứa 'japanese' hoặc 'japan' hoặc '日本語'
  const namedVoice = cachedVoices.find(v => {
    const nameLower = v.name.toLowerCase();
    return nameLower.includes('japanese') || nameLower.includes('japan') || nameLower.includes('日本語');
  });
  if (namedVoice) return namedVoice;

  return null;
}

/**
 * Dừng mọi âm thanh đang phát ngay lập tức (cả HTML5 Audio lẫn SpeechSynthesis)
 */
export function stopSpeaking(): void {
  currentPlaylist = [];
  currentPlaylistIndex = 0;
  currentPlaylistOnEnd = undefined;

  // Dừng HTML5 Audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch {}
    currentAudio = null;
  }

  // Dừng Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  activeUtterances.clear();
}

/**
 * Phát âm qua Web Speech API (Engine chuẩn offline & Fallback)
 */
function speakViaSpeechSynthesis(
  cleanText: string,
  rate: number,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  try {
    // Sửa lỗi Chrome: resume trước khi cancel/speak để tránh trạng thái bị đóng băng
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
  } catch {}

  // Đợi 25ms để trình duyệt hoàn tất việc hủy lệnh cũ trước khi speak lệnh mới
  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = Math.max(0.6, Math.min(1.4, rate));

      const voice = getBestJapaneseVoice();
      if (voice) {
        utterance.voice = voice;
      }

      let isFinished = false;
      const finish = () => {
        if (!isFinished) {
          isFinished = true;
          activeUtterances.delete(utterance);
          onEnd?.();
        }
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        if (e.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', e.error);
        }
        finish();
      };

      // Giữ tham chiếu để ngăn V8 Garbage Collector xóa utterance giữa chừng
      activeUtterances.add(utterance);

      // Watchdog chống Chrome dừng giữa chừng khi câu nói dài
      const interval = setInterval(() => {
        if (isFinished || !activeUtterances.has(utterance)) {
          clearInterval(interval);
          return;
        }
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 3000);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speakViaSpeechSynthesis failed:', err);
      onEnd?.();
    }
  }, 25);
}

/**
 * Phát tuần tự từng chunk câu nếu văn bản dài (>160 ký tự)
 */
function playNextChunk(): void {
  if (currentPlaylistIndex >= currentPlaylist.length) {
    const cb = currentPlaylistOnEnd;
    stopSpeaking();
    cb?.();
    return;
  }

  const chunk = currentPlaylist[currentPlaylistIndex];
  currentPlaylistIndex++;

  const audioUrl = `https://translate.googleapis.com/translate_tts?client=gtx&tl=ja&q=${encodeURIComponent(chunk)}`;
  const audio = new Audio(audioUrl);
  currentAudio = audio;
  audio.playbackRate = Math.max(0.7, Math.min(1.4, currentPlaylistRate));

  let hasEnded = false;
  let hasFailed = false;

  const timer = setTimeout(() => {
    if (!hasEnded && !hasFailed && currentAudio === audio && audio.readyState === 0) {
      hasFailed = true;
      stopSpeaking();
      speakViaSpeechSynthesis(chunk, currentPlaylistRate, currentPlaylistOnEnd);
    }
  }, 3500);

  audio.onended = () => {
    clearTimeout(timer);
    if (!hasEnded && !hasFailed) {
      hasEnded = true;
      playNextChunk();
    }
  };

  audio.onerror = () => {
    clearTimeout(timer);
    if (!hasEnded && !hasFailed) {
      hasFailed = true;
      stopSpeaking();
      speakViaSpeechSynthesis(chunk, currentPlaylistRate, currentPlaylistOnEnd);
    }
  };

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      clearTimeout(timer);
      if (!hasEnded && !hasFailed) {
        hasFailed = true;
        stopSpeaking();
        speakViaSpeechSynthesis(chunk, currentPlaylistRate, currentPlaylistOnEnd);
      }
    });
  }
}

/**
 * Tách đoạn văn thành các câu ngắn vừa vặn cho audio stream (<160 ký tự)
 */
function splitIntoAudioChunks(text: string): string[] {
  if (text.length <= 160) return [text];

  const sentences = text.split(/([。？！\n]+)/);
  const chunks: string[] = [];
  let buffer = '';

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punct = sentences[i + 1] || '';
    const full = (sentence + punct).trim();
    if (!full) continue;

    if ((buffer + full).length <= 160) {
      buffer += full;
    } else {
      if (buffer) chunks.push(buffer);
      if (full.length <= 160) {
        buffer = full;
      } else {
        // Trường hợp câu đơn quá dài không có dấu chấm, chia theo dấu phẩy
        const subParts = full.split(/([、,]+)/);
        let subBuffer = '';
        for (let j = 0; j < subParts.length; j += 2) {
          const s = subParts[j] + (subParts[j + 1] || '');
          if ((subBuffer + s).length <= 160) {
            subBuffer += s;
          } else {
            if (subBuffer) chunks.push(subBuffer);
            subBuffer = s;
          }
        }
        if (subBuffer) buffer = subBuffer;
      }
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [text.slice(0, 160)];
}

/**
 * Hàm phát âm tiếng Nhật chính cho toàn bộ ứng dụng
 * Tự động chọn Native Online Audio chất lượng cao hoặc SpeechSynthesis
 * Hỗ trợ từ vựng, cụm từ, câu ví dụ ngữ pháp và đoạn hội thoại
 */
export function speakJapanese(
  text: string,
  rate: number = 0.9,
  onEnd?: () => void
): void {
  const cleanText = cleanJapaneseForSpeech(text);
  if (!cleanText) {
    onEnd?.();
    return;
  }

  // Dừng âm thanh trước đó
  stopSpeaking();

  const chunks = splitIntoAudioChunks(cleanText);
  currentPlaylist = chunks;
  currentPlaylistIndex = 0;
  currentPlaylistRate = rate;
  currentPlaylistOnEnd = onEnd;

  playNextChunk();
}

