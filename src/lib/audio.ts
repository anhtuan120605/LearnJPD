// Web Speech Synthesis API chuẩn tiếng Nhật
export function speakJapanese(
  text: string, 
  rate: number = 0.9,
  onEnd?: () => void
): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Trình duyệt không hỗ trợ Web Speech API.');
    if (onEnd) onEnd();
    return;
  }

  // Dừng âm thanh đang phát trước đó
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[~～\(\)\/]/g, '').trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ja-JP';
  utterance.rate = rate; // 0.8 - 1.0 chuẩn tự nhiên

  // Cố gắng chọn giọng chuẩn tiếng Nhật nếu có
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.name.includes('Japan') || v.name.includes('Kyoko') || v.name.includes('Otoya'));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

