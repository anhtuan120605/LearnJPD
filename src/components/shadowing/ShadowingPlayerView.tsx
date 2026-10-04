import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Keyboard, 
  Sparkles, 
  HelpCircle,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { ShadowingVideoItem, VideoSubtitleCue } from '../../types/shadowing';
import { TranscriptList } from './TranscriptList';
import { DictationPanel } from './DictationPanel';

interface ShadowingPlayerViewProps {
  video: ShadowingVideoItem;
  onBack: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const ShadowingPlayerView: React.FC<ShadowingPlayerViewProps> = ({
  video,
  onBack
}) => {
  // Chế độ: 'shadowing' (Bắt chước phát âm) hoặc 'dictation' (Nghe - Viết chính tả)
  const [studyMode, setStudyMode] = useState<'shadowing' | 'dictation'>('shadowing');

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 300);
  const [speed, setSpeed] = useState<number>(1);
  const [autoPause, setAutoPause] = useState(true);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);

  // Subtitles & Furigana toggles
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Cues state
  const [currentCueIndex, setCurrentCueIndex] = useState(0);
  const [replayCount, setReplayCount] = useState(1);
  const [bookmarkedCues, setBookmarkedCues] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // YouTube player references
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);
  const currentCueIndexRef = useRef(currentCueIndex);
  currentCueIndexRef.current = currentCueIndex;
  const autoPauseRef = useRef(autoPause);
  autoPauseRef.current = autoPause;

  const currentCue = video.cues[currentCueIndex] || video.cues[0];

  // Khởi tạo YouTube IFrame API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerId = `yt-player-${video.youtubeId}`;
      const elem = document.getElementById(playerId);
      if (!elem) return;

      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(playerId, {
          videoId: video.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1
          },
          events: {
            onError: (event: any) => {
              console.warn('YouTube Player error:', event.data);
            },
            onReady: (event: any) => {
              if (!isMounted) return;
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (err) {
        console.warn('YouTube Player init error:', err);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [video.youtubeId]);

  // Polling đồng bộ mốc thời gian và tự ngắt câu
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        if (typeof time === 'number') {
          setCurrentTime(time);

          // Kiểm tra mốc kết thúc của câu hiện tại khi bật "Tự ngắt câu"
          const curIdx = currentCueIndexRef.current;
          const activeCue = video.cues[curIdx];
          if (activeCue && autoPauseRef.current) {
            if (time >= activeCue.endTime) {
              if (playerRef.current.getPlayerState() === window.YT?.PlayerState?.PLAYING) {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
              }
            }
          }

          // Dò câu hiện tại tương ứng với thời gian video (nếu không auto-pause)
          if (!autoPauseRef.current) {
            const foundIdx = video.cues.findIndex(c => time >= c.startTime && time < c.endTime);
            if (foundIdx >= 0 && foundIdx !== curIdx) {
              setCurrentCueIndex(foundIdx);
            }
          }
        }
      }
    }, 150);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [video.cues]);

  // Điều khiển Video
  const playVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  }, [isPlaying, playVideo, pauseVideo]);

  const seekToCue = useCallback((index: number) => {
    if (index < 0 || index >= video.cues.length) return;
    const targetCue = video.cues[index];
    setCurrentCueIndex(index);
    setReplayCount(1);

    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(targetCue.startTime, true);
      playVideo();
    }
  }, [video.cues, playVideo]);

  const handleReplayCurrentCue = useCallback(() => {
    if (!currentCue) return;
    setReplayCount(prev => prev + 1);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(currentCue.startTime, true);
      playVideo();
    }
  }, [currentCue, playVideo]);

  const handlePrevCue = useCallback(() => {
    if (currentCueIndex > 0) {
      seekToCue(currentCueIndex - 1);
    }
  }, [currentCueIndex, seekToCue]);

  const handleNextCue = useCallback(() => {
    if (currentCueIndex < video.cues.length - 1) {
      seekToCue(currentCueIndex + 1);
    }
  }, [currentCueIndex, video.cues.length, seekToCue]);

  const handleChangeSpeed = useCallback(() => {
    const speeds = [0.75, 0.9, 1, 1.25];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setSpeed(newSpeed);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(newSpeed);
    }
  }, [speed]);

  const handleToggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // Bookmark câu thoại
  const handleToggleBookmark = (cueId: string) => {
    setBookmarkedCues(prev => 
      prev.includes(cueId) ? prev.filter(id => id !== cueId) : [...prev, cueId]
    );
  };

  // Chọn đáp án trắc nghiệm JLPT
  const handleSelectQuizAnswer = (cueId: string, optionNum: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [cueId]: optionNum
    }));
  };

  // Lắng nghe phím tắt toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong textarea hoặc input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReplayCurrentCue();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCue();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCue();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowTranslation(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleReplayCurrentCue, handlePrevCue, handleNextCue]);

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* 1. TOP NAVBAR / HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        {/* Nút quay lại & Tiêu đề video */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
              <span>{video.channelName}</span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {video.level}
              </span>
            </div>
          </div>
        </div>

        {/* Chuyển chế độ: Bắt chước phát âm ⇄ Nghe - Viết chính tả */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setStudyMode('shadowing')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              studyMode === 'shadowing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Bắt chước phát âm</span>
          </button>
          <button
            onClick={() => setStudyMode('dictation')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              studyMode === 'dictation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <span>Nghe - Viết chính tả</span>
          </button>
        </div>

        {/* Tiện ích: Phím tắt & Ẩn video */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowHotkeysModal(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center gap-1.5"
            title="Xem danh sách phím tắt"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phím tắt</span>
          </button>

          <button
            onClick={() => setIsVideoHidden(prev => !prev)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isVideoHidden
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
            title="Ẩn video để luyện nghe mù"
          >
            {isVideoHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isVideoHidden ? 'Hiện video' : 'Ẩn video'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CỘT TRÁI: VIDEO PLAYER & BỘ ĐIỀU KHIỂN CHUYÊN DỤNG (7 CỘT) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Màn hình Video YouTube */}
          <div 
            ref={playerContainerRef}
            className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-lg border border-stone-800 flex items-center justify-center group"
          >
            {/* YouTube IFrame Container */}
            <div 
              id={`yt-player-${video.youtubeId}`} 
              className={`w-full h-full ${isVideoHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            />

            {/* Chế độ "Ẩn video - Luyện nghe mù" */}
            {isVideoHidden && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-indigo-950 text-white p-6 text-center select-none">
                <div className={`w-20 h-20 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 ${isPlaying ? 'animate-pulse scale-105' : ''}`}>
                  <Headphones className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-stone-100 mb-1">
                  Chế Độ Luyện Nghe Mù
                </h3>
                <p className="text-xs text-stone-400 max-w-xs">
                  Video đã được ẩn. Hãy tập trung 100% thính giác để bắt chước âm thanh bạn nghe được.
                </p>
              </div>
            )}
          </div>

          {/* Thanh Tiến Trình & Bộ Điều Khiển Phim Chuyên Nghiệp */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            
            {/* Progress Slider & Timeline */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                    playerRef.current.seekTo(val, true);
                  }
                }}
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] font-mono text-stone-400 font-bold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Prev, Replay, Play, Next */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={handlePrevCue}
                  title="Câu trước (←)"
                  className="p-2 sm:p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition active:scale-95"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReplayCurrentCue}
                  title="Nghe lại câu này (R)"
                  className="p-2 sm:p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  title="Phát / Dừng (Space)"
                  className="p-3 sm:p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={handleNextCue}
                  title="Câu tiếp theo (→)"
                  className="p-2 sm:p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition active:scale-95"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToggleFullscreen}
                  title="Toàn màn hình"
                  className="p-2 sm:p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>

              {/* Toggles: Tự ngắt câu, Bản dịch, Furigana, Tốc độ */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Switch Tự ngắt câu */}
                <button
                  type="button"
                  onClick={() => setAutoPause(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    autoPause
                      ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${autoPause ? 'bg-indigo-600 animate-ping' : 'bg-stone-400'}`} />
                  <span>Tự ngắt câu</span>
                </button>

                {/* Toggle Bản dịch */}
                <button
                  type="button"
                  onClick={() => setShowTranslation(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    showTranslation
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  Bản dịch
                </button>

                {/* Toggle Furigana */}
                <button
                  type="button"
                  onClick={() => setShowFurigana(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    showFurigana
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  Furigana
                </button>

                {/* Tốc độ phát */}
                <button
                  type="button"
                  onClick={handleChangeSpeed}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 transition"
                >
                  {speed}x
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: KỊCH BẢN (SHADOWING) HOẶC BẢNG GÕ CHÍNH TẢ (DICTATION) (5 CỘT) */}
        <div className="lg:col-span-5 h-[620px]">
          {studyMode === 'shadowing' ? (
            <TranscriptList
              cues={video.cues}
              currentCueIndex={currentCueIndex}
              onSelectCue={seekToCue}
              showFurigana={showFurigana}
              onToggleFurigana={() => setShowFurigana(prev => !prev)}
              showTranslation={showTranslation}
              onToggleTranslation={() => setShowTranslation(prev => !prev)}
              bookmarkedCues={bookmarkedCues}
              onToggleBookmark={handleToggleBookmark}
              quizAnswers={quizAnswers}
              onSelectQuizAnswer={handleSelectQuizAnswer}
            />
          ) : (
            <DictationPanel
              currentCue={currentCue}
              cueIndex={currentCueIndex}
              totalCues={video.cues.length}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onReplayCue={handleReplayCurrentCue}
              onPrevCue={handlePrevCue}
              onNextCue={handleNextCue}
              autoPause={autoPause}
              onToggleAutoPause={() => setAutoPause(prev => !prev)}
              speed={speed}
              onChangeSpeed={handleChangeSpeed}
              replayCount={replayCount}
            />
          )}
        </div>
      </div>

      {/* MODAL PHÍM TẮT TIỆN ÍCH */}
      {showHotkeysModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                <span>Phím tắt học tập</span>
              </h3>
              <button
                onClick={() => setShowHotkeysModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400">Phát / Tạm dừng:</span>
                <kbd className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">Space</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400">Nghe lại câu hiện tại:</span>
                <kbd className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">R</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400">Câu trước / Câu sau:</span>
                <div className="space-x-1">
                  <kbd className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">←</kbd>
                  <kbd className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">→</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400">Bật/tắt bản dịch:</span>
                <kbd className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">T</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHotkeysModal(false)}
              className="w-full py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
