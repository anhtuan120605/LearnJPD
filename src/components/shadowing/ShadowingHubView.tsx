import React, { useState, useEffect } from 'react';
import {
  Play,
  Sparkles,
  Headphones,
  Key,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  List,
  Flame,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ShadowingVideoItem } from '../../types/shadowing';
import { CURATED_SHADOWING_VIDEOS } from '../../data/shadowingData';
import {
  getCustomVideos,
  deleteCustomVideo,
  parseVideoWithGemini,
  getGeminiApiKey
} from '../../lib/geminiVideoService';
import { GeminiKeyModal } from './GeminiKeyModal';

interface ShadowingHubViewProps {
  onSelectVideo: (video: ShadowingVideoItem) => void;
  onBackToPractice?: () => void;
}

export const ShadowingHubView: React.FC<ShadowingHubViewProps> = ({
  onSelectVideo,
  onBackToPractice
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [customVideos, setCustomVideos] = useState<ShadowingVideoItem[]>([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Form thêm video của tôi
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N3');
  const [sentenceCount, setSentenceCount] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Tải dữ liệu ban đầu
  const refreshData = () => {
    setCustomVideos(getCustomVideos());
    const key = getGeminiApiKey();
    setHasApiKey(Boolean(key && key.length > 10));
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Tổng hợp tất cả video
  const allVideos = [...CURATED_SHADOWING_VIDEOS, ...customVideos];

  // Danh mục tabs
  const topicTabs = [
    { key: 'all', label: 'Trang chủ' },
    { key: 'my-videos', label: `Video của tôi (${customVideos.length})` },
    { key: 'The Nihongo Nook', label: 'The Nihongo Nook N5' },
    { key: '日本語の旅', label: '日本語の旅 N3' },
    { key: 'Japanese with Shun', label: 'Japanese with Shun' },
    { key: 'YUYUの日本語Podcast', label: 'YUYU Podcast' },
  ];

  // Lọc video theo tab và tìm kiếm
  const filteredVideos = allVideos.filter(v => {
    if (activeTab === 'my-videos') {
      return customVideos.some(cv => cv.id === v.id);
    }
    if (activeTab !== 'all') {
      if (v.channelName !== activeTab && v.topic !== activeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.channelName.toLowerCase().includes(q) ||
        v.level.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Video nổi bật (Featured video: ưu tiên video N5 hoặc N3)
  const featuredVideo = allVideos[0];

  // Xử lý thêm video bằng Gemini
  const handleAddCustomVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setErrorMessage('Vui lòng dán link YouTube cần học.');
      return;
    }

    if (!hasApiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const newVideo = await parseVideoWithGemini({
        youtubeUrl: youtubeUrl.trim(),
        videoTitle: videoTitle.trim() || undefined,
        transcriptText: transcriptText.trim() || undefined,
        level: selectedLevel,
        sentenceCount: sentenceCount
      });

      setYoutubeUrl('');
      setVideoTitle('');
      setTranscriptText('');
      refreshData();
      setIsProcessing(false);
      onSelectVideo(newVideo);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Không thể xử lý video. Vui lòng thử lại.');
    }
  };

  const handleDeleteCustomVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc muốn xoá video này khỏi danh sách của bạn?')) {
      deleteCustomVideo(id);
      refreshData();
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-6 space-y-6">

      {/* 1. HERO BANNER PHONG CÁCH NHẬT BẢN HIỆN ĐẠI (GIỐNG ẢNH 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        {/* Glow & circles decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-indigo-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ようこそ! Luyện Nghe Song Hành</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Shadowing & Chép Chính Tả
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Luyện nghe - nói theo video tiếng Nhật có phụ đề: bắt chước phát âm (shadowing), viết chính tả từng câu (dictation) và luyện đề thi JLPT N5 - N1 chuẩn xác.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-200 border border-indigo-400/30">
                Luyện nghe
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Shadowing
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-400/30">
                Dictation
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-rose-500/30 text-rose-200 border border-rose-400/30">
                N5 • N4 • N3 • N2 • N1
              </span>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span>{hasApiKey ? 'Cấu hình Gemini Key (Đã bật ✓)' : 'Cài Gemini API Key (Miễn phí)'}</span>
            </button>
            {onBackToPractice && (
              <button
                onClick={onBackToPractice}
                className="px-4 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Quay lại Practice Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHANNELS & TOPIC TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {topicTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm video */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm video, cấp độ..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* 3. TAB "VIDEO CỦA TÔI" (CUSTOM VIDEO IMPORT - GIỐNG ẢNH 2) */}
      {activeTab === 'my-videos' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                  Video của tôi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI tự tạo phụ đề + dịch</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Dán link YouTube tiếng Nhật bất kỳ — AI Gemini tự nghe, tách câu và dịch sang tiếng Việt để bạn luyện shadowing & chép chính tả.
              </p>
            </div>

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition self-start flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>{hasApiKey ? 'Đổi Gemini Key' : 'Nhập Gemini Key để tạo'}</span>
            </button>
          </div>

          {/* Form nhập link YouTube */}
          <form onSubmit={handleAddCustomVideo} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2.5 text-xs font-mono rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />

              <select
                value={selectedLevel}
                onChange={(e: any) => setSelectedLevel(e.target.value)}
                className="px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="N5">Cấp độ N5</option>
                <option value="N4">Cấp độ N4</option>
                <option value="N3">Cấp độ N3</option>
                <option value="N2">Cấp độ N2</option>
                <option value="N1">Cấp độ N1</option>
              </select>

              <select
                value={sentenceCount}
                onChange={(e: any) => setSentenceCount(Number(e.target.value))}
                className="px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none"
                title="Số câu bài tập Gemini sẽ tạo"
              >
                <option value={10}>10 câu</option>
                <option value={15}>15 câu</option>
                <option value={20}>20 câu (Khuyên dùng)</option>
                <option value={25}>25 câu</option>
                <option value={30}>30 câu (Đầy đủ)</option>
              </select>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gemini đang tách câu...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm video</span>
                  </>
                )}
              </button>
            </div>

            {/* Hướng dẫn và ô dán bản chép lời YouTube để có đủ 100% video */}
            <div className="pt-2 p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-amber-900 dark:text-amber-200">
                <span className="font-bold flex items-center gap-1.5">
                  <span>💡 Cách để có bản chép ĐẦY ĐỦ 100% video từ đầu tới cuối:</span>
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300">
                  (Mất 5 giây trên YouTube)
                </span>
              </div>
              <p className="text-[11.5px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Mở video trên YouTube &rarr; Bấm dấu <b className="text-stone-800 dark:text-stone-200">...</b> (Xem thêm) dưới video &rarr; Chọn <b className="text-stone-800 dark:text-stone-200">"Hiện bản chép lời" (Show transcript)</b> &rarr; Copy toàn bộ và dán vào ô dưới đây. Gemini sẽ gắn Furigana, khớp mốc thời gian và dịch toàn bộ video cho bạn!
              </p>
              
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Đặt tiêu đề video (tùy chọn, để trống sẽ tự lấy)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Dán bản chép lời (Transcript) copy từ YouTube vào đây để AI tạo đủ 100% câu từ đầu đến cuối video..."
                  rows={4}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* 4. FEATURED VIDEO CARD (VIDEO NỔI BẬT - GIỐNG ẢNH 1) */}
      {activeTab === 'all' && !searchQuery && featuredVideo && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-indigo-400 transition-all">
          {/* Thumbnail có nút play to */}
          <div
            onClick={() => onSelectVideo(featuredVideo)}
            className="relative w-full md:w-5/12 aspect-video rounded-2xl overflow-hidden shadow-md cursor-pointer shrink-0 bg-stone-900 group/thumb"
          >
            <img
              src={featuredVideo.thumbnailUrl || `https://img.youtube.com/vi/${featuredVideo.youtubeId}/hqdefault.jpg`}
              alt={featuredVideo.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition group-hover/thumb:bg-black/10">
              <div className="w-14 h-14 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/thumb:scale-110">
                <Play className="w-6 h-6 ml-1 fill-current" />
              </div>
            </div>
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono text-white font-bold">
              {Math.floor(featuredVideo.duration / 60)}:{featuredVideo.duration % 60 < 10 ? '0' : ''}{featuredVideo.duration % 60}
            </span>
          </div>

          {/* Nội dung video nổi bật */}
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {featuredVideo.level}
              </span>
              <span className="text-xs text-stone-400">
                {featuredVideo.channelName} • {featuredVideo.cues.length} câu
              </span>
            </div>

            <h2
              onClick={() => onSelectVideo(featuredVideo)}
              className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-2"
            >
              {featuredVideo.title}
            </h2>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
              Nghe từng câu, bắt chước phát âm rồi so với bản gốc; chuyển sang chế độ chép chính tả để gõ lại những gì nghe được. Mỗi câu có bản dịch, Furigana và ghi chú ngữ pháp.
            </p>

            <button
              onClick={() => onSelectVideo(featuredVideo)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center gap-2"
            >
              <span>BẮT ĐẦU LUYỆN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. GRID DANH SÁCH VIDEO BÀI HỌC */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
            <span>Danh sách bài học</span>
            <span className="text-xs font-mono text-stone-400 font-normal">
              ({filteredVideos.length} video)
            </span>
          </h3>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 text-stone-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Không tìm thấy video nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => {
              const isCustom = customVideos.some(cv => cv.id === video.id);

              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-2xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-stone-900 overflow-hidden">
                    <img
                      src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition" />

                    {/* Badge cấp độ */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20">
                        {video.level}
                      </span>
                      {video.authorBadge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600 text-white">
                          {video.authorBadge}
                        </span>
                      )}
                    </div>

                    {/* Thời lượng */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white">
                      {Math.floor(video.duration / 60)}:{video.duration % 60 < 10 ? '0' : ''}{video.duration % 60}
                    </span>

                    {/* Nút xoá nếu là video của tôi */}
                    {isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustomVideo(video.id, e)}
                        title="Xoá video này"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Thông tin video */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                        <span>{video.channelName}</span>
                        <span>{video.cues.length} câu</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Vào luyện tập</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CẤU HÌNH GEMINI API KEY */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={refreshData}
      />
    </div>
  );
};
