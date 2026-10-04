import { ShadowingVideoItem, VideoSubtitleCue } from '../types/shadowing';

const STORAGE_API_KEY = 'learnjpd_gemini_api_key';
const STORAGE_CUSTOM_VIDEOS = 'learnjpd_custom_shadowing_videos';

/**
 * Lấy Gemini API Key: Ưu tiên key người dùng lưu trong localStorage,
 * nếu chưa có thì fallback về biến môi trường (nếu có cấu hình).
 */
export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  const userKey = localStorage.getItem(STORAGE_API_KEY);
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

/**
 * Lưu API Key cá nhân của người dùng vào localStorage
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_API_KEY, key.trim());
}

/**
 * Xoá API Key cá nhân
 */
export function removeGeminiApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_API_KEY);
}

/**
 * Kiểm tra tính hợp lệ của Gemini API Key bằng cách truy vấn danh sách models của Google
 */
export async function validateGeminiApiKey(key: string): Promise<{ valid: boolean; message: string }> {
  if (!key || key.trim().length < 20) {
    return { valid: false, message: 'API Key quá ngắn hoặc không đúng định dạng.' };
  }

  const trimmedKey = key.trim();

  try {
    // Gọi endpoint kiểm tra danh sách models - cách chuẩn xác và an toàn nhất không bị phụ thuộc model cũ
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(trimmedKey)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-goog-api-key': trimmedKey
      }
    });

    if (response.ok) {
      return { valid: true, message: 'Kết nối thành công! Key đã sẵn sàng sử dụng.' };
    }

    const errData = await response.json().catch(() => ({}));
    const rawMsg = errData.error?.message || '';
    const reason = errData.error?.details?.[0]?.reason || '';

    if (reason === 'API_KEY_SERVICE_BLOCKED' || rawMsg.includes('API_KEY_SERVICE_BLOCKED')) {
      return {
        valid: false,
        message: 'Project Google Cloud của bạn chưa bật "Generative Language API". Hãy vào console.cloud.google.com bật API này, hoặc tạo key mới tại aistudio.google.com.'
      };
    }

    if (rawMsg.includes('API key not valid')) {
      return { valid: false, message: 'API Key không hợp lệ. Vui lòng kiểm tra lại mã đã copy.' };
    }

    return { valid: false, message: `Lỗi (${response.status}): ${rawMsg || 'Key chưa được cấp quyền.'}` };
  } catch (err: any) {
    return {
      valid: false,
      message: `Không thể kết nối đến máy chủ Google: ${err.message || 'Lỗi mạng'}`
    };
  }
}

/**
 * Trích xuất YouTube ID từ mọi dạng link (youtube.com/watch?v=, youtu.be/, shorts/...)
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = cleanUrl.match(regExp);
  return match ? match[1] : null;
}

/**
 * Gọi Gemini 1.5 Flash để bóc tách và tạo bài học Shadowing & Dictation chuẩn từ văn bản/transcript video
 */
