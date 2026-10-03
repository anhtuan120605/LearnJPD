import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KanjiItem, WordItem } from '../types';
import { 
  Calendar, 
  Target, 
  Flame, 
  Trophy, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Volume2, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  HelpCircle, 
  Layers, 
  PenTool, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Check,
  X,
  FileText,
  Settings,
  Zap,
  GraduationCap,
  Heart,
  MapPin,
  Scan
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import * as wanakana from 'wanakana';
import confetti from 'canvas-confetti';
import { KanjiStrokeModal } from './KanjiStrokeModal';

interface KanjiRoadmapViewProps {
  kanjiList: KanjiItem[];
  allVocabWords?: WordItem[];
  currentLevel: string;
  onSelectLevel: (lvl: string) => void;
  masteredKanji: string[];
  favoriteKanji: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  streak?: number;
}

// Danh mục chủ đề logic theo từng ngày học (Thematic Roadmap)
export const ROADMAP_DAY_TOPICS: Record<string, Record<number, string>> = {
  N5: {
    1: 'Số đếm cơ bản (1 ~ 10)',
    2: 'Số lớn, Tiền tệ & Thứ ngày trong tuần',
    3: 'Thời gian, Buổi & Lịch trình',
    4: 'Phương hướng & Vị trí không gian',
    5: 'Con người & Gia đình ruột thịt',
    6: 'Bộ phận cơ thể con người',
    7: 'Trường học, Danh xưng & Quốc gia',
    8: 'Thiên nhiên, Thời tiết & Động thực vật',
    9: 'Tính chất & Màu sắc cơ bản',
    10: 'Hành động di chuyển & Ăn uống',
    11: 'Hoạt động giao tiếp & Ngôn ngữ',
    12: 'Giao thông, Địa điểm & Xã hội'
  },
  N4: {
    1: 'Bộ phận cơ thể & Sức khoẻ',
    2: 'Y tế & Quan hệ gia đình',
    3: 'Bốn mùa & Buổi trong ngày',
    4: 'Động vật & Thế giới tự nhiên',
    5: 'Màu sắc & Tính chất cơ bản',
    6: 'Đánh giá & Trạng thái',
    7: 'Giao thông & Phương hướng',
    8: 'Học tập & Ngôn ngữ chữ viết',
    9: 'Thi cử & Hoạt động trí tuệ',
    10: 'Ẩm thực & Mua sắm',
    11: 'Nhà cửa & Nơi công cộng',
    12: 'Hành động sinh hoạt thường nhật',
    13: 'Nghệ thuật, Giải trí & Du lịch',
    14: 'Công việc, Xã hội & Đời sống'
  },
  N3: {
    1: 'Đô thị & Giao thông công cộng',
    2: 'Thời tiết & Biến đổi môi trường',
    3: 'Con người & Tính cách ứng xử',
    4: 'Cảm xúc & Tâm lý học',
    5: 'Kinh doanh & Thương mại',
    6: 'Luật pháp & Xã hội',
    7: 'Khoa học & Công nghệ',
  }
};

// Bảng mẹo nhớ Mnemonic cho các chữ Hán phổ biến
const KANJI_MNEMONICS: Record<string, string> = {
  '一': '1 (一) bước thẳng sang ngang.',
  '二': '2 (二) nét gạch ngang song song.',
  '三': '3 (三) nét gạch xếp chồng từ trên xuống.',
  '四': 'Cửa sổ có rèm chia làm 4 (四) góc.',
  '五': 'Số 5 (五) gồm 4 nét gấp khúc giao nhau.',
  '六': 'Cái nón và 2 chân đang bước (Lục - 6).',
  '七': 'Số 7 (七) chém một nhát ngang qua.',
  '八': 'Hai nét choãi ra như miệng núi lửa (Bát - 8).',
  '九': 'Một người đang vươn tay gập lại (Cửu - 9).',
  '十': 'Cây thánh giá hình chữ Thập (10).',
  '百': 'Một (一) cộng với chữ Bạch (白) là Bách (100).',
  '千': 'Một (一) phẩy trên chữ Thập (十) thành Thiên (1000).',
  '万': 'Một nhát chém tạo nên Vạn (10.000).',
  '円': 'Đồng tiền xu Yên Nhật bo góc tròn trịa.',
  '日': 'Hình vẽ mặt trời hình vuông có tia sáng ở giữa.',
  '月': 'Vầng trăng khuyết lưỡi liềm có mây che.',
  '火': 'Ngọn lửa đang bốc cháy bập bùng với tàn tro.',
  '水': 'Dòng nước chảy xiết tung bọt hai bên.',
  '木': 'Cây có tán lá phía trên và rễ đâm xuống đất.',
  '金': 'Vàng bạc quý hiếm được chôn dưới mái nhà trong lòng đất.',
  '土': 'Mầm cây nhú lên từ mặt đất (Thổ).',
  '山': 'Ba ngọn núi nhấp nhô nối tiếp nhau.',
  '川': 'Ba dòng nước của con sông cùng chảy xiết.',
  '田': 'Thửa ruộng màu mỡ chia thành 4 ô vuông.',
  '人': 'Người đứng vững bằng hai chân.',
  '口': 'Chiếc miệng mở to hình chữ nhật.',
  '目': 'Mắt có con ngươi ở giữa.',
  '手': 'Bàn tay 5 ngón vươn ra cầm nắm.',
  '足': 'Bàn chân có đầu gối và mắt cá.',
  '耳': 'Chiếc tai để lắng nghe.',
  '学': 'Đứa trẻ ngồi dưới mái nhà học tập.',
  '生': 'Mầm cây non sinh sôi nảy nở.',
  '先': 'Người đi trước dẫn đường (Tiên).',
  '大': 'Người dang rộng hai tay hai chân tỏ vẻ to lớn.',
  '小': 'Một vật nhỏ bé bị chia cắt làm ba mảnh.',
  '中': 'Mũi tên đâm xuyên qua hồng tâm chính giữa.',
  '長': 'Người tóc dài cầm gậy đi trước (Trường).',
  '本': 'Gốc cây (木) đánh dấu một vạch ở rễ (Bản/Sách).',
  '男': 'Ruộng (田) có sức mạnh (力) của người Đàn ông cày cấy.',
  '女': 'Hình người Phụ nữ ngồi xếp gối dịu dàng.',
  '子': 'Đứa bé quấn tã vẫy tay mỉm cười.',
  '父': 'Người Cha nghiêm khắc giơ hai tay ra hiệu.',
  '母': 'Người Mẹ với hai bầu sữa nuôi con lớn khôn.',
  '友': 'Hai bàn tay nắm chặt tình Bạn hữu thân thiết.',
  '上': 'Một nét vạch chỉ phương hướng ở phía Trên.',
  '下': 'Một nét vạch chỉ phương hướng ở phía Dưới.',
  '左': 'Bàn tay cầm thước ê-ke đo đạc bên Trái.',
  '右': 'Bàn tay đưa đồ ăn vào Miệng (口) bên Phải.',
  '東': 'Mặt trời (日) mọc xuyên qua tán cây (木) phía Đông.',
  '西': 'Con chim bay về tổ dưới ánh hoàng hôn phía Tây.',
  '南': 'Ánh nắng ấm áp tràn ngập phía Nam qua khung cửa.',
  '北': 'Hai người quay lưng vào nhau tránh gió lạnh phương Bắc.',
  '行': 'Ngã tư đường dẫn tới nơi muốn Đi (Hành).',
  '来': 'Bông lúa nặng hạt báo hiệu mùa vụ Đến (Lai).',
  '食': 'Dưới mái nhà (人) có bát cơm trắng (良) thơm ngon để Ăn.',
  '飲': 'Người há to miệng (欠) bên thức ăn để Uống nước.',
  '見': 'Đôi mắt to (目) trên đôi chân đang bước đi Nhìn ngắm.',
  '聞': 'Ghé tai (耳) vào cánh cổng (門) để Lắng nghe tin tức.',
  '読': 'Dùng lời nói (言) bán (売) chữ ra để Đọc sách.',
  '書': 'Bàn tay cầm bút lông viết chữ lên trang giấy (Thư).',
  '話': 'Lời nói (言) phát ra từ chiếc lưỡi (舌) để Nói chuyện.',
  '語': 'Lời nói (言) của năm (五) người trong miệng (口) tạo nên Ngôn ngữ.',
  '休': 'Người (亻) tựa lưng vào gốc cây (木) để Nghỉ ngơi.',
  '車': 'Cỗ xe ngựa nhìn từ trên cao xuống có trục bánh xe.',
  '電': 'Cơn mưa (雨) kèm theo tia chớp lóe lên dòng Điện.',
  '雨': 'Những hạt mưa rơi tí tách từ đám mây trên trời.',
  '気': 'Hơi nước bốc lên từ nồi cơm đang sôi tạo thành Khí.',
  '天': 'Người (大) dang tay, phía trên đầu là bầu Trời (Thiên).',
  '高': 'Toà tháp cao tầng có mái vòm nhô lên cao vút.',
  '白': 'Mặt trời (日) ló rạng tia sáng đầu tiên màu Trắng (Bạch).',
  '何': 'Người (亻) vác trên vai vật gì (何) thế kia?',
  '国': 'Vùng đất có biên giới bao quanh cất giữ Ngọc quý (Quốc).',
  '名': 'Vào chiều tối (夕), phải cất tiếng Miệng (口) gọi Tên nhau.',
  '年': 'Mỗi năm lúa chín một lần trải qua 4 mùa (Niên).',
  '時': 'Mặt trời (日) mọc bên ngôi chùa (寺) báo Thời gian.',
  '半': 'Bát chia làm đôi lấy một Nửa (Bán).',
  '午': 'Cái chày giã gạo vào chính Ngọ giữa ngày.',
  '前': 'Bước chân đi Trước về phía thuyền trăng.',
  '後': 'Bước chân đi chậm rãi bước theo Sau.',
  '間': 'Ánh mặt trời (日) lọt qua khe Cổng (門) thành Gian/Khoảng giữa.',
  '毎': 'Người phụ nữ trùm khăn Mỗi ngày chăm sóc gia đình.',
  '校': 'Ngôi trường làm bằng Gỗ (木) nơi mọi người tụ Hội (交).'
};

export const KanjiRoadmapView: React.FC<KanjiRoadmapViewProps> = ({
  kanjiList,
  allVocabWords = [],
  currentLevel,
  onSelectLevel,
  masteredKanji,
  favoriteKanji,
  onToggleMaster,
  onToggleFavorite,
  streak = 0
}) => {
  // Chế độ xem: 'dashboard' (danh sách ngày) | 'study' (học chi tiết 10 chữ) | 'test' (kiểm tra 10 chữ)
  const [viewState, setViewState] = useState<'dashboard' | 'study' | 'test'>('dashboard');

  // Ngày đang chọn (1-indexed)
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [activeKanjiIndex, setActiveKanjiIndex] = useState<number>(0);

  // Chế độ kiểm tra: Hán Việt | Từ vựng | Nhồi nhét | Viết | Đọc hiểu
  const [testMode, setTestMode] = useState<'hanviet' | 'vocab' | 'cram' | 'write' | 'reading'>('vocab');
  // Chế độ con của Từ vựng: 'reading' (Cách đọc) | 'word' (Chọn từ vựng)
  const [vocabSubMode, setVocabSubMode] = useState<'reading' | 'word'>('reading');
  const [testQuestionIdx, setTestQuestionIdx] = useState<number>(0);
  const [testScore, setTestScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [cramInput, setCramInput] = useState<string>('');
  const [cramStatus, setCramStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showStrokeModal, setShowStrokeModal] = useState<boolean>(false);

  // Bảng vẽ luyện viết
  const [showCanvas, setShowCanvas] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Chế độ Lộ trình: 'default' (10 chữ/ngày) | 'custom' (Lộ trình của tôi tùy chỉnh cá nhân)
  const [roadmapType, setRoadmapType] = useState<'default' | 'custom'>(() => {
    return (localStorage.getItem('learnjpd_kanji_roadmap_type') as 'default' | 'custom') || 'default';
  });

  // Tùy chỉnh số lượng học / ngày cho Lộ trình của tôi (Mặc định 10)
  const [customKanjiPerDay, setCustomKanjiPerDay] = useState<number>(() => {
    const saved = localStorage.getItem('learnjpd_kanji_per_day');
    return saved ? Math.max(1, Math.min(50, parseInt(saved, 10))) : 10;
  });

  // Tùy chỉnh đối tượng học tập cá nhân: 'all' | 'unlearned' | 'favorite'
  const [customFilterTarget, setCustomFilterTarget] = useState<'all' | 'unlearned' | 'favorite'>(() => {
    return (localStorage.getItem('learnjpd_kanji_custom_target') as any) || 'all';
  });

  // Tùy chọn tự động đánh dấu đã thuộc và đưa vào SRS khi đạt >= 80% điểm bài test ngày
  const [autoMasterOnPass, setAutoMasterOnPass] = useState<boolean>(() => {
    const saved = localStorage.getItem('learnjpd_auto_master_kanji_on_pass');
    return saved !== null ? saved === 'true' : true; // Mặc định là bật (true)
  });

  // Lưu cấu hình vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('learnjpd_kanji_roadmap_type', roadmapType);
  }, [roadmapType]);

  useEffect(() => {
    localStorage.setItem('learnjpd_kanji_per_day', customKanjiPerDay.toString());
  }, [customKanjiPerDay]);

  useEffect(() => {
    localStorage.setItem('learnjpd_kanji_custom_target', customFilterTarget);
  }, [customFilterTarget]);

  useEffect(() => {
    localStorage.setItem('learnjpd_auto_master_kanji_on_pass', autoMasterOnPass.toString());
  }, [autoMasterOnPass]);

  // Danh sách Kanji thực tế theo chế độ lộ trình
  const effectiveKanjiList = useMemo(() => {
    if (roadmapType === 'default') {
      return kanjiList;
    }
    if (customFilterTarget === 'unlearned') {
      return kanjiList.filter(k => !masteredKanji.includes(k.id));
    }
    if (customFilterTarget === 'favorite') {
      return kanjiList.filter(k => favoriteKanji.includes(k.id));
    }
    return kanjiList;
  }, [kanjiList, roadmapType, customFilterTarget, masteredKanji, favoriteKanji]);

  // Số lượng chữ học mỗi ngày đang áp dụng
  const activeKanjiPerDay = roadmapType === 'default' ? 10 : customKanjiPerDay;
  const totalDays = Math.ceil(effectiveKanjiList.length / activeKanjiPerDay) || 1;

  // Đảm bảo currentDay luôn hợp lệ
  const safeDay = Math.min(Math.max(currentDay, 1), totalDays);

  // Danh sách chữ của ngày đang chọn
  const dayKanjiList = useMemo(() => {
    const start = (safeDay - 1) * activeKanjiPerDay;
    return effectiveKanjiList.slice(start, start + activeKanjiPerDay);
  }, [effectiveKanjiList, safeDay, activeKanjiPerDay]);

  // Chủ đề logic của ngày học hiện tại
  const currentDayTopic = useMemo(() => {
    if (roadmapType === 'default') {
      return ROADMAP_DAY_TOPICS[currentLevel]?.[safeDay] || `Chuyên đề ${currentLevel} • Bài ${safeDay}`;
    }
    return `Lộ trình cá nhân • Ngày ${safeDay} (${dayKanjiList.length} chữ)`;
  }, [currentLevel, safeDay, roadmapType, dayKanjiList.length]);

  // Bộ lọc cấp độ từ vựng ghép ('current' = chỉ cấp độ đang học, 'all' = tất cả)
  const [vocabLevelFilter, setVocabLevelFilter] = useState<'current' | 'all'>('current');
  const [vocabPracticeModalOpen, setVocabPracticeModalOpen] = useState<boolean>(false);
  const [vocabPracticeIdx, setVocabPracticeIdx] = useState<number>(0);
  const [vocabPracticeFlipped, setVocabPracticeFlipped] = useState<boolean>(false);

  const currentKanji = dayKanjiList[activeKanjiIndex] || dayKanjiList[0] || kanjiList[0];

  // Tìm từ vựng thực tế chứa chữ Hán này, ưu tiên đúng trình độ đang học
  const kanjiVocab = useMemo(() => {
    if (!currentKanji) return [];

    // Tìm tất cả từ vựng chứa chữ Kanji này trong giáo trình Minna & N-level
    const repoMatches = allVocabWords.filter(w => w.kanji && w.kanji.includes(currentKanji.kanji));
    
    // Lọc theo cấp độ hiện tại (N5, N4, N3, N2, N1)
    const currentLevelMatches = repoMatches.filter(w => w.level === currentLevel);

    // Chọn danh sách theo filter (nếu 'current' không có từ nào thì fallback sang all)
    const activeMatches = (vocabLevelFilter === 'current' && currentLevelMatches.length > 0)
      ? currentLevelMatches
      : (vocabLevelFilter === 'current' ? repoMatches : repoMatches);

    const fromRepo = activeMatches.map(w => ({
      word: w.kanji,
      reading: w.kana,
      meaning: w.meaning,
      hanviet: w.hanviet || currentKanji.hanviet,
      level: w.level || currentLevel,
      lesson: w.lesson
    }));

    // Ví dụ định sẵn trong chữ Hán
    const predefined = (currentKanji.examples || []).map(ex => ({
      word: ex.word,
      reading: ex.reading,
      meaning: ex.meaning,
      hanviet: currentKanji.hanviet,
      level: currentLevel,
      lesson: undefined
    }));

    // Gộp và loại trùng
    const combined = [...fromRepo];
    for (const item of predefined) {
      if (!combined.some(c => c.word === item.word)) {
        combined.push(item);
      }
    }
    return combined.slice(0, 15);
  }, [currentKanji, allVocabWords, currentLevel, vocabLevelFilter]);

  // Thống kê ngày
  const masteredCount = effectiveKanjiList.filter(k => masteredKanji.includes(k.id)).length;
  const progressPercent = effectiveKanjiList.length > 0 ? Math.round((masteredCount / effectiveKanjiList.length) * 100) : 0;
  const completedDays = Math.floor(masteredCount / activeKanjiPerDay);

  // Xử lý canvas vẽ nét
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Trạng thái kết thúc bài kiểm tra
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);

  // Khởi động lại bài test
  const handleRestartTest = () => {
    setTestQuestionIdx(0);
    setTestScore(0);
    setIsTestFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setCramInput('');
    setCramStatus('idle');
  };

  // Tổng hợp toàn bộ từ vựng ghép của các chữ Kanji trong Ngày học hiện tại
  const dayVocabList = useMemo(() => {
    if (dayKanjiList.length === 0) return [];
    const list: {
      word: string;
      reading: string;
      meaning: string;
      hanviet: string;
      level: string;
      kanjiChar: string;
    }[] = [];
    const seen = new Set<string>();

    dayKanjiList.forEach(k => {
      (k.examples || []).forEach(ex => {
        const key = `${ex.word}__${ex.reading}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            word: ex.word,
            reading: ex.reading,
            meaning: ex.meaning,
            hanviet: ex.hanviet || k.hanviet,
            level: ex.level || currentLevel,
            kanjiChar: k.kanji,
          });
        }
      });
    });
    return list;
  }, [dayKanjiList, currentLevel]);

  // Bộ câu hỏi trắc nghiệm từ vựng ghép theo từng ngày (VD: Ngày 1 có ~87 câu từ vựng)
  const vocabTestQuestions = useMemo(() => {
    if (dayVocabList.length === 0) return [];

    const allReadings = Array.from(new Set(dayVocabList.map(v => v.reading).filter(Boolean)));
    const fallbackReadings = ['あした', 'いち', 'いちにち', 'いっしょうけんめい', 'きょう', 'きのう', 'ほん', 'みず', 'ともだち', 'がくせい', 'せんせい', 'にほん'];
    const allWords = Array.from(new Set(dayVocabList.map(v => v.word).filter(Boolean)));
    const fallbackWords = ['一日', '一月', '一人', '二日', '二人', '三日', '三人', '四日', '四人', '五日', '六日'];

    return dayVocabList.map((item) => {
      // 3 lựa chọn cách đọc sai
      const otherReadings = allReadings.filter(r => r !== item.reading);
      const shuffledOtherReadings = [...otherReadings].sort(() => 0.5 - Math.random());
      const distractors = shuffledOtherReadings.slice(0, 3);
      for (const fb of fallbackReadings) {
        if (distractors.length >= 3) break;
        if (fb !== item.reading && !distractors.includes(fb)) {
          distractors.push(fb);
        }
      }
      const readingChoices = [item.reading, ...distractors.slice(0, 3)].sort(() => 0.5 - Math.random());
      const correctReadingIdx = readingChoices.indexOf(item.reading);

      // 3 lựa chọn từ chữ Hán sai
      const otherWords = allWords.filter(w => w !== item.word);
      const shuffledOtherWords = [...otherWords].sort(() => 0.5 - Math.random());
      const wordDistractors = shuffledOtherWords.slice(0, 3);
      for (const fw of fallbackWords) {
        if (wordDistractors.length >= 3) break;
        if (fw !== item.word && !wordDistractors.includes(fw)) {
          wordDistractors.push(fw);
        }
      }
      const wordChoices = [item.word, ...wordDistractors.slice(0, 3)].sort(() => 0.5 - Math.random());
      const correctWordIdx = wordChoices.indexOf(item.word);

      return {
        item,
        readingChoices,
        correctReadingIdx,
        wordChoices,
        correctWordIdx,
      };
    });
  }, [dayVocabList]);

  // Bộ câu hỏi Hán Việt (10 chữ của Ngày)
  const testQuestions = useMemo(() => {
    if (dayKanjiList.length === 0) return [];
    return dayKanjiList.map((k) => {
      const others = kanjiList.filter(other => other.id !== k.id);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const allChoices = [k, ...shuffledOthers].sort(() => 0.5 - Math.random());
      const correctIdx = allChoices.findIndex(c => c.id === k.id);

      const sampleVocab = (k.examples && k.examples[0]) ? {
        kanji: k.examples[0].word,
        kana: k.examples[0].reading,
        meaning: k.examples[0].meaning
      } : {
        kanji: k.kanji,
        kana: k.onyomi[0] || k.kunyomi[0] || '',
        meaning: k.meanings_vi[0] || ''
      };

      return {
        kanji: k,
        choices: allChoices,
        correctIdx,
        vocab: sampleVocab
      };
    });
  }, [dayKanjiList, kanjiList]);

  const isVocabTest = testMode === 'vocab';
  const totalTestCount = isVocabTest ? vocabTestQuestions.length : testQuestions.length;
  const currentVocabQ = vocabTestQuestions[testQuestionIdx] || vocabTestQuestions[0];
  const currentQ = testQuestions[testQuestionIdx] || testQuestions[0];

  // Xử lý chọn đáp án
  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    let isCorrect = false;
    if (testMode === 'hanviet') {
      isCorrect = idx === currentQ.correctIdx;
      if (isCorrect) speakJapanese(currentQ.kanji.kanji);
    } else if (testMode === 'vocab' && currentVocabQ) {
      if (vocabSubMode === 'reading') {
        isCorrect = idx === currentVocabQ.correctReadingIdx;
        speakJapanese(currentVocabQ.item.reading || currentVocabQ.item.word);
      } else {
        isCorrect = idx === currentVocabQ.correctWordIdx;
        speakJapanese(currentVocabQ.item.word);
      }
    }

    if (isCorrect) {
      setTestScore(s => s + 1);
    }
  };

  // Nút Bó tay (Bỏ qua và xem đáp án)
  const handleGiveUp = () => {
    if (isAnswered) return;
    setSelectedOption(-1);
    setIsAnswered(true);
    if (testMode === 'vocab' && currentVocabQ) {
      speakJapanese(currentVocabQ.item.reading || currentVocabQ.item.word);
    } else if (currentQ) {
      speakJapanese(currentQ.kanji.kanji);
    }
  };

  // Chuyển sang câu tiếp theo
  const handleNextQuestion = () => {
    if (testQuestionIdx + 1 < totalTestCount) {
      setTestQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setCramInput('');
      setCramStatus('idle');
    } else {
      setIsTestFinished(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      // Tự động đánh dấu đã thuộc vào SRS nếu đạt từ 80% điểm trở lên
      const passRate = totalTestCount > 0 ? (testScore / totalTestCount) : 0;
      if (passRate >= 0.8 && autoMasterOnPass) {
        dayKanjiList.forEach(k => {
          if (!masteredKanji.includes(k.id)) {
            onToggleMaster(k.id);
          }
        });
      }
    }
  };

  // Đánh dấu toàn bộ chữ của ngày học hiện tại là đã thuộc
  const handleMasterAllDayKanji = () => {
    dayKanjiList.forEach(k => {
      if (!masteredKanji.includes(k.id)) {
        onToggleMaster(k.id);
      }
    });
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
  };

  // Gõ từ và tự động lọc Telex
  const handleCramInput = (val: string) => {
    const normalized = val
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, d => d === 'đ' ? 'd' : 'D');
    setCramInput(wanakana.toHiragana(normalized, { IMEMode: true }));
  };

  const handleCheckCram = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered) return;
    const clean = cramInput.trim().toLowerCase();
    if (!clean) return;

    const allReadings = [
      ...currentQ.kanji.onyomi.map(o => o.toLowerCase()),
      ...currentQ.kanji.kunyomi.map(k => k.replace(/[\.\-]/g, '').toLowerCase()),
      (currentQ.vocab.kana || '').toLowerCase()
    ];

    const isRight = allReadings.includes(clean);
    setIsAnswered(true);
    if (isRight) {
      setCramStatus('correct');
      setTestScore(s => s + 1);
      speakJapanese(currentQ.kanji.kanji);
    } else {
      setCramStatus('wrong');
    }
  };

  // Hỗ trợ phím tắt 1-4, Enter, Space
  useEffect(() => {
    if (viewState !== 'test' || isTestFinished) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (['1', '2', '3', '4'].includes(e.key) && !isAnswered && (testMode === 'hanviet' || testMode === 'vocab')) {
        handleSelectOption(parseInt(e.key, 10) - 1);
      } else if ((e.key === ' ' || e.key === 'Enter') && isAnswered) {
        e.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, isTestFinished, isAnswered, testMode, testQuestionIdx, totalTestCount, currentVocabQ, currentQ, vocabSubMode]);

  // ==========================================
  // SCREEN 3: MÀN HÌNH KIỂM TRA (Chuẩn giao diện trắc nghiệm Từ vựng & Kanji)
  // ==========================================
  if (viewState === 'test') {
    const progressPercent = totalTestCount > 0
      ? Math.min(100, Math.round(((testQuestionIdx + 1) / totalTestCount) * 100))
      : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header: < Ngày X  và Số câu X / Y (VD: 7 / 87) */}
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => { setViewState('study'); handleRestartTest(); }}
            className="flex items-center space-x-1 font-bold text-slate-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Ngày {safeDay}</span>
          </button>
          <span className="font-bold text-slate-600 dark:text-zinc-300 font-mono text-sm">
            {testQuestionIdx + 1} / {totalTestCount}
          </span>
        </div>

        {/* Thanh tiến trình màu xanh lục chạy dài toàn màn hình */}
        <div className="w-full bg-slate-200/80 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#05b651] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* MÀN HÌNH HOÀN THÀNH */}
        {isTestFinished ? (
          (() => {
            const passRate = totalTestCount > 0 ? (testScore / totalTestCount) : 0;
            const isPassed = passRate >= 0.8;
            const unmasteredInDay = dayKanjiList.filter(k => !masteredKanji.includes(k.id)).length;
            const allMastered = unmasteredInDay === 0;

            return (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-6 animate-in zoom-in-95 duration-200 max-w-xl mx-auto">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${
                  isPassed ? 'bg-emerald-500/10 text-[#05b651]' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <Trophy className="w-10 h-10 animate-bounce" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {isPassed ? 'Hoàn Thành Xuất Sắc!' : 'Hoàn Thành Kiểm Tra!'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    Bạn đã trả lời đúng <strong className="text-[#05b651] font-extrabold text-lg">{testScore}</strong> / {totalTestCount} câu ({Math.round(passRate * 100)}%) của Ngày {safeDay}.
                  </p>
                </div>

                {/* Hộp thông báo ghi nhận Đã thuộc & SRS */}
                <div className={`p-4 rounded-2xl border text-left space-y-2.5 ${
                  isPassed 
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50' 
                    : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPassed ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                      {isPassed ? 'Ghi nhận tiến độ & Ôn tập ngắt quãng (SRS)' : 'Trạng thái ghi nhớ'}
                    </span>
                  </div>

                  {isPassed ? (
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {allMastered 
                        ? `🎉 Toàn bộ ${dayKanjiList.length} chữ Kanji của Ngày ${safeDay} đã được ghi nhận ĐÃ THUỘC và kích hoạt vào chu kỳ Ôn tập ngắt quãng (SRS)!`
                        : autoMasterOnPass 
                          ? `🎉 Bạn đã đạt trên 80% điểm! Hệ thống đã TỰ ĐỘNG ĐÁNH DẤU ${dayKanjiList.length} chữ Kanji của Ngày ${safeDay} là ĐÃ THUỘC và đưa vào hàng đợi Ôn tập ngắt quãng (SRS).`
                          : `Bạn đã đạt trên 80% điểm. Còn ${unmasteredInDay} chữ chưa đánh dấu đã thuộc.`
                      }
                    </p>
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      Cần đạt từ <strong>80% điểm</strong> để tự động xác nhận Đã thuộc. Hãy rèn luyện thêm hoặc tự đánh dấu chữ bạn đã chắc chắn nhé!
                    </p>
                  )}

                  {/* Nút hành động đánh dấu thủ công nếu chưa thuộc hết */}
                  {!allMastered && (
                    <button
                      onClick={handleMasterAllDayKanji}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Đánh dấu tất cả {unmasteredInDay} chữ còn lại là ĐÃ THUỘC ngay</span>
                    </button>
                  )}

                  {/* Checkbox tùy chọn tự động */}
                  <label className="flex items-center space-x-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoMasterOnPass}
                      onChange={(e) => setAutoMasterOnPass(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium select-none">
                      Tự động đánh dấu Đã thuộc & đưa vào SRS khi đạt từ 80% điểm
                    </span>
                  </label>
                </div>

                {/* Các nút hành động */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleRestartTest}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#05b651] hover:bg-[#049a44] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm lại lần nữa</span>
                  </button>

                  {safeDay < totalDays && (
                    <button
                      onClick={() => {
                        setCurrentDay(prev => Math.min(prev + 1, totalDays));
                        setViewState('study');
                        setActiveKanjiIndex(0);
                      }}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition active:scale-95"
                    >
                      <span>Học tiếp Ngày {safeDay + 1}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setViewState('study')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs sm:text-sm transition"
                  >
                    <span>Về bài học Ngày {safeDay}</span>
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="space-y-6">
            {/* THẺ CÂU HỎI TRUNG TÂM (Dark Navy Box chuẩn theo ảnh) */}
            <div className="bg-[#242e44] text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-[#344161] relative">
              {/* Header bên trong thẻ: Loa phát âm bên trái, Sub-mode & Cài đặt bên phải */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isVocabTest && currentVocabQ) {
                      speakJapanese(currentVocabQ.item.reading || currentVocabQ.item.word);
                    } else if (currentQ) {
                      speakJapanese(currentQ.kanji.kanji);
                    }
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                  {testMode === 'vocab' && (
                    <div className="bg-[#1c2436] p-1 rounded-xl flex items-center border border-[#303c58]">
                      <button
                        onClick={() => { setVocabSubMode('reading'); setSelectedOption(null); setIsAnswered(false); }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          vocabSubMode === 'reading'
                            ? 'bg-[#05b651] text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Cách đọc
                      </button>
                      <button
                        onClick={() => { setVocabSubMode('word'); setSelectedOption(null); setIsAnswered(false); }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          vocabSubMode === 'word'
                            ? 'bg-[#05b651] text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Chọn từ vựng
                      </button>
                    </div>
                  )}

                  <button
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Cài đặt kiểm tra"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CHẾ ĐỘ 1: TỪ VỰNG GHÉP KANJI (Hiển thị đúng theo ảnh mẫu 1日 - NHẬT - 1 ngày, trong ngày, cả ngày) */}
              {testMode === 'vocab' && currentVocabQ && (
                <div className="space-y-6">
                  {/* Trọng tâm câu hỏi */}
                  <div className="text-center py-3">
                    {vocabSubMode === 'reading' ? (
                      <>
                        <h3 className="text-4xl sm:text-5xl font-bold font-jp text-white tracking-wide">
                          {currentVocabQ.item.word}
                        </h3>
                        <p className="text-sm font-bold text-[#05b651] uppercase tracking-wider mt-2.5">
                          {currentVocabQ.item.hanviet}
                        </p>
                        <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                          {currentVocabQ.item.meaning}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                          {currentVocabQ.item.meaning}
                        </h3>
                        <p className="text-base font-bold text-[#05b651] font-jp mt-2.5">
                          Cách đọc: {currentVocabQ.item.reading}
                        </p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                          Hán Việt: {currentVocabQ.item.hanviet}
                        </p>
                      </>
                    )}
                  </div>

                  {/* 4 Lựa chọn trả lời (2 Cột x 2 Hàng) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {(vocabSubMode === 'reading' ? currentVocabQ.readingChoices : currentVocabQ.wordChoices).map((choice, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = vocabSubMode === 'reading'
                        ? idx === currentVocabQ.correctReadingIdx
                        : idx === currentVocabQ.correctWordIdx;

                      let btnStyle = 'bg-[#2b364f]/90 border border-[#3c4a6b] hover:bg-[#344161] hover:border-blue-400/50 text-white';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-[#05b651]/20 border-[#05b651] text-emerald-300 ring-2 ring-[#05b651]/50';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/50';
                        } else {
                          btnStyle = 'bg-[#242e44]/40 border-[#303c56]/40 text-slate-500 opacity-40';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(idx)}
                          className={`p-4 rounded-xl text-left transition flex items-center group active:scale-98 ${btnStyle}`}
                        >
                          <span className="text-xs text-slate-400 font-mono w-5 shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-base sm:text-lg font-bold font-jp flex-1">
                            {choice}
                          </span>
                          {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-[#05b651] shrink-0" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Thanh điều hướng câu & Nút Bó tay bên dưới thẻ */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {isAnswered && (
                        <button
                          onClick={handleNextQuestion}
                          className="px-5 py-2.5 rounded-xl bg-[#05b651] hover:bg-[#049a44] text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
                        >
                          <span>{testQuestionIdx + 1 < totalTestCount ? 'Tiếp tục câu sau' : 'Xem kết quả'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isAnswered}
                      onClick={handleGiveUp}
                      className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1 py-1"
                    >
                      <Heart className="w-3.5 h-3.5 text-slate-400" />
                      <span>Câu này bó tay</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ 2: TRẮC NGHIỆM HÁN VIỆT */}
              {testMode === 'hanviet' && currentQ && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <h3 className="text-4xl sm:text-5xl font-black text-white tracking-wide uppercase">
                      {currentQ.kanji.hanviet}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {currentQ.kanji.meanings_vi[0] || ''}
                    </p>
                  </div>

                  {/* 4 Lựa chọn chữ Hán */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {currentQ.choices.map((c, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === currentQ.correctIdx;

                      let btnStyle = 'bg-[#2b364f]/90 border border-[#3c4a6b] hover:bg-[#344161] hover:border-blue-400/50 text-white';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-[#05b651]/20 border-[#05b651] text-emerald-300 ring-2 ring-[#05b651]/50';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/50';
                        } else {
                          btnStyle = 'bg-[#242e44]/40 border-[#303c56]/40 text-slate-500 opacity-40';
                        }
                      }

                      return (
                        <button
                          key={c.id || idx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(idx)}
                          className={`p-5 rounded-2xl text-center transition flex items-center justify-between group active:scale-98 ${btnStyle}`}
                        >
                          <span className="text-xs text-slate-400 font-mono w-5">
                            {idx + 1}
                          </span>
                          <span className="text-3xl sm:text-4xl font-jp font-bold flex-1 text-center">
                            {c.kanji}
                          </span>
                          <div className="w-5" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {isAnswered && (
                        <button
                          onClick={handleNextQuestion}
                          className="px-5 py-2.5 rounded-xl bg-[#05b651] hover:bg-[#049a44] text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
                        >
                          <span>{testQuestionIdx + 1 < totalTestCount ? 'Tiếp tục câu sau' : 'Xem kết quả'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isAnswered}
                      onClick={handleGiveUp}
                      className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1 py-1"
                    >
                      <Heart className="w-3.5 h-3.5 text-slate-400" />
                      <span>Câu này bó tay</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ 3: NHỒI NHÉT (TYPING TEST) */}
              {testMode === 'cram' && currentQ && (
                <form onSubmit={handleCheckCram} className="space-y-6">
                  <div className="text-center py-4">
                    <h3 className="text-5xl font-jp font-bold text-white">
                      {currentQ.kanji.kanji}
                    </h3>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <span className="text-xs font-extrabold text-[#05b651] uppercase tracking-widest bg-emerald-950/40 px-2 py-0.5 rounded">
                        Hán Việt: {currentQ.kanji.hanviet}
                      </span>
                      <span className="text-xs text-slate-300">
                        • {currentQ.kanji.meanings_vi[0]}
                      </span>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto space-y-3">
                    <input
                      type="text"
                      disabled={isAnswered}
                      value={cramInput}
                      onChange={e => handleCramInput(e.target.value)}
                      placeholder="Gõ cách đọc âm Kana (vd: いち / ichi)..."
                      autoFocus
                      className="w-full py-3.5 px-4 rounded-2xl border-2 border-[#3c4a6b] bg-[#1c2436] text-center font-jp text-lg text-white focus:outline-none focus:border-[#05b651] transition font-bold"
                    />

                    {!isAnswered && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setCramInput(currentQ.kanji.onyomi[0] || currentQ.kanji.kunyomi[0] || '')}
                          className="w-1/2 py-2.5 rounded-xl border border-[#3c4a6b] text-slate-300 hover:bg-white/10 text-xs font-bold transition"
                        >
                          Gợi ý đáp án
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 py-2.5 rounded-xl bg-[#05b651] hover:bg-[#049a44] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
                        >
                          Kiểm tra (Enter)
                        </button>
                      </div>
                    )}

                    {isAnswered && (
                      <div className={`p-3 rounded-2xl text-center text-xs font-bold ${
                        cramStatus === 'correct'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                      }`}>
                        {cramStatus === 'correct' ? (
                          <span>✓ Chính xác!</span>
                        ) : (
                          <span>Cách đọc đúng: {currentQ.kanji.onyomi.join(', ')} / {currentQ.kanji.kunyomi.join(', ')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {isAnswered && (
                    <div className="pt-2">
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-3 rounded-xl bg-[#05b651] hover:bg-[#049a44] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
                      >
                        <span>{testQuestionIdx + 1 < totalTestCount ? 'Tiếp tục câu sau' : 'Xem kết quả'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* CHẾ ĐỘ 4: LUYỆN VIẾT NÉT */}
              {testMode === 'write' && currentQ && (
                <div className="space-y-6 text-center">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase">
                      Viết chữ: {currentQ.kanji.hanviet} ({currentQ.kanji.kanji})
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Tổng số: {currentQ.kanji.strokes} nét viết • Nghĩa: {currentQ.kanji.meanings_vi[0]}
                    </p>
                  </div>

                  <div className="relative w-52 h-52 mx-auto bg-slate-900/60 rounded-3xl border-2 border-dashed border-[#3c4a6b] flex items-center justify-center shadow-inner overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={208}
                      height={208}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDraw}
                      onMouseLeave={handleStopDraw}
                      onTouchStart={handleStartDraw}
                      onTouchMove={handleDraw}
                      onTouchEnd={handleStopDraw}
                      className="w-full h-full cursor-crosshair"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
                      <span className="text-8xl font-jp font-black">{currentQ.kanji.kanji}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={handleClearCanvas}
                      className="px-4 py-2 rounded-xl border border-[#3c4a6b] text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition"
                    >
                      Xóa nét vẽ lại
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 rounded-xl bg-[#05b651] hover:bg-[#049a44] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
                    >
                      Chữ tiếp theo
                    </button>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ 5: ĐỌC HIỂU */}
              {testMode === 'reading' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-[#05b651] flex items-center justify-center">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Luyện đọc câu chứa Kanji Ngày {safeDay}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                      Tổng hợp các câu ví dụ từ vựng chứa 10 chữ Kanji đã học.
                    </p>
                  </div>

                  <div className="bg-[#1c2436] p-5 rounded-2xl border border-[#303c58] text-left space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {dayVocabList.slice(0, 5).map((v, i) => (
                      <div key={i} className="border-b border-[#303c58]/60 pb-2.5 last:border-b-0">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base font-bold font-jp text-white">{v.word}</span>
                          <span className="text-xs text-[#05b651] font-jp font-semibold">({v.reading})</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{v.hanviet}]</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{v.meaning}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { setTestMode('vocab'); handleRestartTest(); }}
                    className="px-6 py-2.5 rounded-xl bg-[#05b651] text-white text-xs font-bold hover:bg-[#049a44] transition"
                  >
                    Làm bài trắc nghiệm Từ vựng
                  </button>
                </div>
              )}
            </div>

            {/* GỢI Ý PHÍM TẮT: Nhấn 1–4 để chọn, Space để tiếp tục */}
            <div className="text-center text-xs text-slate-500 dark:text-zinc-400">
              Nhấn <span className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-mono font-bold px-1.5 py-0.5 rounded text-[11px]">1–4</span> để chọn, <span className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-mono font-bold px-1.5 py-0.5 rounded text-[11px]">Space</span> để tiếp tục
            </div>

            {/* SECTION: CHẾ ĐỘ KIỂM TRA (5 NÚT NGANG CHUẨN GIAO DIỆN) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Chế độ kiểm tra
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1. Hán Việt */}
                <button
                  onClick={() => { setTestMode('hanviet'); handleRestartTest(); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 relative shadow-xs ${
                    testMode === 'hanviet'
                      ? 'border-[#05b651] bg-white dark:bg-zinc-900 text-[#05b651] ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-bold">Hán Việt</span>
                </button>

                {/* 2. Từ vựng (Active badge pin icon) */}
                <button
                  onClick={() => { setTestMode('vocab'); handleRestartTest(); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 relative shadow-xs ${
                    testMode === 'vocab'
                      ? 'border-[#05b651] bg-white dark:bg-zinc-900 text-[#05b651] ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {testMode === 'vocab' && (
                    <span className="absolute -top-2.5 -left-1 text-emerald-500 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm">
                      <MapPin className="w-3.5 h-3.5 fill-[#05b651] text-[#05b651]" />
                    </span>
                  )}
                  <BookOpen className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-bold">Từ vựng</span>
                </button>

                {/* 3. Nhồi nhét */}
                <button
                  onClick={() => { setTestMode('cram'); handleRestartTest(); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 relative shadow-xs ${
                    testMode === 'cram'
                      ? 'border-[#05b651] bg-white dark:bg-zinc-900 text-[#05b651] ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Zap className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-bold">Nhồi nhét</span>
                </button>

                {/* 4. Viết */}
                <button
                  onClick={() => { setTestMode('write'); handleRestartTest(); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 relative shadow-xs ${
                    testMode === 'write'
                      ? 'border-[#05b651] bg-white dark:bg-zinc-900 text-[#05b651] ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <PenTool className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-bold">Viết</span>
                </button>

                {/* 5. Đọc hiểu */}
                <button
                  onClick={() => { setTestMode('reading'); handleRestartTest(); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 relative shadow-xs ${
                    testMode === 'reading'
                      ? 'border-[#05b651] bg-white dark:bg-zinc-900 text-[#05b651] ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Scan className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-bold">Đọc hiểu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: MÀN HÌNH HỌC CHI TIẾT (ẢNH 2)
  // ==========================================
  if (viewState === 'study') {
    const mnemonic = KANJI_MNEMONICS[currentKanji.kanji] || `Chữ ${currentKanji.hanviet} (${currentKanji.kanji}) thuộc bộ ${currentKanji.radical || 'thủ'}, gồm ${currentKanji.strokes} nét viết.`;

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header điều hướng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setViewState('dashboard')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-rose-500 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Lộ trình</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {currentLevel} • Ngày {safeDay}: {currentDayTopic}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {activeKanjiIndex + 1} / {dayKanjiList.length}
            </span>
          </div>
        </div>

        {/* Thanh Progress */}
        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((activeKanjiIndex + 1) / dayKanjiList.length) * 100}%` }}
          />
        </div>

        {/* 3 Nút chức năng: Học Flashcard, Luyện viết, Tạo file */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setTestMode('hanviet'); setViewState('test'); }}
            className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 font-bold text-xs flex items-center space-x-1.5 hover:bg-blue-100 transition shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Học bằng Flashcard</span>
          </button>

          <button
            onClick={() => setShowCanvas(!showCanvas)}
            className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-bold text-xs flex items-center space-x-1.5 hover:bg-emerald-100 transition shadow-2xs"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{showCanvas ? 'Đóng bảng vẽ' : 'Luyện viết nét'}</span>
          </button>

          <button
            onClick={() => setShowStrokeModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-sky-300 border border-indigo-200 dark:border-indigo-900/50 font-bold text-xs flex items-center space-x-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thứ tự nét & Tập viết</span>
          </button>

          <button
            onClick={() => speakJapanese(currentKanji.kanji)}
            className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 font-bold text-xs flex items-center space-x-1.5 hover:bg-amber-100 transition shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Nghe phát âm</span>
          </button>
        </div>

        {/* Thanh 10 chữ Kanji ngang ở trên (Ảnh 2) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {dayKanjiList.map((k, idx) => {
            const isActive = idx === activeKanjiIndex;
            const isMastered = masteredKanji.includes(k.id);

            return (
              <button
                key={k.id || idx}
                onClick={() => setActiveKanjiIndex(idx)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-jp text-xl font-bold transition shrink-0 border-2 ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                    : isMastered
                      ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 text-slate-800 dark:text-zinc-200'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                }`}
              >
                {k.kanji}
              </button>
            );
          })}
        </div>

        {/* Card Chi tiết Kanji 2 Cột chuẩn như Ảnh 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CỘT TRÁI (4 cols): Chữ Kanji lớn & Nét viết */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 pb-6 md:pb-0 md:pr-6">
            <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight uppercase">
              {currentKanji.hanviet}
            </h2>

            {/* Khung vẽ / Chữ Kanji */}
            <div className="relative w-48 h-48 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-inner overflow-hidden">
              {showCanvas ? (
                <canvas
                  ref={canvasRef}
                  width={192}
                  height={192}
                  onMouseDown={handleStartDraw}
                  onMouseMove={handleDraw}
                  onMouseUp={handleStopDraw}
                  onMouseLeave={handleStopDraw}
                  onTouchStart={handleStartDraw}
                  onTouchMove={handleDraw}
                  onTouchEnd={handleStopDraw}
                  className="w-full h-full cursor-crosshair bg-slate-50 dark:bg-zinc-950"
                />
              ) : (
                <div className="select-none font-jp font-black text-8xl text-slate-900 dark:text-white">
                  {currentKanji.kanji}
                </div>
              )}

              {/* Huy hiệu số nét */}
              <span className="absolute bottom-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                {currentKanji.strokes} nét
              </span>
            </div>

            {/* Các nút hành động cột trái */}
            <div className="w-full space-y-2">
              {showCanvas && (
                <button
                  onClick={handleClearCanvas}
                  className="w-full py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
                >
                  Xóa nét vẽ lại
                </button>
              )}

              <button
                onClick={() => onToggleMaster(currentKanji.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                  masteredKanji.includes(currentKanji.id)
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{masteredKanji.includes(currentKanji.id) ? '✓ Đã thuộc chữ này' : '+ Đánh dấu đã thuộc'}</span>
              </button>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1 justify-center">
                <span>Onyomi: <strong className="text-slate-700 dark:text-zinc-200">{currentKanji.onyomi.join(', ') || '-'}</strong></span>
                <span>•</span>
                <span>Kunyomi: <strong className="text-slate-700 dark:text-zinc-200">{currentKanji.kunyomi.join(', ') || '-'}</strong></span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (8 cols): Ý nghĩa, Cách nhớ & Từ vựng JLPT */}
          <div className="md:col-span-8 space-y-5">
            {/* Ý NGHĨA */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ý NGHĨA</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {currentKanji.meanings_vi.join(', ')}
              </p>
            </div>

            {/* GỢI Ý CÁCH NHỚ (Box vàng cam) */}
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GỢI Ý CÁCH NHỚ</span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                {mnemonic}
              </p>
            </div>

            {/* DANH SÁCH TỪ VỰNG GHÉP JLPT */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Từ vựng chứa chữ {currentKanji.kanji} ({kanjiVocab.length} từ)
                </span>

                {/* Bộ lọc cấp độ từ vựng & Nút Luyện tập */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="inline-flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px]">
                    <button
                      onClick={() => setVocabLevelFilter('current')}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        vocabLevelFilter === 'current'
                          ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Chỉ {currentLevel}
                    </button>
                    <button
                      onClick={() => setVocabLevelFilter('all')}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        vocabLevelFilter === 'all'
                          ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Mọi cấp độ
                    </button>
                  </div>

                  {kanjiVocab.length > 0 && (
                    <button
                      onClick={() => {
                        setVocabPracticeIdx(0);
                        setVocabPracticeFlipped(false);
                        setVocabPracticeModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Luyện {kanjiVocab.length} từ này</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Danh sách từ vựng */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {kanjiVocab.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                    Chưa có từ vựng ở cấp độ {currentLevel}. Bấm "Mọi cấp độ" để xem thêm.
                  </p>
                ) : (
                  kanjiVocab.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-blue-500 font-bold">👉</span>
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-jp">
                              {v.word}
                            </span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-jp font-semibold">
                              ({v.reading})
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              {v.level}{v.lesson ? ` • Bài ${v.lesson}` : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase mr-1">{v.hanviet}</span>
                            — {v.meaning}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => speakJapanese(v.word)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition shrink-0"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dưới cùng: Nút Kiểm tra & Chuyển chữ */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => { setViewState('test'); setTestQuestionIdx(0); }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center space-x-1.5"
              >
                <span>🧠 Kiểm tra 10 chữ ngày {safeDay}</span>
              </button>

              {activeKanjiIndex + 1 < dayKanjiList.length ? (
                <button
                  onClick={() => setActiveKanjiIndex(prev => prev + 1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs transition flex items-center space-x-1"
                >
                  <span>Chữ tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-emerald-600 font-bold">
                  ✓ Đã xem hết 10 chữ!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Luyện tập riêng các từ vựng của chữ Kanji này */}
        {vocabPracticeModalOpen && kanjiVocab.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Luyện từ vựng chữ {currentKanji.kanji} ({currentKanji.hanviet})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Từ {vocabPracticeIdx + 1} / {kanjiVocab.length} • Trình độ {kanjiVocab[vocabPracticeIdx]?.level || currentLevel}
                  </p>
                </div>
                <button
                  onClick={() => setVocabPracticeModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thẻ Flashcard tương tác */}
              {(() => {
                const currentV = kanjiVocab[vocabPracticeIdx] || kanjiVocab[0];
                return (
                  <div className="space-y-4">
                    <div
                      onClick={() => {
                        setVocabPracticeFlipped(!vocabPracticeFlipped);
                        speakJapanese(currentV.word);
                      }}
                      className="cursor-pointer min-h-56 p-6 rounded-3xl bg-slate-50 dark:bg-zinc-800/50 border-2 border-dashed border-blue-200 dark:border-blue-900/60 flex flex-col items-center justify-center text-center space-y-3 hover:border-blue-400 transition"
                    >
                      <h4 className="text-4xl sm:text-5xl font-jp font-bold text-slate-900 dark:text-white">
                        {currentV.word}
                      </h4>

                      {vocabPracticeFlipped ? (
                        <div className="space-y-1 animate-in fade-in duration-200">
                          <p className="text-xl font-bold font-jp text-blue-600 dark:text-blue-400">
                            {currentV.reading}
                          </p>
                          <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                            Hán Việt: {currentV.hanviet}
                          </p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                            {currentV.meaning}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-semibold">
                          (Chạm vào thẻ để lật xem cách đọc & nghĩa)
                        </p>
                      )}
                    </div>

                    {/* Điều hướng từ */}
                    <div className="flex items-center justify-between">
                      <button
                        disabled={vocabPracticeIdx <= 0}
                        onClick={() => {
                          setVocabPracticeIdx(prev => Math.max(prev - 1, 0));
                          setVocabPracticeFlipped(false);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 font-bold text-xs text-slate-600 dark:text-zinc-300 disabled:opacity-30"
                      >
                        ← Từ trước
                      </button>

                      <button
                        onClick={() => speakJapanese(currentV.word)}
                        className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Phát âm</span>
                      </button>

                      <button
                        disabled={vocabPracticeIdx >= kanjiVocab.length - 1}
                        onClick={() => {
                          setVocabPracticeIdx(prev => Math.min(prev + 1, kanjiVocab.length - 1));
                          setVocabPracticeFlipped(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-30"
                      >
                        Từ tiếp theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Modal Nét viết & Tập viết Kanji */}
        {showStrokeModal && currentKanji && (
          <KanjiStrokeModal
            isOpen={showStrokeModal}
            onClose={() => setShowStrokeModal(false)}
            kanji={currentKanji.kanji}
            hanviet={currentKanji.hanviet}
            meaning={currentKanji.meanings_vi.join(', ')}
            strokes={currentKanji.strokes}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // SCREEN 1: DASHBOARD LỘ TRÌNH KANJI (ẢNH 1)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* 1. Header & Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Switch tab trên cùng: Lộ trình mặc định vs Lộ trình của tôi */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl sm:rounded-2xl max-w-full">
            <button 
              onClick={() => setRoadmapType('default')}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1 sm:space-x-2 ${
                roadmapType === 'default'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🔗 Lộ trình mặc định</span>
            </button>
            <button 
              onClick={() => setRoadmapType('custom')}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1 sm:space-x-2 ${
                roadmapType === 'custom'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>📍 Lộ trình của tôi</span>
            </button>
          </div>
        </div>

        {/* Khung tùy chỉnh Lộ trình của tôi (Khi chọn tab Lộ trình của tôi) */}
        {roadmapType === 'custom' && (
          <div className="bg-slate-50 dark:bg-zinc-800/60 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Cài đặt Lộ trình cá nhân hóa</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Tùy chỉnh số lượng học mỗi ngày và đối tượng Kanji phù hợp với thời gian biểu của bạn
                </p>
              </div>

              {/* Bộ lọc đối tượng: Tất cả / Chưa thuộc / Yêu thích */}
              <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
                <button
                  onClick={() => setCustomFilterTarget('all')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                    customFilterTarget === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tất cả ({kanjiList.length})
                </button>
                <button
                  onClick={() => setCustomFilterTarget('unlearned')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                    customFilterTarget === 'unlearned'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-500 hover:text-rose-500'
                  }`}
                >
                  Chưa thuộc ({kanjiList.filter(k => !masteredKanji.includes(k.id)).length})
                </button>
                <button
                  onClick={() => setCustomFilterTarget('favorite')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                    customFilterTarget === 'favorite'
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-500 hover:text-amber-500'
                  }`}
                >
                  Yêu thích ({kanjiList.filter(k => favoriteKanji.includes(k.id)).length})
                </button>
              </div>
            </div>

            {/* Chọn số lượng học / ngày */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                Số chữ mỗi ngày:
              </span>
              {[5, 10, 15, 20, 25].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setCustomKanjiPerDay(cnt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    customKanjiPerDay === cnt
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-rose-400'
                  }`}
                >
                  {cnt} chữ/ngày
                </button>
              ))}

              {/* Nhập số lượng tùy ý */}
              <div className="flex items-center space-x-1.5 ml-auto">
                <span className="text-xs text-slate-400">Tùy biến:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={customKanjiPerDay}
                  onChange={(e) => setCustomKanjiPerDay(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
                  className="w-16 px-2.5 py-1 text-xs font-bold text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                />
                <span className="text-xs text-slate-400">chữ</span>
              </div>
            </div>

            {/* Thẻ dự báo hoàn thành */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span>
                🎯 Mục tiêu: <strong>{effectiveKanjiList.length}</strong> chữ • Tốc độ: <strong>{activeKanjiPerDay}</strong> chữ/ngày
              </span>
              <span className="font-bold">
                Dự kiến hoàn thành trong {totalDays} ngày
              </span>
            </div>
          </div>
        )}

        {/* Tiêu đề chính */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center space-x-2">
            <span>📜</span>
            <span>{roadmapType === 'custom' ? 'Lộ trình cá nhân của tôi' : 'Lộ trình học Kanji'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {activeKanjiPerDay} chữ mỗi ngày • Tổng cộng {totalDays} ngày chinh phục {currentLevel} ({effectiveKanjiList.length} chữ)
          </p>
        </div>

        {/* 4 Thẻ thống kê chuẩn như Ảnh 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Đã học */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Đã học</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {completedDays}/{totalDays} <span className="text-xs font-semibold text-slate-400">ngày</span>
            </p>
          </div>

          {/* Card 2: Kanji */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Target className="w-3.5 h-3.5" />
              <span>Kanji</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {masteredCount} <span className="text-xs font-semibold text-slate-400">chữ đã thuộc</span>
            </p>
          </div>

          {/* Card 3: Streak */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center space-x-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>Streak</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {streak} <span className="text-xs font-semibold text-slate-400">ngày liên tiếp</span>
            </p>
          </div>

          {/* Card 4: Tiến độ */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Tiến độ</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {progressPercent}% <span className="text-xs font-semibold text-slate-400">hoàn thành</span>
            </p>
          </div>
        </div>

        {/* Bộ chọn Level N5 -> N1 (Ảnh 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => {
            const isSelected = currentLevel === lvl;
            const isDemo = ['N3', 'N2', 'N1'].includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-black ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                    {lvl}
                  </span>
                  {isDemo && (
                    <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {lvl === 'N5' ? '112 chữ - 12 ngày' : lvl === 'N4' ? '166 chữ - 17 ngày' : lvl === 'N3' ? '300+ chữ' : lvl === 'N2' ? '400+ chữ' : '1.000+ chữ'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Thanh chọn Ngày & Slider (Ảnh 1) */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-3 border border-slate-200/80 dark:border-zinc-700/60">
          <div className="flex items-center justify-between">
            <button
              disabled={safeDay <= 1}
              onClick={() => setCurrentDay(prev => Math.max(prev - 1, 1))}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                📅 Ngày {safeDay}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                {currentLevel} • {currentDayTopic}
              </span>
            </div>

            <button
              disabled={safeDay >= totalDays}
              onClick={() => setCurrentDay(prev => Math.min(prev + 1, totalDays))}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slider thanh kéo chọn ngày */}
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-400">
            <span>Ngày 1</span>
            <input
              type="range"
              min={1}
              max={totalDays}
              value={safeDay}
              onChange={e => setCurrentDay(Number(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span>Ngày {totalDays} ({currentLevel})</span>
          </div>
        </div>

        {/* LƯỚI 10 CHỮ KANJI CỦA NGÀY (Ảnh 1) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Kanji ngày {safeDay}: {currentDayTopic} ({dayKanjiList.length} chữ)</span>
            </h3>

            <button
              onClick={() => {
                setActiveKanjiIndex(0);
                setViewState('study');
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center space-x-1.5 active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Học ngay</span>
            </button>
          </div>

          {/* 10 Khung ô vuông Kanji */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
            {dayKanjiList.map((k, idx) => {
              const isMastered = masteredKanji.includes(k.id);
              return (
                <button
                  key={k.id || idx}
                  onClick={() => {
                    setActiveKanjiIndex(idx);
                    setViewState('study');
                  }}
                  className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all p-1 ${
                    isMastered
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-slate-800 dark:text-zinc-200 hover:border-blue-400'
                  }`}
                >
                  <span className="font-jp font-bold text-2xl sm:text-3xl">{k.kanji}</span>
                  <span className="text-[10px] font-semibold text-slate-400 truncate w-full text-center mt-0.5">
                    {k.hanviet.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Nét viết & Tập viết Kanji */}
      {showStrokeModal && currentKanji && (
        <KanjiStrokeModal
          isOpen={showStrokeModal}
          onClose={() => setShowStrokeModal(false)}
          kanji={currentKanji.kanji}
          hanviet={currentKanji.hanviet}
          meaning={currentKanji.meanings_vi.join(', ')}
          strokes={currentKanji.strokes}
        />
      )}
    </div>
  );
};
