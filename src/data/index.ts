import minnaLessons from './minna_lessons.json';
import vocabN3 from './vocab/n3_lessons.json';
import vocabN2 from './vocab/n2_lessons.json';
import vocabN1 from './vocab/n1_lessons.json';

import kanjiN5 from './kanji/n5.json';
import kanjiN4 from './kanji/n4.json';
import kanjiN3 from './kanji/n3.json';
import kanjiN2 from './kanji/n2.json';
import kanjiN1 from './kanji/n1.json';

import { LessonGroup, KanjiItem } from '../types';

const allMinna = minnaLessons as LessonGroup[];

// 1. Minna no Nihongo Sơ Cấp 1 (Bài 1 - 25) -> Cấp độ N5
const minnaShokyu1: LessonGroup[] = allMinna.slice(0, 25);

// 2. Minna no Nihongo Sơ Cấp 2 (Bài 26 - 50) -> Cấp độ N4
const minnaShokyu2: LessonGroup[] = allMinna.slice(25, 50);

// 3. Minna no Nihongo Trung Cấp 1 (Chūkyū 1: Bài 1 - 12) & Bộ đề N3
// Chia 2.140 từ vựng N3 thành 24 bài Trung Cấp chuẩn mực
const n3RawLessons = vocabN3 as LessonGroup[];
const minnaChukyu1: LessonGroup[] = n3RawLessons.slice(0, 24).map((l, idx) => ({
  ...l,
  lesson: idx + 1,
  title: `Bài ${idx + 1} (Trung cấp 1)`,
  level: 'N3'
}));

// 4. Minna no Nihongo Trung Cấp 2 (Chūkyū 2: Bài 13 - 24) & Bộ đề N2
const n2RawLessons = vocabN2 as LessonGroup[];
const minnaChukyu2: LessonGroup[] = n2RawLessons.slice(0, 24).map((l, idx) => ({
  ...l,
  lesson: idx + 13,
  title: `Bài ${idx + 13} (Trung cấp 2)`,
  level: 'N2'
}));

// 5. Giáo trình Chuyên Sâu N1 (Trọn bộ 108 bài học - 2.699 từ vựng)
const n1Lessons: LessonGroup[] = (vocabN1 as LessonGroup[]).map((l) => ({
  ...l,
  level: 'N1'
}));

// Danh mục Giáo trình chuẩn hóa
export const courseDatasets: Record<string, { 
  name: string; 
  badge: string; 
  level: string; 
  description: string;
  lessons: LessonGroup[] 
}> = {
  MINNA_1: {
    name: 'Minna Sơ Cấp 1 (Bài 1 - 25)',
    badge: 'JLPT N5',
    level: 'N5',
    description: 'Giáo trình Minna no Nihongo Sơ cấp 1 dành cho người mới bắt đầu',
    lessons: minnaShokyu1,
  },
  MINNA_2: {
    name: 'Minna Sơ Cấp 2 (Bài 26 - 50)',
    badge: 'JLPT N4',
    level: 'N4',
    description: 'Giáo trình Minna no Nihongo Sơ cấp 2 hoàn thành toàn bộ sơ cấp',
    lessons: minnaShokyu2,
  },
  MINNA_CHUKYU_1: {
    name: 'Minna Trung Cấp 1 (Bài 1 - 12)',
    badge: 'JLPT N3',
    level: 'N3',
    description: 'Giáo trình Minna no Nihongo Chūkyū 1 tương đương trình độ N3',
    lessons: minnaChukyu1,
  },
  MINNA_CHUKYU_2: {
    name: 'Minna Trung Cấp 2 (Bài 13 - 24)',
    badge: 'JLPT N2',
    level: 'N2',
    description: 'Giáo trình Minna no Nihongo Chūkyū 2 tương đương trình độ N2',
    lessons: minnaChukyu2,
  },
  JLPT_N1: {
    name: 'Chuyên Sâu Cao Cấp (108 bài)',
    badge: 'JLPT N1',
    level: 'N1',
    description: 'Trọn bộ 2.699 từ vựng luyện thi cao cấp chuẩn JLPT N1',
    lessons: n1Lessons,
  },
};

// Kanji Datasets chuẩn JLPT N5 -> N1
export const kanjiDatasets: Record<string, KanjiItem[]> = {
  N5: kanjiN5 as KanjiItem[],
  N4: kanjiN4 as KanjiItem[],
  N3: kanjiN3 as KanjiItem[],
  N2: kanjiN2 as KanjiItem[],
  N1: kanjiN1 as KanjiItem[],
};
