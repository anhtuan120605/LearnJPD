/**
 * Audio Engine cho LearnJPD
 * Hỗ trợ Dual-Engine:
 * 1. Primary Engine: Native Japanese Dictionary Audio (Âm thanh phát âm bản xứ chuẩn, trong trẻo, chân thực)
 * 2. Fallback Engine: Web Speech Synthesis API (Được tối ưu cho mọi trình duyệt: Chrome, Safari, Edge, Firefox, macOS, Windows, iOS, Android)
 */

// Quản lý active HTML5 Audio element
let currentAudio: HTMLAudioElement | null = null;

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
 * Xử lý triệt để các trường hợp: ngoặc giải thích, furigana markdown, gạch nối, tilde sóng ~
 */
export function cleanJapaneseForSpeech(text: string): string {
  if (!text) return '';

  let clean = text.trim();

  // 1. Loại bỏ thẻ HTML nếu có
  clean = clean.replace(/<[^>]+>/g, '');

  // 2. Xử lý furigana dạng markdown [Kanji](kana) -> trích lấy kana để phát âm chuẩn ngữ âm
  clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');

  // 3. Xử lý dấu ngoặc đơn / ngoặc kép:
  // Nếu có dạng "なんさい（おいくつ）" hoặc "A (B)" -> lấy phần chính phía trước
  const parenMatch = clean.match(/^([^\(（]+)[\(（](.*?)[\)）]/);
  if (parenMatch && parenMatch[1].trim()) {
    clean = parenMatch[1].trim();
  } else {
    // Nếu ngoặc ở đầu như （お）みず -> xóa ký tự ngoặc giữ chữ
    clean = clean.replace(/[（\(\)）「」『』【】［］\[\]]/g, '');
  }

  // 4. Xóa gạch nối ở đầu từ (ví dụ: －かい -> かい để không bị đọc thành "mainasu kai")
  clean = clean.replace(/^[－ー―\-~～〜]+/g, '');

  // 5. Xóa ký hiệu sóng ~ (ví dụ: 〜さん -> さん)
  clean = clean.replace(/[~～〜]/g, '');

  // 6. Xóa ký tự gạch chéo, dấu chấm nakaguro
  clean = clean.replace(/[/／・\\|｜…\^]/g, ' ');

  // 7. Chuẩn hóa khoảng trắng
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
 * Phát âm qua Web Speech API (Engine chuẩn & Fallback)
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
      utterance.rate = Math.max(0.6, Math.min(1.5, rate));

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
      }, 4000);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speakViaSpeechSynthesis failed:', err);
      onEnd?.();
    }
  }, 25);
}

/**
 * Hàm phát âm tiếng Nhật chính cho toàn bộ ứng dụng
 * Tự động chọn Native Online Audio chất lượng cao hoặc SpeechSynthesis
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

  // Đối với từ vựng và câu ngắn (<= 60 ký tự, không chứa xuống dòng):
  // Dùng Native Japanese Audio từ nguồn từ điển chuẩn bản xứ
  const isShortPhrase = cleanText.length <= 60 && !cleanText.includes('\n');

  if (isShortPhrase) {
    try {
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.playbackRate = Math.max(0.7, Math.min(1.4, rate));

      let hasEnded = false;
      let hasFailed = false;

      // Timeout watchdog: Nếu tải mạng quá 2 giây chưa có phản hồi -> tự động chuyển sang SpeechSynthesis
      const networkTimeout = setTimeout(() => {
        if (!hasEnded && !hasFailed && currentAudio === audio && audio.readyState === 0) {
          hasFailed = true;
          stopSpeaking();
          speakViaSpeechSynthesis(cleanText, rate, onEnd);
        }
      }, 2000);

      const handleFinish = () => {
        clearTimeout(networkTimeout);
        if (!hasEnded && !hasFailed) {
          hasEnded = true;
          if (currentAudio === audio) currentAudio = null;
          onEnd?.();
        }
      };

      audio.onended = handleFinish;

      audio.onerror = () => {
        clearTimeout(networkTimeout);
        if (!hasEnded && !hasFailed) {
          hasFailed = true;
          if (currentAudio === audio) currentAudio = null;
          // Fallback sang SpeechSynthesis
          speakViaSpeechSynthesis(cleanText, rate, onEnd);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          clearTimeout(networkTimeout);
          if (!hasEnded && !hasFailed) {
            hasFailed = true;
            if (currentAudio === audio) currentAudio = null;
            // Nếu bị trình duyệt chặn autoplay hoặc lỗi mạng -> Fallback sang SpeechSynthesis
            speakViaSpeechSynthesis(cleanText, rate, onEnd);
          }
        });
      }
      return;
    } catch (err) {
      console.warn('Native audio initialization error, falling back:', err);
    }
  }

  // Đoạn văn dài hoặc fallback trực tiếp sang SpeechSynthesis
  speakViaSpeechSynthesis(cleanText, rate, onEnd);
}
