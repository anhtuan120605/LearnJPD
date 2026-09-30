import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Eye,
  EyeOff,
  Trash2,
  Volume2,
  Grid,
  Check,
  Layers
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';

interface KanjiStrokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  kanji: string;
  hanviet?: string;
  meaning?: string;
  strokes?: number;
}

interface StrokeData {
  d: string;
  numX?: number;
  numY?: number;
  num?: string;
}

export const KanjiStrokeModal: React.FC<KanjiStrokeModalProps> = ({
  isOpen,
  onClose,
  kanji,
  hanviet,
  meaning,
  strokes: propStrokes
}) => {
  const [activeTab, setActiveTab] = useState<'animate' | 'write' | 'grid'>('animate');
  const [strokesList, setStrokesList] = useState<StrokeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Animation state
  const [currentStroke, setCurrentStroke] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 0.5x, 1x, 1.5x
  const [showNumbers, setShowNumbers] = useState<boolean>(true);

  // Drawing Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGhost, setShowGhost] = useState(true);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Fetch KanjiVG SVG when kanji changes
  useEffect(() => {
    if (!isOpen || !kanji) return;

    let isMounted = true;
    setLoading(true);
    setError(false);
    setIsPlaying(false);
    setCurrentStroke(0);

    const cleanKanji = Array.from(kanji.trim())[0];
    if (!cleanKanji) {
      setLoading(false);
      setError(true);
      return;
    }

    const charCode = cleanKanji.codePointAt(0) || 0;
    const hex = '0' + charCode.toString(16).toLowerCase().padStart(4, '0');
    const primaryUrl = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`;
    const fallbackUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

    const parseSvgData = (svgText: string) => {
      // 1. Extract paths
      const paths: string[] = [];
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const domPaths = Array.from(doc.querySelectorAll('path'));
        domPaths.forEach((p) => {
          const d = p.getAttribute('d');
          if (d) paths.push(d);
        });
      } catch (e) {
        console.warn('DOMParser failed, falling back to regex:', e);
      }

      // Regex fallback if querySelector returned 0
      if (paths.length === 0) {
        const pathRegex = /<path[^>]*\bd="([^"]+)"/g;
        let pMatch;
        while ((pMatch = pathRegex.exec(svgText)) !== null) {
          paths.push(pMatch[1]);
        }
      }

      // 2. Extract numbers
      const numbers: Array<{ x?: number; y?: number; num?: string }> = [];
      const textRegex = /<text[^>]*transform="matrix\([^)]+\s+([0-9.]+)\s+([0-9.]+)\)"[^>]*>([^<]+)<\/text>/g;
      let tMatch;
      while ((tMatch = textRegex.exec(svgText)) !== null) {
        numbers.push({
          x: parseFloat(tMatch[1]),
          y: parseFloat(tMatch[2]),
          num: tMatch[3].trim()
        });
      }

      const parsed: StrokeData[] = paths.map((d, idx) => ({
        d,
        numX: numbers[idx]?.x,
        numY: numbers[idx]?.y,
        num: numbers[idx]?.num || `${idx + 1}`
      }));

      return parsed;
    };

    fetch(primaryUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Primary CDN failed');
        return res.text();
      })
      .catch(() => {
        // Try fallback
        return fetch(fallbackUrl).then((res) => {
          if (!res.ok) throw new Error('Fallback CDN failed');
          return res.text();
        });
      })
      .then((svgText) => {
        if (!isMounted) return;
        const parsedStrokes = parseSvgData(svgText);
        if (parsedStrokes.length > 0) {
          setStrokesList(parsedStrokes);
          setCurrentStroke(parsedStrokes.length);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('KanjiVG fetch error:', err);
        setError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, kanji]);

  // Handle Play Animation Loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && strokesList.length > 0) {
      const intervalMs = Math.round(900 / speed);
      timer = setTimeout(() => {
        setCurrentStroke((prev) => {
          if (prev >= strokesList.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStroke, strokesList.length, speed]);

  const handleStartPlay = () => {
    if (currentStroke >= strokesList.length) {
      setCurrentStroke(1);
    }
    setIsPlaying(true);
  };

  const handleReplay = () => {
    setCurrentStroke(1);
    setIsPlaying(true);
  };

  // Canvas Drawing Handlers
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  useEffect(() => {
    if (activeTab === 'write') {
      setTimeout(initCanvas, 50);
    }
  }, [activeTab]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), imageData]);
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    saveCanvasState();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#2563eb'; // blue-600
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#111c30] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-jp font-bold text-2xl shadow-md shadow-blue-500/20">
              {kanji}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {hanviet || 'Hán tự'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800/40">
                  {strokesList.length || propStrokes || 0} nét
                </span>
              </div>
              {meaning && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {meaning}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => speakJapanese(kanji)}
              title="Nghe phát âm"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab chuyển đổi: Mô phỏng nét / Tập viết / Lưới tiến trình */}
        <div className="px-4 sm:px-6 pt-3 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('animate')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'animate'
                ? 'border-blue-600 text-blue-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Mô phỏng nét viết</span>
          </button>

          <button
            onClick={() => setActiveTab('write')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'write'
                ? 'border-blue-600 text-blue-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Tập viết trực tiếp</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'grid'
                ? 'border-blue-600 text-blue-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lưới từng nét ({strokesList.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Đang tải cấu trúc nét chữ {kanji}...</p>
            </div>
          ) : error || strokesList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-32 h-32 mx-auto rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-jp font-black text-6xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                {kanji}
              </div>
              <p className="text-xs text-slate-500">Chưa có dữ liệu vector động cho chữ này, hãy xem mặt chữ mẫu ở trên.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MÔ PHỎNG NÉT VIẾT (STROKE ANIMATION PLAYER) */}
              {activeTab === 'animate' && (
                <div className="w-full flex flex-col items-center space-y-6">
                  {/* Ô vẽ Kanji với lưới hình chữ Điền / chữ Mễ */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner overflow-hidden">
                    {/* Đường lưới nét đứt chữ Điền (田) */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full border-t border-dashed border-slate-300 dark:border-slate-800 top-1/2 -translate-y-1/2 relative" />
                      <div className="w-full h-full border-l border-dashed border-slate-300 dark:border-slate-800 left-1/2 -translate-x-1/2 absolute top-0" />
                    </div>

                    {/* SVG Render Nét Viết */}
                    <svg
                      viewBox="0 0 109 109"
                      className="w-full h-full p-4 relative z-10"
                    >
                      {/* 1. Nét mờ nền (Ghost guide) */}
                      {strokesList.map((stroke, idx) => (
                        <path
                          key={`ghost-${idx}`}
                          d={stroke.d}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-slate-200 dark:text-slate-800"
                        />
                      ))}

                      {/* 2. Các nét đã vẽ (Stroke progress) */}
                      {strokesList.slice(0, currentStroke).map((stroke, idx) => {
                        const isLatest = idx === currentStroke - 1;
                        return (
                          <path
                            key={`drawn-${idx}`}
                            d={stroke.d}
                            fill="none"
                            stroke={isLatest ? '#2563eb' : '#0f172a'}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={isLatest ? 'stroke-blue-600 dark:stroke-sky-400' : 'stroke-slate-900 dark:stroke-slate-100'}
                          />
                        );
                      })}

                      {/* 3. Hiển thị số thứ tự nét */}
                      {showNumbers &&
                        strokesList.slice(0, currentStroke).map((stroke, idx) => {
                          if (stroke.numX === undefined || stroke.numY === undefined) return null;
                          const isLatest = idx === currentStroke - 1;
                          return (
                            <text
                              key={`num-${idx}`}
                              x={stroke.numX}
                              y={stroke.numY}
                              fontSize="9"
                              fontWeight="bold"
                              className={isLatest ? 'fill-blue-600 dark:fill-sky-400 font-black' : 'fill-slate-400 dark:fill-slate-500'}
                            >
                              {stroke.num || idx + 1}
                            </text>
                          );
                        })}
                    </svg>

                    {/* Badge số nét hiện tại góc dưới */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 shadow-xs">
                      Nét {currentStroke} / {strokesList.length}
                    </div>
                  </div>

                  {/* Thanh điều khiển Video Player (Play / Pause / Next / Prev / Slider) */}
                  <div className="w-full max-w-md space-y-3">
                    {/* Range Slider điều khiển số nét */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-400">1</span>
                      <input
                        type="range"
                        min={0}
                        max={strokesList.length}
                        value={currentStroke}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setCurrentStroke(Number(e.target.value));
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-400">{strokesList.length}</span>
                    </div>

                    {/* Controller Buttons */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={handleReplay}
                          title="Vẽ lại từ đầu"
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStroke((prev) => Math.max(0, prev - 1));
                          }}
                          disabled={currentStroke <= 0}
                          title="Nét trước"
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (isPlaying) {
                              setIsPlaying(false);
                            } else {
                              handleStartPlay();
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-blue-500/20 transition active:scale-95"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Tạm dừng</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{currentStroke >= strokesList.length ? 'Phát lại' : 'Tự vẽ'}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStroke((prev) => Math.min(strokesList.length, prev + 1));
                          }}
                          disabled={currentStroke >= strokesList.length}
                          title="Nét tiếp theo"
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tốc độ & Số nét toggle */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowNumbers(!showNumbers)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                            showNumbers
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-300'
                              : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                          title="Bật/Tắt số thứ tự nét"
                        >
                          <span className="text-[10px] font-mono">123</span>
                        </button>

                        <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500">
                          {[0.5, 1, 1.5].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => setSpeed(spd)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                                speed === spd
                                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TẬP VIẾT TRỰC TIẾP (CANVAS DRAWING) */}
              {activeTab === 'write' && (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex items-center justify-center">
                    {/* Lưới hình chữ Điền / chữ Mễ */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full border-t border-dashed border-slate-300 dark:border-slate-800 top-1/2 -translate-y-1/2 relative" />
                      <div className="w-full h-full border-l border-dashed border-slate-300 dark:border-slate-800 left-1/2 -translate-x-1/2 absolute top-0" />
                    </div>

                    {/* Mẫu mờ chữ Kanji (Ghost overlay) */}
                    {showGhost && (
                      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-20">
                        <span className="font-jp font-bold text-[180px] sm:text-[220px] text-slate-800 dark:text-slate-200">
                          {kanji}
                        </span>
                      </div>
                    )}

                    {/* HTML5 Canvas vẽ tay */}
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={320}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDraw}
                      onMouseLeave={handleStopDraw}
                      onTouchStart={handleStartDraw}
                      onTouchMove={handleDraw}
                      onTouchEnd={handleStopDraw}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
                    />
                  </div>

                  {/* Thanh công cụ vẽ: Xóa, Hoàn tác, Mẫu mờ */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowGhost(!showGhost)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition ${
                        showGhost
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-sky-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {showGhost ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showGhost ? 'Ẩn mẫu mờ' : 'Hiện mẫu mờ'}</span>
                    </button>

                    <button
                      onClick={handleUndo}
                      disabled={history.length === 0}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-bold flex items-center space-x-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Hoàn tác</span>
                    </button>

                    <button
                      onClick={initCanvas}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center space-x-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa hết</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: LƯỚI TỪNG NÉT (STROKE PROGRESSION GRID) */}
              {activeTab === 'grid' && (
                <div className="w-full">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center">
                    Trình tự thêm từng nét từ nét đầu tiên đến khi hoàn thành chữ {kanji} ({hanviet})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1">
                    {strokesList.map((_, index) => {
                      const count = index + 1;
                      return (
                        <div
                          key={`stage-${count}`}
                          onClick={() => {
                            setCurrentStroke(count);
                            setActiveTab('animate');
                          }}
                          className="cursor-pointer group flex flex-col items-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition shadow-2xs hover:shadow-sm"
                        >
                          <div className="w-16 h-16 relative">
                            <svg viewBox="0 0 109 109" className="w-full h-full">
                              {/* Background Ghost */}
                              {strokesList.map((stroke, sIdx) => (
                                <path
                                  key={`grid-ghost-${sIdx}`}
                                  d={stroke.d}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-slate-200 dark:text-slate-800"
                                />
                              ))}
                              {/* Strokes up to current count */}
                              {strokesList.slice(0, count).map((stroke, sIdx) => {
                                const isCurrent = sIdx === count - 1;
                                return (
                                  <path
                                    key={`grid-s-${sIdx}`}
                                    d={stroke.d}
                                    fill="none"
                                    stroke={isCurrent ? '#dc2626' : '#0f172a'}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={isCurrent ? 'stroke-rose-600 dark:stroke-rose-400' : 'stroke-slate-900 dark:stroke-slate-100'}
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          <span className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400">
                            Nét {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Chuẩn nét vector KanjiVG</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold text-slate-700 dark:text-slate-200 transition"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