export async function parseVideoWithGemini(params: {
  youtubeUrl: string;
  videoTitle?: string;
  transcriptText?: string;
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  userApiKey?: string;
  sentenceCount?: number;
}): Promise<ShadowingVideoItem> {
  const apiKey = params.userApiKey || getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chưa cấu hình Gemini API Key. Vui lòng nhập API Key để tiếp tục.');
  }

  const ytId = extractYouTubeId(params.youtubeUrl);
  if (!ytId) {
    throw new Error('Đường link YouTube không hợp lệ. Vui lòng kiểm tra lại link video.');
  }

  const defaultTitle = params.videoTitle?.trim() || `Bài luyện nghe YouTube (${ytId})`;
  const detectedLevel = params.level || 'N3';
  const targetCount = params.sentenceCount || 20;

  // Prompt hướng dẫn Gemini trả về JSON chuẩn
  const systemInstruction = `
Bạn là chuyên gia sư phạm tiếng Nhật và xử lý ngôn ngữ cho ứng dụng học tập LearnJPD.
Nhiệm vụ của bạn là nhận thông tin video tiếng Nhật hoặc transcript phụ đề, sau đó tạo ra danh sách câu (cues) để học viên luyện Bắt chước phát âm (Shadowing) và Chép chính tả (Dictation).

Yêu cầu xuất ra JSON theo cấu trúc:
{
  "title": "Tiêu đề video tự nhiên bằng tiếng Việt/Nhật",
  "channelName": "Tên kênh hoặc 'Kênh YouTube'",
  "level": "${detectedLevel}",
  "topic": "Chủ đề (ví dụ: Luyện thi JLPT, Podcast, Giao tiếp, IT...)",
  "cues": [
    {
      "id": "c1",
      "order": 1,
      "startTime": 0.5,
      "endTime": 5.0,
      "text": "Câu tiếng Nhật chuẩn (có Kanji + Kana)",
      "kana": "Câu toàn bộ viết bằng Hiragana/Katakana chuẩn",
      "vietnamese": "Dịch nghĩa tiếng Việt tự nhiên chuẩn ngữ cảnh",
      "speaker": "Người nói (ví dụ: ナレーション, 男の人, 女の人 hoặc tên)",
      "furiganaTokens": [
        { "text": "漢字", "ruby": "かんじ" },
        { "text": "を勉強する。" }
      ],
      "words": ["漢字を", "勉強する"],
      "notes": "Giải thích ngữ pháp hoặc từ mới quan trọng (nếu có)"
    }
  ]
}

Quy tắc BẮT BUỘC:
1. Số lượng câu: Tạo đầy đủ từ ${targetCount - 3} đến ${targetCount + 2} câu để người học có một bài học phong phú, trọn vẹn.
2. Mốc thời gian startTime và endTime phải hợp lý theo thứ tự tăng dần liên tục (trung bình 3-6 giây mỗi câu).
3. furiganaTokens: Chỉ gắn ruby cho các chữ Hán (Kanji), giữ nguyên các trợ từ hoặc từ viết bằng Kana.
4. words: Tách thành các cụm từ ý nghĩa để người học làm bài tập ghép câu.
5. Trả về DUY NHẤT một chuỗi JSON hợp lệ. Tuyệt đối KHÔNG kèm giải thích bên ngoài hay bọc trong markdown nếu không cần thiết.
`;

  let transcriptSource = params.transcriptText?.trim() || '';

  // Nếu người dùng không nhập transcript thủ công, tự động cào phụ đề gốc từ YouTube qua API server
  if (!transcriptSource) {
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:5173';
      const subRes = await fetch(`${baseUrl}/api/youtube-transcript?id=${encodeURIComponent(ytId)}`);
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success && Array.isArray(subData.transcript) && subData.transcript.length > 0) {
          const rawItems = subData.transcript;
          const merged: { startTime: number; endTime: number; text: string }[] = [];
          let current: { startTime: number; endTime: number; text: string } | null = null;

          for (const item of rawItems) {
            const t = (item.text || '').trim();
            if (!t || t === '[音楽]' || t === '[Applause]') continue;

            if (!current) {
              current = {
                startTime: Math.round(item.offset * 10) / 10,
                endTime: Math.round((item.offset + item.duration) * 10) / 10,
                text: t
              };
            } else {
              const diff = item.offset - current.endTime;
              if (current.text.length < 30 && (item.offset + item.duration - current.startTime) < 7.0 && diff < 2.5 && !current.text.endsWith('。') && !current.text.endsWith('?')) {
                current.text += (current.text.endsWith(' ') || t.startsWith(' ') ? '' : ' ') + t;
                current.endTime = Math.round((item.offset + item.duration) * 10) / 10;
              } else {
                merged.push(current);
                current = {
                  startTime: Math.round(item.offset * 10) / 10,
                  endTime: Math.round((item.offset + item.duration) * 10) / 10,
                  text: t
                };
              }
            }
          }
          if (current) merged.push(current);

          // Tạo chuỗi phụ đề có mốc thời gian hoàn chỉnh
          transcriptSource = merged.map(m => `[${m.startTime}s - ${m.endTime}s] ${m.text}`).join('\n');
        }
      }
    } catch (e) {
      console.warn('Không thể tự động tải phụ đề YouTube:', e);
    }
  }

  const userContent = transcriptSource
    ? `Dưới đây là TOÀN BỘ phụ đề gốc được bóc tách từ video YouTube (ID: ${ytId}):\n\n${transcriptSource}\n\nYÊU CẦU ĐẶC BIỆT: Hãy bóc tách và tạo bài học đầy đủ cho TOÀN BỘ nội dung phụ đề trên từ đầu đến cuối video (giữ nguyên và khớp đúng các mốc thời gian đã cho, không được lược bỏ hay cắt bớt câu giữa chừng).`
    : `Hãy tạo bài học tiếng Nhật cấp độ ${detectedLevel} chất lượng cao phù hợp với video YouTube ID "${ytId}" mang tiêu đề "${defaultTitle}". 
Tạo từ ${targetCount - 3} đến ${targetCount} câu đàm thoại / đề thi chi tiết (chia thành các đoạn hội thoại có mở đầu, thân bài, câu hỏi thực tế, kèm mốc thời gian tăng dần tự nhiên).`;

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];
  let rawText = '';
  let lastErrorMsg = '';

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n---\n${userContent}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawText) break;
      } else {
        const errData = await response.json().catch(() => ({}));
        lastErrorMsg = errData.error?.message || `Mã lỗi ${response.status}`;
      }
    } catch (err: any) {
      lastErrorMsg = err.message || 'Lỗi kết nối';
    }
  }

  if (!rawText) {
    throw new Error(lastErrorMsg || 'Gemini không trả về kết quả nội dung. Vui lòng kiểm tra lại API Key.');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    // Nếu có dính markdown codefence
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  const generatedCues: VideoSubtitleCue[] = (parsed.cues || []).map((c: any, idx: number) => ({
    id: c.id || `cue-${idx + 1}`,
    order: c.order || idx + 1,
    startTime: Number(c.startTime) || idx * 5,
    endTime: Number(c.endTime) || (idx * 5 + 4.5),
    text: c.text || '',
    kana: c.kana || '',
    vietnamese: c.vietnamese || '',
    speaker: c.speaker || 'Người nói',
    furiganaTokens: c.furiganaTokens || [{ text: c.text || '' }],
    words: c.words || (c.text ? c.text.split(' ') : []),
    notes: c.notes || ''
  }));

  const lastCue = generatedCues[generatedCues.length - 1];
  const totalDuration = lastCue ? Math.ceil(lastCue.endTime + 5) : 300;

  const newItem: ShadowingVideoItem = {
    id: `custom-${ytId}-${Date.now()}`,
    youtubeId: ytId,
    title: parsed.title || defaultTitle,
    channelName: parsed.channelName || 'Video người dùng',
    level: parsed.level || detectedLevel,
    topic: parsed.topic || 'Video của tôi',
    thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    duration: totalDuration,
    isJlptTest: false,
    authorBadge: 'AI Gemini tạo',
    cues: generatedCues
  };

  // Lưu vào danh sách video cá nhân
  saveCustomVideo(newItem);
  return newItem;
}

/**
 * Lấy danh sách video do người dùng tự nhập từ localStorage
 */
export function getCustomVideos(): ShadowingVideoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_VIDEOS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi khi đọc danh sách custom video:', err);
    return [];
  }
}

/**
 * Lưu 1 video người dùng vào localStorage
 */
export function saveCustomVideo(video: ShadowingVideoItem): void {
  if (typeof window === 'undefined') return;
  const current = getCustomVideos();
  const existingIdx = current.findIndex(v => v.id === video.id || v.youtubeId === video.youtubeId);
  let updated: ShadowingVideoItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = video;
  } else {
    updated = [video, ...current];
  }
  localStorage.setItem(STORAGE_CUSTOM_VIDEOS, JSON.stringify(updated));
}

/**
 * Xoá 1 video tự tạo của người dùng
 */
export function deleteCustomVideo(videoId: string): void {
  if (typeof window === 'undefined') return;
  const current = getCustomVideos();
  const filtered = current.filter(v => v.id !== videoId);
  localStorage.setItem(STORAGE_CUSTOM_VIDEOS, JSON.stringify(filtered));
}
