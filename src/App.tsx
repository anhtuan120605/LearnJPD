import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WordListView } from './components/WordListView';
import { FlashcardView } from './components/FlashcardView';
import { KanjiMasterView } from './components/KanjiMasterView';
import { PracticeView } from './components/PracticeView';
import { CrammingModeView } from './components/CrammingModeView';
import { SentenceTranslateView } from './components/SentenceTranslateView';
import { ShadowingView } from './components/ShadowingView';
import { StudyModeSelector, StudyMode } from './components/StudyModeSelector';
import { AdaptiveLearnView } from './components/AdaptiveLearnView';
import { MatchGameView } from './components/MatchGameView';
import { PracticeTestView } from './components/PracticeTestView';
import { GrammarView } from './components/GrammarView';
import { ReadingView } from './components/ReadingView';
import { AuthModal } from './components/AuthModal';
import { BackupModal } from './components/BackupModal';
import { LessonSelector } from './components/LessonSelector';
import { CustomNotebookView } from './components/CustomNotebookView';
import { PracticeHubOverview } from './components/PracticeHubOverview';
import { PracticeSessionHeader } from './components/PracticeSessionHeader';
import { PersonalDashboardView } from './components/PersonalDashboardView';
import { ConjugationTrainerView } from './components/ConjugationTrainerView';
import { JapaneseTypingView } from './components/JapaneseTypingView';
import { ShadowingHubView } from './components/shadowing/ShadowingHubView';
import { ShadowingPlayerView } from './components/shadowing/ShadowingPlayerView';
import { ShadowingVideoItem } from './types/shadowing';
import { MistakeBankModal } from './components/MistakeBankModal';
import { SrsReviewModal } from './components/SrsReviewModal';
import { AdminWordEditModal } from './components/AdminWordEditModal';
import { AdminDeletedWordsModal } from './components/AdminDeletedWordsModal';
import { 
  VocabOverride, 
  loadLocalVocabOverrides, 
  fetchCloudVocabOverrides, 
  syncSaveVocabOverride, 
  applyVocabOverridesToWords,
  subscribeToCloudVocabOverrides
} from './lib/vocabOverrides';
import { checkIsAdmin } from './lib/admin';
import { 
  getDueSrsItems, 
  calculateNextSrsItem, 
  autoSeedSrsFromProgress 
} from './lib/srs';

