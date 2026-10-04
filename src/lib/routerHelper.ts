import { LessonSubTab } from '../App';
import { StudyMode } from '../components/StudyModeSelector';

export interface AppNavState {
  tab: 'tango' | 'kanji' | 'practice' | 'notebook' | 'dashboard';
  tangoViewMode: 'dashboard' | 'study';
  course: string;
  lesson: number;
  subTab: LessonSubTab;
  studyMode: StudyMode;
  practiceStage: 'overview' | 'session' | 'conjugation' | 'typing' | 'shadowing';
  kanjiLevel: string;
}

const STORAGE_KEY = 'learn_jpd_nav_state';

export const defaultNavState: AppNavState = {
  tab: 'tango',
  tangoViewMode: 'dashboard',
  course: 'MINNA_1',
  lesson: 1,
  subTab: 'vocab',
  studyMode: 'flashcard',
  practiceStage: 'overview',
  kanjiLevel: 'N5',
};

/**
 * Trích xuất AppNavState từ URL query parameters hoặc LocalStorage
 */
export function getInitialNavState(): AppNavState {
  if (typeof window === 'undefined') return defaultNavState;

  try {
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.has('tab') || params.has('view') || params.has('lesson') || params.has('course');

    if (hasParams) {
      return parseNavFromSearchParams(params);
    }

    // Nếu vào URL gốc mà không có query params, khôi phục từ LocalStorage
    const rawSaved = localStorage.getItem(STORAGE_KEY);
    if (rawSaved) {
      const parsed = JSON.parse(rawSaved);
      return {
        ...defaultNavState,
        ...parsed,
        lesson: Number(parsed.lesson) || 1,
      };
    }
  } catch (err) {
    console.warn('[RouterHelper] Error reading initial nav state:', err);
  }

  return defaultNavState;
}

/**
 * Chuyển query parameters thành AppNavState
 */
export function parseNavFromSearchParams(params: URLSearchParams): AppNavState {
  const tab = (params.get('tab') as AppNavState['tab']) || defaultNavState.tab;
  const tangoViewMode = (params.get('view') as AppNavState['tangoViewMode']) || defaultNavState.tangoViewMode;
  const course = params.get('course') || defaultNavState.course;
  const lesson = parseInt(params.get('lesson') || '1', 10) || 1;
  const subTab = (params.get('subTab') as LessonSubTab) || defaultNavState.subTab;
  const studyMode = (params.get('mode') as StudyMode) || defaultNavState.studyMode;
  const practiceStage = (params.get('stage') as AppNavState['practiceStage']) || defaultNavState.practiceStage;
  const kanjiLevel = params.get('kLevel') || defaultNavState.kanjiLevel;

  return {
    tab,
    tangoViewMode,
    course,
    lesson,
    subTab,
    studyMode,
    practiceStage,
    kanjiLevel,
  };
}

/**
 * Chuyển AppNavState thành chuỗi URLSearchParams
 */
export function buildSearchParams(state: AppNavState): string {
  const params = new URLSearchParams();
  params.set('tab', state.tab);

  if (state.tab === 'tango') {
    params.set('view', state.tangoViewMode);
    params.set('course', state.course);
    if (state.tangoViewMode === 'study') {
      params.set('lesson', state.lesson.toString());
      params.set('subTab', state.subTab);
      if (state.subTab === 'practice') {
        params.set('mode', state.studyMode);
      }
    }
  } else if (state.tab === 'practice') {
    params.set('stage', state.practiceStage);
    params.set('course', state.course);
    params.set('lesson', state.lesson.toString());
    params.set('mode', state.studyMode);
  } else if (state.tab === 'kanji') {
    params.set('kLevel', state.kanjiLevel);
  }

  return params.toString();
}

/**
 * Đồng bộ trạng thái hiện tại lên URL và lưu vào LocalStorage
 */
export function syncNavToUrlAndStorage(state: AppNavState, pushHistory = false): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Lưu vào LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // 2. Cập nhật URL và Browser History
    const search = buildSearchParams(state);
    const newUrl = `${window.location.pathname}?${search}`;

    if (pushHistory) {
      // Chỉ pushState nếu URL thực sự thay đổi
      if (window.location.search !== `?${search}`) {
        window.history.pushState(state, '', newUrl);
      }
    } else {
      window.history.replaceState(state, '', newUrl);
    }
  } catch (err) {
    console.warn('[RouterHelper] Error syncing navigation:', err);
  }
}