import { 
  courseDatasets, 
  kanjiDatasets, 
  minnaGrammarDatasets, 
  minnaReadingDatasets,
  n3GrammarDatasets,
  n3ReadingDatasets,
  n2GrammarDatasets,
  n2ReadingDatasets,
  n1GrammarDatasets,
  n1ReadingDatasets
} from './data';
import { loadLocalProgress, saveLocalProgress, syncWithSupabase, fetchFromSupabase, recordStudyActivity } from './lib/storage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { UserProgress, CustomNotebookLesson, WordPracticeFilter, WordItem, SrsRating } from './types';
import { 
  BookOpen, 
  ListFilter, 
  Sparkles, 
  FileText,
  ChevronLeft,
  Star,
  Shuffle,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { getLessonTopic } from './data/lessonTopics';
import { 
  getInitialNavState, 
  parseNavFromSearchParams, 
  syncNavToUrlAndStorage, 
  AppNavState 
} from './lib/routerHelper';

export type LessonSubTab = 'vocab' | 'grammar' | 'reading' | 'practice';

export function App() {
  // Khởi tạo trạng thái điều hướng từ URL query hoặc LocalStorage (tránh bị reset về trang chủ khi F5 hoặc Back)
  const initialNav = React.useMemo(() => getInitialNavState(), []);

  // Tabs: 'tango' (Từ vựng) | 'kanji' (Chữ Hán) | 'practice' (Luyện tập) | 'notebook' (Sổ tay) | 'dashboard' (Cá nhân)
  const [activeTab, setActiveTab] = useState<'tango' | 'kanji' | 'practice' | 'notebook' | 'dashboard'>(initialNav.tab);
  
  // Chế độ xem trong Phân hệ Từ vựng: 'dashboard' (Lưới thẻ bài học lớn) | 'study' (Bàn học Split-View)
  const [tangoViewMode, setTangoViewMode] = useState<'dashboard' | 'study'>(initialNav.tangoViewMode);

  // Chế độ xem trong Bài học: 'vocab' (Danh sách từ vựng - mặc định) | 'grammar' (Ngữ pháp) | 'reading' (Bài đọc) | 'practice' (5 chế độ học)
  const [lessonSubTab, setLessonSubTab] = useState<LessonSubTab>(initialNav.subTab);

  // 5 Chế độ học: 'flashcard' | 'quiz' | 'cram' | 'translate' | 'shadowing'
  const [studyMode, setStudyMode] = useState<StudyMode>(initialNav.studyMode);

  // Khóa giáo trình / cấp độ đang chọn: 'MINNA_1' | 'MINNA_2' | 'MINNA_CHUKYU_1' | 'MINNA_CHUKYU_2' | 'JLPT_N1'
  const [currentCourse, setCurrentCourse] = useState<string>(initialNav.course);

  // Bài học đang chọn
  const [selectedLessonNum, setSelectedLessonNum] = useState<number>(initialNav.lesson);

  // Chế độ chọn nhiều bài để ôn tập
  const [isMultiLessonMode, setIsMultiLessonMode] = useState<boolean>(false);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([initialNav.lesson]);

  // Bộ lọc từ trong phân hệ Luyện tập: 'all' | 'unmastered' | 'favorite' | 'mistake'
  const [practiceWordFilter, setPracticeWordFilter] = useState<WordPracticeFilter>('all');

  // Trạng thái xáo trộn từ vựng khi luyện tập (Shuffle Words trong phân hệ Luyện tập)
  const [isPracticeShuffled, setIsPracticeShuffled] = useState<boolean>(false);
  const [shuffleKey, setShuffleKey] = useState<number>(0);

  // Trạng thái xáo trộn từ vựng trong mục Từ vựng -> Tab Luyện tập
  const [isLessonPracticeShuffled, setIsLessonPracticeShuffled] = useState<boolean>(false);
  const [lessonPracticeShuffleKey, setLessonPracticeShuffleKey] = useState<number>(0);

  // Modal Kho từ hay sai (Mistake Bank)
  const [isMistakeBankOpen, setIsMistakeBankOpen] = useState<boolean>(false);

  // Modal Ôn tập ngắt quãng (SRS Review SM-2)
  const [isSrsReviewOpen, setIsSrsReviewOpen] = useState<boolean>(false);

  // Trạng thái hiển thị trong Phân hệ Luyện tập: 'overview' | 'session' | 'conjugation' | 'typing' | 'shadowing'
  const [practiceStage, setPracticeStage] = useState<'overview' | 'session' | 'conjugation' | 'typing' | 'shadowing'>(initialNav.practiceStage);
  const [selectedShadowingVideo, setSelectedShadowingVideo] = useState<ShadowingVideoItem | null>(null);

  // Cấp độ Kanji đang chọn (N5 -> N1)
  const [selectedKanjiLevel, setSelectedKanjiLevel] = useState<string>(initialNav.kanjiLevel);

  // Supabase Auth state: { id, email }
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Quyền Quản trị viên (Cách 1: Nhận diện qua Email tài khoản đăng nhập)
  const hasAdminAccess = checkIsAdmin(currentUser?.email);

  // Chế độ chỉnh sửa từ vựng: Mặc định TẮT, chỉ BẬT khi Admin chủ động bấm vào logo Admin trên Navbar!
  const [isAdminEditMode, setIsAdminEditMode] = useState<boolean>(false);
  const [isAdminDeletedModalOpen, setIsAdminDeletedModalOpen] = useState<boolean>(false);
  const [adminEditWordModal, setAdminEditWordModal] = useState<{
    isOpen: boolean;
    word: WordItem | null;
  }>({ isOpen: false, word: null });

  // Tự động tắt chế độ sửa nếu đăng xuất hoặc không có quyền Admin
  useEffect(() => {
    if (!hasAdminAccess) {
      setIsAdminEditMode(false);
    }
  }, [hasAdminAccess]);

  // Danh sách từ vựng đã được Admin chỉnh sửa hoặc thêm mới
  const [vocabOverrides, setVocabOverrides] = useState<Record<string, VocabOverride>>(() => loadLocalVocabOverrides());

  // Tự động tải từ vựng mới nhất từ Cloud khi khởi động & Lắng nghe Realtime (Đồng bộ tức thì giữa các tài khoản)
  useEffect(() => {
    fetchCloudVocabOverrides().then((overrides) => {
      setVocabOverrides(overrides);
    });

    // Lắng nghe thay đổi khi Admin sửa / xóa từ vựng từ bất kỳ tài khoản/thiết bị nào
    const unsubscribe = subscribeToCloudVocabOverrides((override) => {
      setVocabOverrides((prev) => ({
        ...prev,
        [override.id]: override,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Cờ nhận biết đang thực hiện lùi/tiến trang từ nút Back/Forward của trình duyệt
  const isPoppingStateRef = React.useRef(false);
  const prevNavRef = React.useRef<AppNavState>(initialNav);

  // 1. Lắng nghe nút Back / Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      isPoppingStateRef.current = true;
      const stateFromEvent = e.state as AppNavState | null;
      const nav = stateFromEvent || parseNavFromSearchParams(new URLSearchParams(window.location.search));

      setActiveTab(nav.tab);
      setTangoViewMode(nav.tangoViewMode);
      setCurrentCourse(nav.course);
      setSelectedLessonNum(nav.lesson);
      setSelectedLessons([nav.lesson]);
      setLessonSubTab(nav.subTab);
      setStudyMode(nav.studyMode);
      setPracticeStage(nav.practiceStage);
      setSelectedKanjiLevel(nav.kanjiLevel);

      prevNavRef.current = nav;
      setTimeout(() => {
        isPoppingStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Đồng bộ trạng thái hiện tại lên URL và lưu LocalStorage
  useEffect(() => {
    const currentNav: AppNavState = {
      tab: activeTab,
      tangoViewMode,
      course: currentCourse,
      lesson: selectedLessonNum,
      subTab: lessonSubTab,
      studyMode,
      practiceStage,
      kanjiLevel: selectedKanjiLevel,
    };

    if (isPoppingStateRef.current) {
      syncNavToUrlAndStorage(currentNav, false);
      return;
    }

    const prev = prevNavRef.current;
    // Kiểm tra xem có phải là thao tác chuyển màn hình lớn cần pushState không
    const isMajorTransition = 
      prev.tab !== currentNav.tab ||
      prev.tangoViewMode !== currentNav.tangoViewMode ||
      prev.practiceStage !== currentNav.practiceStage ||
      (currentNav.tangoViewMode === 'study' && prev.lesson !== currentNav.lesson) ||
      prev.course !== currentNav.course;

    syncNavToUrlAndStorage(currentNav, isMajorTransition);
    prevNavRef.current = currentNav;
  }, [
    activeTab,
    tangoViewMode,
    currentCourse,
    selectedLessonNum,
    lessonSubTab,
    studyMode,
    practiceStage,
    selectedKanjiLevel,
  ]);

  // Chế độ Giao diện Dark / Light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Tiến độ học tập cá nhân
  const [progress, setProgress] = useState<UserProgress>(loadLocalProgress());

  // Khởi tạo theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Lắng nghe phiên đăng nhập Supabase và tải tiến độ đám mây theo từng tài khoản
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Kiểm tra session hiện tại khi mở web
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email || '' };
          setCurrentUser(u);
          // Tải dữ liệu riêng biệt của tài khoản này
          fetchFromSupabase(session.user.id).then((cloudP) => {
            if (cloudP) {
              setProgress(cloudP);
              saveLocalProgress(cloudP, session.user.id);
            } else {
              // Tài khoản mới tạo trên Supabase: lấy dữ liệu local hiện tại đồng bộ lên
              setProgress((current) => {
                syncWithSupabase(session.user.id, current);
                saveLocalProgress(current, session.user.id);
                return current;
              });
            }
          });
        }
      });

      // 2. Lắng nghe thay đổi trạng thái đăng nhập (đăng nhập / đăng xuất)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email || '' };
          setCurrentUser(u);
          fetchFromSupabase(session.user.id).then((cloudP) => {
            if (cloudP) {
              setProgress(cloudP);
              saveLocalProgress(cloudP, session.user.id);
            }
          });
        } else {
          // Khi đăng xuất: reset về tài khoản khách độc lập
          setCurrentUser(null);
          const guestProgress = loadLocalProgress();
          setProgress(guestProgress);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Tự động lưu tiến độ khi có thay đổi (cô lập theo từng tài khoản)
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveLocalProgress(next, currentUser?.id);
      if (currentUser?.id) {
        syncWithSupabase(currentUser.id, next);
      }
      return next;
    });
  };

  // Toggle từ vựng đã thuộc
  const handleToggleMasterWord = (id: string) => {
    updateProgress((prev) => {
      const isMastered = prev.masteredWords.includes(id);
      const nextProgress = {
        ...prev,
        masteredWords: isMastered
          ? prev.masteredWords.filter((wId) => wId !== id)
          : [...prev.masteredWords, id]
      };
      return !isMastered ? recordStudyActivity(nextProgress) : nextProgress;
    });
  };

  // Thêm từ vào danh sách đã thuộc (khi làm đúng Quiz hoặc hoàn thành Cramming)
  const handleAddMasterWord = (id: string) => {
    updateProgress((prev) => {
      if (prev.masteredWords.includes(id)) return prev;
      return recordStudyActivity({
        ...prev,
        masteredWords: [...prev.masteredWords, id]
      });
    });
  };

  // Thêm danh sách từ vào danh sách đã thuộc (khi hoàn thành toàn bộ Cramming)
  const handleAddMasterWordsList = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    updateProgress((prev) => {
      const existingSet = new Set(prev.masteredWords);
      let changed = false;
      ids.forEach((id) => {
        if (!existingSet.has(id)) {
          existingSet.add(id);
          changed = true;
        }
      });
      if (!changed) return prev;
      return recordStudyActivity({
        ...prev,
        masteredWords: Array.from(existingSet)
      });
    });
  };

  // Toggle từ vựng yêu thích
  const handleToggleFavoriteWord = (id: string) => {
    updateProgress((prev) => {
      const isFav = prev.favoriteWords.includes(id);
      return {
        ...prev,
        favoriteWords: isFav
          ? prev.favoriteWords.filter((wId) => wId !== id)
          : [...prev.favoriteWords, id]
      };
    });
  };

  // Toggle Kanji đã thuộc
  const handleToggleMasterKanji = (id: string) => {
    updateProgress((prev) => {
      const isMastered = prev.masteredKanji.includes(id);
      const nextProgress = {
        ...prev,
        masteredKanji: isMastered
          ? prev.masteredKanji.filter((kId) => kId !== id)
          : [...prev.masteredKanji, id]
      };
      return !isMastered ? recordStudyActivity(nextProgress) : nextProgress;
    });
  };

  // Toggle Kanji yêu thích
  const handleToggleFavoriteKanji = (id: string) => {
    updateProgress((prev) => {
      const isFav = prev.favoriteKanji.includes(id);
      return {
        ...prev,
        favoriteKanji: isFav
          ? prev.favoriteKanji.filter((kId) => kId !== id)
          : [...prev.favoriteKanji, id]
      };
    });
  };

  // Xử lý từ sai trong Quiz
  const handleAddMistake = (id: string) => {
    updateProgress((prev) => ({
      ...prev,
      mistakeWords: Array.from(new Set([...prev.mistakeWords, id]))
    }));
  };

  const handleRemoveMistake = (id: string) => {
    updateProgress((prev) => ({
      ...prev,
      mistakeWords: prev.mistakeWords.filter((wId) => wId !== id)
    }));
  };

  // Lưu điểm số sau khi làm xong bài
  const handleSaveQuizScore = (score: number, total: number, type: string) => {
    updateProgress((prev) => {
      const nextProgress = {
        ...prev,
        quizScores: [
          ...prev.quizScores,
          {
            date: new Date().toISOString(),
            type,
            level: `Bài ${selectedLessonNum}`,
            score,
            total
          }
        ]
      };
      return recordStudyActivity(nextProgress);
    });
  };

  // Toggle ẩn / hiện từ vựng không cần thiết (xóa khỏi bài học)
  const handleToggleHideWord = (id: string) => {
    updateProgress((prev) => {
      const currentHidden = prev.hiddenWords || [];
      const isHidden = currentHidden.includes(id);
      return {
        ...prev,
        hiddenWords: isHidden
          ? currentHidden.filter((wId) => wId !== id)
          : [...currentHidden, id]
      };
    });
  };

  // Khôi phục tất cả từ vựng đã ẩn trong bài học hiện tại
  const handleRestoreLessonHiddenWords = () => {
    const lessonWordIds = new Set(currentLessonData.words.map((w) => w.id));
    updateProgress((prev) => {
      const currentHidden = prev.hiddenWords || [];
      return {
        ...prev,
        hiddenWords: currentHidden.filter((id) => !lessonWordIds.has(id))
      };
    });
  };

  // Cập nhật danh sách sổ tay từ vựng tự tạo
  const handleUpdateCustomNotebooks = (notebooks: CustomNotebookLesson[]) => {
    updateProgress((prev) => ({
      ...prev,
      customNotebooks: notebooks
    }));
  };

  // Lấy dữ liệu giáo trình và bài học hiện tại
  const currentCourseData = courseDatasets[currentCourse] || courseDatasets.MINNA_1;
  const currentLessonData = currentCourseData.lessons.find((l) => l.lesson === selectedLessonNum) || currentCourseData.lessons[0] || { lesson: 1, title: 'Bài 1', level: currentCourse, words: [] };
  const currentKanjiList = kanjiDatasets[selectedKanjiLevel] || kanjiDatasets.N5;
  const allKanjiAcrossLevels = React.useMemo(() => Object.values(kanjiDatasets).flat(), []);

  // Lấy dữ liệu ngữ pháp và bài đọc của bài hiện tại tùy theo cấp độ (N5, N4, N3, N2, N1)
  const currentGrammarLesson = React.useMemo(() => {
    if (currentCourse === 'MINNA_CHUKYU_1') {
      return n3GrammarDatasets.find((g) => g.lesson === selectedLessonNum);
    }
    if (currentCourse === 'MINNA_CHUKYU_2') {
      return n2GrammarDatasets.find((g) => g.lesson === selectedLessonNum);
    }
    if (currentCourse === 'JLPT_N1') {
      return n1GrammarDatasets.find((g) => g.lesson === selectedLessonNum);
    }
    return minnaGrammarDatasets.find((g) => g.lesson === selectedLessonNum);
  }, [currentCourse, selectedLessonNum]);

  const currentReadingLesson = React.useMemo(() => {
    if (currentCourse === 'MINNA_CHUKYU_1') {
      return n3ReadingDatasets.find((r) => r.lesson === selectedLessonNum);
    }
    if (currentCourse === 'MINNA_CHUKYU_2') {
      return n2ReadingDatasets.find((r) => r.lesson === selectedLessonNum);
    }
    if (currentCourse === 'JLPT_N1') {
      return n1ReadingDatasets.find((r) => r.lesson === selectedLessonNum);
    }
    return minnaReadingDatasets.find((r) => r.lesson === selectedLessonNum);
  }, [currentCourse, selectedLessonNum]);

  const allVocabWords = React.useMemo(() => {
    return Object.values(courseDatasets).flatMap((c) => c.lessons.flatMap((l) => l.words));
  }, []);

  // Tự động chuẩn bị hàng đợi SRS từ các từ đã thuộc / yêu thích / hay sai
  useEffect(() => {
    if (
      progress.masteredWords.length > 0 ||
      progress.favoriteWords.length > 0 ||
      progress.mistakeWords.length > 0 ||
      progress.masteredKanji.length > 0
    ) {
      const seeded = autoSeedSrsFromProgress(
        progress.srsItems || {},
        progress.masteredWords,
        progress.favoriteWords,
        progress.mistakeWords,
        progress.masteredKanji
      );
      const prevKeys = Object.keys(progress.srsItems || {}).length;
      const newKeys = Object.keys(seeded).length;
      if (newKeys > prevKeys) {
        updateProgress((prev) => ({
          ...prev,
          srsItems: seeded,
        }));
      }
    }
  }, [
    progress.masteredWords,
    progress.favoriteWords,
    progress.mistakeWords,
    progress.masteredKanji,
  ]);

  // Danh sách các mục đến hạn ôn tập SRS hôm nay
  const dueSrsItems = React.useMemo(() => {
    return getDueSrsItems(progress.srsItems || {}, allVocabWords, allKanjiAcrossLevels);
  }, [progress.srsItems, allVocabWords, allKanjiAcrossLevels]);

  // Đánh giá mức độ ghi nhớ trong phiên ôn tập SRS
  const handleRateSrsItem = (id: string, type: 'word' | 'kanji', rating: SrsRating) => {
    updateProgress((prev) => {
      const currentItem = (prev.srsItems || {})[id];
      const nextItem = calculateNextSrsItem(currentItem, id, type, rating);
      const nextProgress = {
        ...prev,
        srsItems: {
          ...(prev.srsItems || {}),
          [id]: nextItem,
        },
      };
      return recordStudyActivity(nextProgress);
    });
  };

  // Khi đổi Cấp độ giáo trình thì tự chọn bài đầu tiên của tập đó và reset về tab Từ vựng
  const handleSelectCourse = (courseKey: string) => {
    setCurrentCourse(courseKey);
    const targetLessons = courseDatasets[courseKey]?.lessons || [];
    if (targetLessons.length > 0) {
      setSelectedLessonNum(targetLessons[0].lesson);
      setSelectedLessons([targetLessons[0].lesson]);
    }
    setLessonSubTab('vocab');
  };

  // Khi chọn bài học mới thì luôn hiển thị danh sách từ vựng trước
  const handleSelectLesson = (lessonNum: number) => {
    setSelectedLessonNum(lessonNum);
    setSelectedLessons([lessonNum]);
    setLessonSubTab('vocab');
  };

  // Bật/tắt chọn 1 bài trong danh sách chọn nhiều bài
  const handleToggleLessonSelection = (lessonNum: number) => {
    setSelectedLessons((prev) => {
      if (prev.includes(lessonNum)) {
        if (prev.length <= 1) return prev;
        return prev.filter((n) => n !== lessonNum);
      }
      return [...prev, lessonNum].sort((a, b) => a - b);
    });
  };

  // Chọn toàn bộ các bài trong giáo trình hiện tại
  const handleSelectAllLessons = () => {
    setSelectedLessons(currentCourseData.lessons.map((l) => l.lesson));
  };

  // Bỏ chọn hết (giữ lại bài hiện tại)
  const handleClearAllLessons = () => {
    setSelectedLessons([selectedLessonNum]);
  };

  // Chọn nhanh một dải bài (vd: Bài 1 đến 5)
  const handleSelectRange = (start: number, end: number) => {
    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      if (currentCourseData.lessons.some((l) => l.lesson === i)) {
        range.push(i);
      }
    }
    if (range.length > 0) {
      setSelectedLessons(range);
    }
  };

  // Áp dụng Vocab Overrides (Chỉnh sửa / Thêm mới từ vựng từ Admin)
  const effectiveLessonWords = React.useMemo(() => {
    return applyVocabOverridesToWords(
      currentLessonData.words,
      currentCourse,
      currentLessonData.lesson,
      vocabOverrides
    );
  }, [currentLessonData.words, currentCourse, currentLessonData.lesson, vocabOverrides]);

  // Lọc các từ đang học của bài (loại trừ từ người dùng đã chọn xóa/ẩn)
  const activeLessonWords = React.useMemo(() => {
    const hiddenSet = new Set(progress.hiddenWords || []);
    const filtered = effectiveLessonWords.filter((w) => !hiddenSet.has(w.id));
    return filtered.length > 0 ? filtered : effectiveLessonWords;
  }, [effectiveLessonWords, progress.hiddenWords]);

  const hiddenCountInCurrentLesson = (progress.hiddenWords || []).filter((id) =>
    effectiveLessonWords.some((w) => w.id === id)
  ).length;

  const lessonActiveCount = effectiveLessonWords.length - hiddenCountInCurrentLesson;
  const lessonMasteredCount = effectiveLessonWords.filter(
    (w) => !(progress.hiddenWords || []).includes(w.id) && progress.masteredWords.includes(w.id)
  ).length;
  const lessonProgressPercent = lessonActiveCount > 0
    ? Math.round((lessonMasteredCount / lessonActiveCount) * 100)
    : 0;

  // Xử lý tiêu đề bài học hiển thị đẹp mắt kèm Tên Chủ Đề thực tế
  const currentLessonTopic = React.useMemo(() => {
    return getLessonTopic(currentCourse, currentLessonData.lesson);
  }, [currentCourse, currentLessonData.lesson]);

  const lessonHeading = React.useMemo(() => {
    return `Bài ${currentLessonData.lesson}: ${currentLessonTopic}`;
  }, [currentLessonData.lesson, currentLessonTopic]);

  // Bộ từ ôn tập tổng hợp (khi bật chế độ chọn nhiều bài)
  const activeReviewWords = React.useMemo(() => {
    const hiddenSet = new Set(progress.hiddenWords || []);
    if (!isMultiLessonMode || selectedLessons.length <= 1) {
      return activeLessonWords;
    }
    const combined = currentCourseData.lessons
      .filter((l) => selectedLessons.includes(l.lesson))
      .flatMap((l) => applyVocabOverridesToWords(l.words, currentCourse, l.lesson, vocabOverrides))
      .filter((w) => !hiddenSet.has(w.id));
    return combined.length > 0 ? combined : activeLessonWords;
  }, [isMultiLessonMode, selectedLessons, currentCourseData.lessons, currentCourse, vocabOverrides, activeLessonWords, progress.hiddenWords]);

  // Bộ từ dùng cho luyện tập (1 bài hoặc nhiều bài)
  const reviewWords = isMultiLessonMode ? activeReviewWords : activeLessonWords;

  // Lưu từ vựng đã sửa hoặc thêm mới
  const handleAdminSaveWord = async (override: VocabOverride) => {
    await syncSaveVocabOverride(override, currentUser?.email);
    setVocabOverrides((prev) => ({
      ...prev,
      [override.id]: override,
    }));
  };

  // Xóa từ vựng khỏi bài
  const handleAdminDeleteWord = async (wordId: string) => {
    const targetWord = 
      effectiveLessonWords.find((w) => w.id === wordId) || 
      currentLessonData.words.find((w) => w.id === wordId) ||
      vocabOverrides[wordId];

    const deletedOverride: VocabOverride = {
      id: wordId,
      courseKey: currentCourse,
      lesson: selectedLessonNum,
      kanji: targetWord?.kanji || '',
      kana: targetWord?.kana || '',
      romaji: targetWord?.romaji || '',
      meaning: targetWord?.meaning || '',
      hanviet: targetWord?.hanviet || '',
      isDeleted: true,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.email || 'Admin',
    };
    await syncSaveVocabOverride(deletedOverride, currentUser?.email);
    setVocabOverrides((prev) => ({
      ...prev,
      [wordId]: deletedOverride,
    }));
  };

  // Khôi phục từ vựng đã xóa
  const handleAdminRestoreWord = async (wordId: string) => {
    const existing = vocabOverrides[wordId];
    if (!existing) return;
    const restoredOverride: VocabOverride = {
      ...existing,
      isDeleted: false,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.email || 'Admin',
    };
    await syncSaveVocabOverride(restoredOverride, currentUser?.email);
    setVocabOverrides((prev) => ({
      ...prev,
      [wordId]: restoredOverride,
    }));
  };

  // Danh sách các từ đã xóa bởi Admin trong bài học này
  const deletedWordsInCurrentLesson = React.useMemo(() => {
    return Object.values(vocabOverrides).filter(
      (o) => o.courseKey === currentCourse && o.lesson === selectedLessonNum && o.isDeleted
    );
  }, [vocabOverrides, currentCourse, selectedLessonNum]);

  // Thống kê số lượng từ theo bộ lọc trong phân hệ Luyện tập
  const practiceFilterCounts = React.useMemo(() => {
    const baseWords = reviewWords;
    const all = baseWords.length;
    const unmastered = baseWords.filter((w) => !progress.masteredWords.includes(w.id)).length;
    const favorite = baseWords.filter((w) => progress.favoriteWords.includes(w.id)).length;
    const mistake = baseWords.filter((w) => progress.mistakeWords.includes(w.id)).length;
    return { all, unmastered, favorite, mistake };
  }, [reviewWords, progress.masteredWords, progress.favoriteWords, progress.mistakeWords]);

  // Bộ từ thực tế được đưa vào các chế độ luyện tập sau khi lọc
  const wordsForPractice = React.useMemo(() => {
    if (practiceWordFilter === 'unmastered') {
      const filtered = reviewWords.filter((w) => !progress.masteredWords.includes(w.id));
      return filtered.length > 0 ? filtered : reviewWords;
    }
    if (practiceWordFilter === 'favorite') {
      const filtered = reviewWords.filter((w) => progress.favoriteWords.includes(w.id));
      return filtered.length > 0 ? filtered : reviewWords;
    }
    if (practiceWordFilter === 'mistake') {
      const filtered = reviewWords.filter((w) => progress.mistakeWords.includes(w.id));
      return filtered.length > 0 ? filtered : reviewWords;
    }
    return reviewWords;
  }, [reviewWords, practiceWordFilter, progress.masteredWords, progress.favoriteWords, progress.mistakeWords]);

  // Bộ từ thực tế sau khi áp dụng bộ lọc và xáo trộn (nếu bật chế độ shuffle trong Luyện tập)
  const prevPracticeWordsKey = React.useRef<string>('');
  const cachedShuffledPracticeWords = React.useRef<WordItem[]>([]);

  const finalPracticeWords = React.useMemo(() => {
    if (!isPracticeShuffled) {
      return wordsForPractice;
    }
    const currentKey = `${shuffleKey}_${wordsForPractice.map(w => w.id).join(',')}`;
    if (prevPracticeWordsKey.current === currentKey && cachedShuffledPracticeWords.current.length === wordsForPractice.length) {
      return cachedShuffledPracticeWords.current;
    }
    prevPracticeWordsKey.current = currentKey;
    const shuffled = [...wordsForPractice];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    cachedShuffledPracticeWords.current = shuffled;
    return shuffled;
  }, [wordsForPractice, isPracticeShuffled, shuffleKey]);

  // Bộ từ thực tế trong mục Từ vựng khi bật Xáo trộn từ
  const prevLessonWordsKey = React.useRef<string>('');
  const cachedShuffledLessonWords = React.useRef<WordItem[]>([]);

  const finalLessonPracticeWords = React.useMemo(() => {
    if (!isLessonPracticeShuffled) {
      return reviewWords;
    }
    const currentKey = `${lessonPracticeShuffleKey}_${reviewWords.map(w => w.id).join(',')}`;
    if (prevLessonWordsKey.current === currentKey && cachedShuffledLessonWords.current.length === reviewWords.length) {
      return cachedShuffledLessonWords.current;
    }
    prevLessonWordsKey.current = currentKey;
    const shuffled = [...reviewWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    cachedShuffledLessonWords.current = shuffled;
    return shuffled;
  }, [reviewWords, isLessonPracticeShuffled, lessonPracticeShuffleKey]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0f1117] text-stone-800 dark:text-stone-100 transition-colors duration-300 relative selection:bg-indigo-600 selection:text-white overflow-x-hidden w-full max-w-[100vw]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'tango' && activeTab === 'tango') {
            setTangoViewMode('dashboard');
          }
          setActiveTab(tab);
          if (tab === 'practice') {
            setPracticeStage('overview');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        streak={progress.streak}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        userEmail={currentUser?.email || null}
        mistakeCount={progress.mistakeWords.length}
        onOpenMistakeBank={() => setIsMistakeBankOpen(true)}
        dueSrsCount={dueSrsItems.length}
        onOpenSrsReview={() => setIsSrsReviewOpen(true)}
        hasAdminAccess={hasAdminAccess}
        isAdminEditMode={isAdminEditMode}
        onToggleAdminEditMode={() => setIsAdminEditMode((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-8 py-4 sm:py-8 pb-24 md:pb-8 space-y-5 sm:space-y-6 overflow-x-hidden">
        {/* Banner thông báo chế độ chỉnh sửa Admin đang BẬT */}
        {hasAdminAccess && isAdminEditMode && (
          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-800 dark:text-amber-300 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2">
              <span className="text-base">👑</span>
              <span><strong>Chế độ Sửa Từ Vựng (Admin) đang BẬT:</strong> Bạn có thể sửa trực tiếp hoặc thêm từ mới vào bài học. Bấm lại vào logo 👑 Admin trên thanh menu để tắt khi học xong.</span>
            </div>
            <button
              onClick={() => setIsAdminEditMode(false)}
              className="font-bold underline self-end sm:self-auto hover:text-amber-950 dark:hover:text-amber-100 shrink-0"
            >
              Tắt chế độ sửa
            </button>
          </div>
        )}
        {/* PHÂN HỆ 1: TỪ VỰNG (TANGO) */}
        {/* PHÂN HỆ 1: TỪ VỰNG & BÀI HỌC (TANGO) */}
        {activeTab === 'tango' && (
          <div className="space-y-6">
            {tangoViewMode === 'dashboard' ? (
              /* GÓC NHÌN 1: DASHBOARD TỔNG QUAN BÀI HỌC CÓ CHỦ ĐỀ & GAMIFICATION (Ảnh 1) */
              <LessonSelector
                currentCourse={currentCourse}
                onSelectCourse={handleSelectCourse}
                lessons={currentCourseData.lessons}
                selectedLessonNum={selectedLessonNum}
                onSelectLesson={handleSelectLesson}
                masteredWords={progress.masteredWords}
                hiddenWords={progress.hiddenWords}
                vocabOverrides={vocabOverrides}
                isMultiMode={isMultiLessonMode}
                onToggleMultiMode={setIsMultiLessonMode}
                selectedLessons={selectedLessons}
                onToggleLessonSelection={handleToggleLessonSelection}
                onSelectAllLessons={handleSelectAllLessons}
                onClearAllLessons={handleClearAllLessons}
                onSelectRange={handleSelectRange}
                mode="dashboard"
                onEnterStudyMode={(lessonNum) => {
                  setSelectedLessonNum(lessonNum);
                  setSelectedLessons([lessonNum]);
                  setTangoViewMode('study');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              /* GÓC NHÌN 2: BÀN HỌC SPLIT-VIEW (Ảnh 2): 75% nội dung học bên trái, 25% sidebar bên phải */
              <div className="space-y-4">
                {/* Thanh điều hướng quay lại Dashboard & Nút Thêm cả bài vào ôn tập */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('tango');
                      setTangoViewMode('dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-sm font-bold text-stone-700 dark:text-stone-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-2xs group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Quay lại Tổng quan bài học (Dashboard)</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleLessonSelection(selectedLessonNum)}
                      className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
                        selectedLessons.includes(selectedLessonNum)
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:border-indigo-400'
                      }`}
                      title="Thêm cả bài này vào danh sách ôn tập tổng hợp"
                    >
                      <Star className={`w-4 h-4 ${selectedLessons.includes(selectedLessonNum) ? 'fill-white' : ''}`} />
                      <span>{selectedLessons.includes(selectedLessonNum) ? '✓ Đã thêm bài này vào ôn tập' : '⭐ Thêm cả bài vào ôn tập'}</span>
                    </button>
                  </div>
                </div>

                {/* Bố cục Split-View 2 Cột */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* CỘT TRÁI (Khung 75% - 9 cols): Không gian học tập trung */}
                  <div className="lg:col-span-9 space-y-6">
                    {/* Header bài học tinh tế Zen Modern */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
                      {/* Tiêu đề bài học, badge khóa học & tiến độ */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2.5">
                            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                              {currentCourseData.name} • {currentLessonData.level}
                            </span>
                            <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                              {isMultiLessonMode 
                                ? `Đang chọn ${selectedLessons.length} bài (${reviewWords.length} từ vựng)`
                                : `${lessonActiveCount} từ vựng ${hiddenCountInCurrentLesson > 0 ? `(đã ẩn ${hiddenCountInCurrentLesson})` : ''}`
                              }
                            </span>
                          </div>
                          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-2 tracking-tight font-jp">
                            {isMultiLessonMode ? `Ôn tập tổng hợp: ${selectedLessons.length} bài học` : lessonHeading}
                          </h1>
                        </div>

                        {/* Nút Primary Action: Luyện bài này + Widget % thuộc từ */}
                        <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
                          <button
                            onClick={() => {
                              setLessonSubTab('practice');
                              setStudyMode('flashcard');
                            }}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm flex items-center space-x-2 shadow-sm shadow-indigo-600/20 transition"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Luyện bài này</span>
                          </button>

                          <div className="flex items-center space-x-2.5 bg-stone-50 dark:bg-stone-800/80 px-3.5 py-2 rounded-xl border border-stone-200/60 dark:border-stone-800 text-sm">
                            <div className="w-24 bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${lessonProgressPercent}%` }}
                              />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-300 text-xs sm:text-sm whitespace-nowrap">
                              <strong className="text-emerald-600 dark:text-emerald-400">{lessonProgressPercent}%</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Thanh 4 Tab: Từ vựng, Ngữ pháp, Bài đọc, Luyện tập */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 dark:bg-stone-800/80 p-1.5 rounded-xl w-full">
                        <button
                          onClick={() => setLessonSubTab('vocab')}
                          className={`flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-bold transition ${
                            lessonSubTab === 'vocab'
                              ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                          }`}
                        >
                          <ListFilter className="w-4 h-4 shrink-0" />
                          <span>Từ vựng</span>
                        </button>

                        <button
                          onClick={() => setLessonSubTab('grammar')}
                          className={`flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-bold transition ${
                            lessonSubTab === 'grammar'
                              ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                          }`}
                        >
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <span>Ngữ pháp</span>
                        </button>

                        <button
                          onClick={() => setLessonSubTab('reading')}
                          className={`flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-bold transition ${
                            lessonSubTab === 'reading'
                              ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                          }`}
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Bài đọc</span>
                        </button>

                        <button
                          onClick={() => setLessonSubTab('practice')}
                          className={`flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-bold transition ${
                            lessonSubTab === 'practice'
                              ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Luyện tập</span>
                        </button>
                      </div>
                    </div>

                    {/* 1. Tab Từ vựng (Hiện đầu tiên khi vào bài - sạch sẽ, không banner thừa) */}
                    {lessonSubTab === 'vocab' && (
                      <div className="space-y-4">

                        {/* Thanh thông báo gợi ý bật Admin nếu đang tắt */}
                        {hasAdminAccess && !isAdminEditMode && (
                          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-base">👑</span>
                              <div>
                                <span className="font-bold">Bạn là Quản trị viên (Admin):</span>
                                <span className="ml-1 opacity-90 hidden sm:inline">Chế độ Thêm / Sửa / Xóa đang Tắt để tránh bấm nhầm.</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsAdminEditMode(true)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-xs active:scale-95 shrink-0"
                            >
                              Bật chế độ Quản trị
                            </button>
                          </div>
                        )}

                        <WordListView
                          words={isMultiLessonMode ? reviewWords : effectiveLessonWords}
                          masteredWords={progress.masteredWords}
                          favoriteWords={progress.favoriteWords}
                          hiddenWords={progress.hiddenWords || []}
                          onToggleMaster={handleToggleMasterWord}
                          onToggleFavorite={handleToggleFavoriteWord}
                          onToggleHide={handleToggleHideWord}
                          onRestoreAllHidden={handleRestoreLessonHiddenWords}
                          isAdmin={hasAdminAccess && isAdminEditMode}
                          onEditWord={(word) => setAdminEditWordModal({ isOpen: true, word })}
                          onAddNewWord={() => setAdminEditWordModal({ isOpen: true, word: null })}
                          onAdminDeleteWord={handleAdminDeleteWord}
                          deletedWordsCount={deletedWordsInCurrentLesson.length}
                          onOpenDeletedWords={() => setIsAdminDeletedModalOpen(true)}
                        />
                      </div>
                    )}

                    {/* 2. Tab Ngữ pháp */}
                    {lessonSubTab === 'grammar' && (
                      <GrammarView
                        lesson={currentGrammarLesson}
                        lessonNum={selectedLessonNum}
                      />
                    )}

                    {/* 3. Tab Bài đọc hiểu */}
                    {lessonSubTab === 'reading' && (
                      <ReadingView
                        reading={currentReadingLesson}
                        lessonNum={selectedLessonNum}
                      />
                    )}

                    {/* 4. Tab Luyện tập (5 Chế độ học) */}
                    {lessonSubTab === 'practice' && (
                      <div className="space-y-6">
                        {/* Hàng điều khiển: Chọn Chế Độ (Tier 1) & Nút Xáo Trộn Từ (Tier 2) */}
                        <div className="bg-white dark:bg-[#111c30] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                          {/* Tier 1: 5 Chế độ học dạng Grid full width, hiển thị đầy đủ tên chế độ */}
                          <StudyModeSelector
                            currentMode={studyMode}
                            onSelectMode={setStudyMode}
                            variant="compact"
                          />

                          {/* Tier 2: Dòng tiện ích - Số lượng từ và Bộ điều khiển xáo trộn */}
                          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Đang luyện tập <strong>{finalLessonPracticeWords.length}</strong> từ vựng</span>
                            </div>

                            {/* Bộ điều khiển Xáo trộn từ vựng */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setIsLessonPracticeShuffled(prev => !prev)}
                                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                  isLessonPracticeShuffled
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-sm shadow-blue-500/25'
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700'
                                }`}
                                title={isLessonPracticeShuffled ? 'Đang bật xáo trộn ngẫu nhiên' : 'Bật xáo trộn ngẫu nhiên'}
                              >
                                <Shuffle className="w-3.5 h-3.5" />
                                <span>{isLessonPracticeShuffled ? 'Đang xáo trộn 🔀' : 'Xáo trộn từ 🔀'}</span>
                              </button>

                              {isLessonPracticeShuffled && (
                                <button
                                  onClick={() => setLessonPracticeShuffleKey(k => k + 1)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition border border-slate-200/60 dark:border-slate-700"
                                  title="Đổi lượt xáo trộn mới"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Đổi lượt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 1. Flashcard 3D */}
                        {studyMode === 'flashcard' && (
                          <FlashcardView
                            words={finalLessonPracticeWords}
                            masteredWords={progress.masteredWords}
                            favoriteWords={progress.favoriteWords}
                            onToggleMaster={handleToggleMasterWord}
                            onToggleFavorite={handleToggleFavoriteWord}
                          />
                        )}

                        {/* Quizlet: Chế độ Học thích ứng (Learn Mode) */}
                        {studyMode === 'learn' && (
                          <AdaptiveLearnView
                            words={finalLessonPracticeWords}
                            masteredWords={progress.masteredWords}
                            favoriteWords={progress.favoriteWords}
                            onAddMastered={handleAddMasterWord}
                            onToggleFavorite={handleToggleFavoriteWord}
                            onSaveScore={(score, total) => handleSaveQuizScore(score, total, 'Học thông minh (Learn)')}
                          />
                        )}

                        {/* Quizlet: Chế độ Kiểm tra (Test Mode) */}
                        {studyMode === 'test' && (
                          <PracticeTestView
                            words={finalLessonPracticeWords}
                            favoriteWords={progress.favoriteWords}
                            lessonNum={selectedLessonNum}
                            onSaveScore={(score, total) => handleSaveQuizScore(score, total, 'Kiểm tra (Test)')}
                          />
                        )}

                        {/* Quizlet: Game Ghép thẻ (Match Game) */}
                        {studyMode === 'match' && (
                          <MatchGameView
                            words={finalLessonPracticeWords}
                            favoriteWords={progress.favoriteWords}
                            lessonNum={selectedLessonNum}
                            onToggleFavorite={handleToggleFavoriteWord}
                          />
                        )}

                        {/* 2. Trắc nghiệm (Quiz) */}
                        {studyMode === 'quiz' && (
                          <PracticeView
                            words={finalLessonPracticeWords}
                            mistakeWords={progress.mistakeWords}
                            onAddMistake={handleAddMistake}
                            onRemoveMistake={handleRemoveMistake}
                            onSaveQuizScore={handleSaveQuizScore}
                            onAddMastered={handleAddMasterWord}
                          />
                        )}

                        {/* 3. Nhồi nhét (Cramming Mode - Gõ Romaji sang Hiragana) */}
                        {studyMode === 'cram' && (
                          <CrammingModeView
                            words={finalLessonPracticeWords}
                            onFinish={(score, total) => handleSaveQuizScore(score, total, 'Nhồi nhét')}
                            onAddMastered={handleAddMasterWord}
                            onAddMasteredList={handleAddMasterWordsList}
                            onAddMistake={handleAddMistake}
                            onRemoveMistake={handleRemoveMistake}
                          />
                        )}

                        {/* 4. Dịch câu (Sentence Translate Puzzle) */}
                        {studyMode === 'translate' && (
                          <SentenceTranslateView
                            words={finalLessonPracticeWords}
                          />
                        )}

                        {/* 5. Nghe đuổi (Shadowing Mode) */}
                        {studyMode === 'shadowing' && (
                          <ShadowingView
                            words={finalLessonPracticeWords}
                            masteredWords={progress.masteredWords}
                            onToggleMaster={handleToggleMasterWord}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* CỘT PHẢI (Khung 25% - 3 cols): Sidebar Lưới 2 Cột Chuyển Bài Nhanh (Ảnh 2) */}
                  <div className="lg:col-span-3 lg:sticky lg:top-20">
                    <LessonSelector
                      currentCourse={currentCourse}
                      onSelectCourse={handleSelectCourse}
                      lessons={currentCourseData.lessons}
                      selectedLessonNum={selectedLessonNum}
                      onSelectLesson={handleSelectLesson}
                      masteredWords={progress.masteredWords}
                      hiddenWords={progress.hiddenWords}
                      vocabOverrides={vocabOverrides}
                      isMultiMode={isMultiLessonMode}
                      onToggleMultiMode={setIsMultiLessonMode}
                      selectedLessons={selectedLessons}
                      onToggleLessonSelection={handleToggleLessonSelection}
                      onSelectAllLessons={handleSelectAllLessons}
                      onClearAllLessons={handleClearAllLessons}
                      onSelectRange={handleSelectRange}
                      mode="sidebar"
                      onBackToDashboard={() => {
                        setActiveTab('tango');
                        setTangoViewMode('dashboard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHÂN HỆ 2: KANJI CHUYÊN SÂU (N5 -> N1) */}
        {activeTab === 'kanji' && (
          <KanjiMasterView
            kanjiList={currentKanjiList}
            allVocabWords={allVocabWords}
            allKanjiAcrossLevels={allKanjiAcrossLevels}
            currentLevel={selectedKanjiLevel}
            onSelectLevel={setSelectedKanjiLevel}
            masteredKanji={progress.masteredKanji}
            favoriteKanji={progress.favoriteKanji}
            onToggleMaster={handleToggleMasterKanji}
            onToggleFavorite={handleToggleFavoriteKanji}
            streak={progress.streak || 0}
          />
        )}

        {/* PHÂN HỆ 3: TRUNG TÂM LUYỆN TẬP CHUYÊN SÂU (PRACTICE HUB) */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {practiceStage === 'shadowing' ? (
              /* GÓC NHÌN ĐẶC BIỆT: SHADOWING & CHÉP CHÍNH TẢ QUA VIDEO */
              selectedShadowingVideo ? (
                <ShadowingPlayerView
                  video={selectedShadowingVideo}
                  onBack={() => setSelectedShadowingVideo(null)}
                />
              ) : (
                <ShadowingHubView
                  onSelectVideo={(video) => setSelectedShadowingVideo(video)}
                  onBackToPractice={() => {
                    setActiveTab('practice');
                    setPracticeStage('overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )
            ) : practiceStage === 'conjugation' ? (
              /* GÓC NHÌN ĐẶC BIỆT: BỘ LUYỆN CHIA THỂ ĐỘNG TỪ & TÍNH TỪ */
              <ConjugationTrainerView
                onBack={() => {
                  setActiveTab('practice');
                  setPracticeStage('overview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : practiceStage === 'typing' ? (
              /* GÓC NHÌN ĐẶC BIỆT: ĐẤU TRƯỜNG LUYỆN GÕ PHÍM TIẾNG NHẬT (LẤY CẢM HỨNG TỪ XIEHANZI) */
              <JapaneseTypingView
                allWords={allVocabWords}
                currentLevel={currentCourseData.name.includes('N1') ? 'N1' : 'N5'}
                onBack={() => {
                  setActiveTab('practice');
                  setPracticeStage('overview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onAddFavorite={handleToggleFavoriteWord}
                onAddMistake={handleAddMistake}
                masteredWords={progress.masteredWords}
                favoriteWords={progress.favoriteWords}
                mistakeWords={progress.mistakeWords}
              />
            ) : practiceStage === 'overview' ? (
              /* GÓC NHÌN 1: TỔNG THỂ TẤT CẢ CÁC BÀI HỌC (HIỂN THỊ ĐẦY ĐỦ, DỄ LỰA CHỌN) */
              <PracticeHubOverview
                currentCourse={currentCourse}
                onSelectCourse={handleSelectCourse}
                lessons={currentCourseData.lessons}
                selectedLessonNum={selectedLessonNum}
                onSelectLesson={handleSelectLesson}
                masteredWords={progress.masteredWords}
                hiddenWords={progress.hiddenWords}
                vocabOverrides={vocabOverrides}
                isMultiMode={isMultiLessonMode}
                onToggleMultiMode={setIsMultiLessonMode}
                selectedLessons={selectedLessons}
                onToggleLessonSelection={handleToggleLessonSelection}
                onSelectAllLessons={handleSelectAllLessons}
                onClearAllLessons={handleClearAllLessons}
                onSelectRange={handleSelectRange}
                studyMode={studyMode}
                onSelectStudyMode={setStudyMode}
                wordFilter={practiceWordFilter}
                onSelectWordFilter={setPracticeWordFilter}
                counts={practiceFilterCounts}
                onOpenConjugationTrainer={() => setPracticeStage('conjugation')}
                onOpenTypingMaster={() => setPracticeStage('typing')}
                onOpenShadowingHub={() => setPracticeStage('shadowing')}
                onOpenMistakeBank={() => setIsMistakeBankOpen(true)}
                dueSrsCount={dueSrsItems.length}
                onOpenSrsReview={() => setIsSrsReviewOpen(true)}
                onStartPractice={(lessonNum) => {
                  if (lessonNum) {
                    setSelectedLessonNum(lessonNum);
                    if (!isMultiLessonMode) {
                      setSelectedLessons([lessonNum]);
                    }
                  }
                  setPracticeStage('session');
                }}
              />
            ) : (
              /* GÓC NHÌN 2: PHIÊN LUYỆN TẬP TẬP TRUNG (PRACTICE SESSION) */
              <div className="space-y-6">
                {/* Header điều hướng quay lại màn hình chọn bài & chuyển nhanh phương pháp */}
                <PracticeSessionHeader
                  courseName={currentCourseData.name}
                  lessonTitle={
                    isMultiLessonMode
                      ? `Đang ôn tập ${selectedLessons.length} bài (${selectedLessons.slice().sort((a,b)=>a-b).map(n => `Bài ${n}`).join(', ')})`
                      : `Bài ${selectedLessonNum}: ${getLessonTopic(currentCourse, selectedLessonNum)}`
                  }
                  isMultiMode={isMultiLessonMode}
                  selectedLessonsCount={selectedLessons.length}
                  totalWordsCount={finalPracticeWords.length}
                  studyMode={studyMode}
                  onSelectStudyMode={setStudyMode}
                  wordFilter={practiceWordFilter}
                  onSelectWordFilter={setPracticeWordFilter}
                  filterCounts={practiceFilterCounts}
                  onBackToOverview={() => {
                    setActiveTab('practice');
                    setPracticeStage('overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isShuffled={isPracticeShuffled}
                  onToggleShuffle={() => setIsPracticeShuffled((prev) => !prev)}
                  onReshuffle={() => setShuffleKey((k) => k + 1)}
                />

                {/* Khu vực thực hành chế độ học tập */}
                {studyMode === 'flashcard' && (
                  <FlashcardView
                    words={finalPracticeWords}
                    masteredWords={progress.masteredWords}
                    favoriteWords={progress.favoriteWords}
                    onToggleMaster={handleToggleMasterWord}
                    onToggleFavorite={handleToggleFavoriteWord}
                  />
                )}

                {/* Quizlet: Chế độ Học thích ứng (Learn Mode) */}
                {studyMode === 'learn' && (
                  <AdaptiveLearnView
                    words={finalPracticeWords}
                    masteredWords={progress.masteredWords}
                    favoriteWords={progress.favoriteWords}
                    onAddMastered={handleAddMasterWord}
                    onToggleFavorite={handleToggleFavoriteWord}
                    onSaveScore={(score, total) => handleSaveQuizScore(score, total, 'Học thông minh (Learn)')}
                  />
                )}

                {/* Quizlet: Chế độ Kiểm tra (Test Mode) */}
                {studyMode === 'test' && (
                  <PracticeTestView
                    words={finalPracticeWords}
                    favoriteWords={progress.favoriteWords}
                    lessonNum={selectedLessonNum}
                    onSaveScore={(score, total) => handleSaveQuizScore(score, total, 'Kiểm tra (Test)')}
                  />
                )}

                {/* Quizlet: Game Ghép thẻ (Match Game) */}
                {studyMode === 'match' && (
                  <MatchGameView
                    words={finalPracticeWords}
                    favoriteWords={progress.favoriteWords}
                    lessonNum={selectedLessonNum}
                    onToggleFavorite={handleToggleFavoriteWord}
                  />
                )}

                {studyMode === 'quiz' && (
                  <PracticeView
                    words={finalPracticeWords}
                    mistakeWords={progress.mistakeWords}
                    onAddMistake={handleAddMistake}
                    onRemoveMistake={handleRemoveMistake}
                    onSaveQuizScore={handleSaveQuizScore}
                    onAddMastered={handleAddMasterWord}
                  />
                )}

                {studyMode === 'cram' && (
                  <CrammingModeView
                    words={finalPracticeWords}
                    onFinish={(score, total) => handleSaveQuizScore(score, total, 'Nhồi nhét')}
                    onAddMastered={handleAddMasterWord}
                    onAddMasteredList={handleAddMasterWordsList}
                    onAddMistake={handleAddMistake}
                    onRemoveMistake={handleRemoveMistake}
                  />
                )}

                {studyMode === 'translate' && (
                  <SentenceTranslateView
                    words={finalPracticeWords}
                  />
                )}

                {studyMode === 'shadowing' && (
                  <ShadowingView
                    words={finalPracticeWords}
                    masteredWords={progress.masteredWords}
                    onToggleMaster={handleToggleMasterWord}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* PHÂN HỆ 4: SỔ TAY TỪ VỰNG TỰ TẠO (CUSTOM NOTEBOOK) */}
        {activeTab === 'notebook' && (
          <CustomNotebookView
            customNotebooks={progress.customNotebooks || []}
            onUpdateNotebooks={handleUpdateCustomNotebooks}
            masteredWords={progress.masteredWords}
            favoriteWords={progress.favoriteWords}
            mistakeWords={progress.mistakeWords}
            onToggleMaster={handleToggleMasterWord}
            onToggleFavorite={handleToggleFavoriteWord}
            onAddMistake={handleAddMistake}
            onRemoveMistake={handleRemoveMistake}
            onSaveQuizScore={handleSaveQuizScore}
          />
        )}

        {/* PHÂN HỆ 5: DASHBOARD CÁ NHÂN (PERSONAL DASHBOARD & ANALYTICS) */}
        {activeTab === 'dashboard' && (
          <PersonalDashboardView
            progress={progress}
            currentUser={currentUser}
            allVocabWords={allVocabWords}
            kanjiDatasets={kanjiDatasets}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenBackup={() => setIsBackupOpen(true)}
            onNavigateToPractice={(filter, mode) => {
              setPracticeWordFilter(filter);
              if (mode) setStudyMode(mode);
              setPracticeStage('session');
              setActiveTab('practice');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToCourse={(courseKey) => {
              handleSelectCourse(courseKey);
              setTangoViewMode('dashboard');
              setActiveTab('tango');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToKanji={(level) => {
              setSelectedKanjiLevel(level);
              setActiveTab('kanji');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToNotebook={() => {
              setActiveTab('notebook');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenConjugationTrainer={() => {
              setActiveTab('practice');
              setPracticeStage('conjugation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            dueSrsCount={dueSrsItems.length}
            onOpenSrsReview={() => setIsSrsReviewOpen(true)}
          />
        )}
      </main>

      {/* Footer bản quyền & thông tin giáo trình */}
      <footer className="mt-auto border-t border-stone-200/60 dark:border-stone-800/60 bg-white/40 dark:bg-stone-900/40 py-6 text-center text-xs text-stone-400 dark:text-stone-500">
        <p className="font-bold text-stone-700 dark:text-stone-300">
          LearnJPD • Phát triển bởi <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Anh Tuấn</span>
        </p>
        <p className="mt-1 text-[11px]">
          Dựa trên giáo trình Minna no Nihongo (50 bài) & Bộ Kanji chuẩn JLPT N5 - N1
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user?.id) {
            fetchFromSupabase(user.id).then((cloudP) => {
              if (cloudP) {
                setProgress(cloudP);
                saveLocalProgress(cloudP, user.id);
              } else {
                syncWithSupabase(user.id, progress);
                saveLocalProgress(progress, user.id);
              }
            });
          } else {
            // Khi đăng xuất: chuyển về dữ liệu khách
            const guestP = loadLocalProgress();
            setProgress(guestP);
          }
        }}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        progress={progress}
        onProgressImported={(newP) => setProgress(newP)}
      />

      {/* Modal Kho Từ Hay Sai & Khắc Phục */}
      <MistakeBankModal
        isOpen={isMistakeBankOpen}
        onClose={() => setIsMistakeBankOpen(false)}
        mistakeWordIds={progress.mistakeWords}
        allVocabWords={allVocabWords}
        masteredWordIds={progress.masteredWords}
        onRemoveMistake={handleRemoveMistake}
        onAddMastered={handleAddMasterWord}
        onClearAllMistakes={() => {
          updateProgress((prev) => ({ ...prev, mistakeWords: [] }));
        }}
        onStartPracticeWithMistakes={(mode) => {
          setStudyMode(mode);
          setPracticeWordFilter('mistake');
          setPracticeStage('session');
          setActiveTab('practice');
        }}
      />

      {/* Modal Ôn Tập Ngắt Quãng SRS (Spaced Repetition System SM-2) */}
      <SrsReviewModal
        isOpen={isSrsReviewOpen}
        onClose={() => setIsSrsReviewOpen(false)}
        dueItems={dueSrsItems}
        onRateItem={handleRateSrsItem}
      />

      {/* Modal Chỉnh sửa / Thêm mới từ vựng dành cho Admin */}
      <AdminWordEditModal
        isOpen={adminEditWordModal.isOpen}
        onClose={() => setAdminEditWordModal({ isOpen: false, word: null })}
        wordToEdit={adminEditWordModal.word}
        courseKey={currentCourse}
        lessonNum={selectedLessonNum}
        onSave={handleAdminSaveWord}
        onDelete={handleAdminDeleteWord}
      />

      {/* Modal Quản lý và Khôi phục từ vựng đã xóa (Admin) */}
      <AdminDeletedWordsModal
        isOpen={isAdminDeletedModalOpen}
        onClose={() => setIsAdminDeletedModalOpen(false)}
        deletedWords={deletedWordsInCurrentLesson}
        lessonNum={selectedLessonNum}
        onRestoreWord={handleAdminRestoreWord}
      />

      {/* Mobile Bottom Navigation Bar (Chỉ hiển thị trên thiết bị di động) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'tango' && activeTab === 'tango') {
            setTangoViewMode('dashboard');
          }
          setActiveTab(tab);
          if (tab === 'practice') {
            setPracticeStage('overview');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mistakeCount={progress.mistakeWords.length}
      />
    </div>
  );
}

export default App;
