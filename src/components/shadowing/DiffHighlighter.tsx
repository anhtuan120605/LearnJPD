import React from 'react';
import * as wanakana from 'wanakana';

interface DiffHighlighterProps {
  userAnswer: string;
  targetText: string;
  targetKana?: string;
  className?: string;
}

export function cleanJapaneseText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\s\u3000\u0020]+/g, '') // Bỏ khoảng trắng
    .replace(/[。、？！!?.,:;]/g, '')     // Bỏ dấu câu
    .trim();
}

export function calculateAccuracy(user: string, target: string, kanaTarget?: string): {
  score: number;
  isMatched: boolean;
  bestTarget: string;
} {
  const cleanUser = cleanJapaneseText(user);
  const cleanTarget = cleanJapaneseText(target);
  const cleanKana = cleanJapaneseText(kanaTarget || '');

  // Chuẩn hóa sang Hiragana để so sánh âm
  const userKana = cleanJapaneseText(wanakana.toHiragana(user));
  const targetKanaConverted = cleanJapaneseText(wanakana.toHiragana(target));

  if (!cleanUser) {
    return { score: 0, isMatched: false, bestTarget: target };
  }

  // Khớp 100% bản gốc hoặc bản kana
  if (cleanUser === cleanTarget || (cleanKana && cleanUser === cleanKana) || userKana === targetKanaConverted) {
    return { score: 100, isMatched: true, bestTarget: target };
  }

  // So sánh khoảng cách đơn giản (character overlap)
  const targetToCompare = cleanKana && userKana === cleanKana ? cleanKana : cleanTarget;
  let correctChars = 0;
  const minLen = Math.min(cleanUser.length, targetToCompare.length);
  for (let i = 0; i < minLen; i++) {
    if (cleanUser[i] === targetToCompare[i]) {
      correctChars++;
    }
  }

  const score = Math.round((correctChars / Math.max(cleanUser.length, targetToCompare.length)) * 100);
  return {
    score,
    isMatched: score >= 90,
    bestTarget: target
  };
}

export const DiffHighlighter: React.FC<DiffHighlighterProps> = ({
  userAnswer,
  targetText,
  targetKana,
  className = ''
}) => {
  const cleanUser = cleanJapaneseText(userAnswer);
  const cleanTarget = cleanJapaneseText(targetText);
  const cleanKana = cleanJapaneseText(targetKana || '');

  // Chọn bản so sánh phù hợp nhất
  const userKana = cleanJapaneseText(wanakana.toHiragana(userAnswer));
  const useKanaComparison = cleanKana && userKana.length > 0 && Math.abs(userKana.length - cleanKana.length) < Math.abs(cleanUser.length - cleanTarget.length);
  const targetCompare = useKanaComparison ? cleanKana : cleanTarget;

  const resultSegments: Array<{ char: string; status: 'correct' | 'wrong' | 'extra' }> = [];
  const maxLen = Math.max(cleanUser.length, targetCompare.length);

  for (let i = 0; i < maxLen; i++) {
    const userChar = cleanUser[i];
    const targetChar = targetCompare[i];

    if (userChar !== undefined && targetChar !== undefined) {
      if (userChar === targetChar || wanakana.toHiragana(userChar) === wanakana.toHiragana(targetChar)) {
        resultSegments.push({ char: userChar, status: 'correct' });
      } else {
        resultSegments.push({ char: userChar, status: 'wrong' });
      }
    } else if (userChar !== undefined) {
      resultSegments.push({ char: userChar, status: 'extra' });
    }
  }

  return (
    <div className={`p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 font-jp text-sm sm:text-base leading-relaxed break-words ${className}`}>
      <div className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider">
        So sánh kết quả gõ:
      </div>
      <div className="flex flex-wrap items-center gap-0.5">
        {resultSegments.map((seg, idx) => {
          if (seg.status === 'correct') {
            return (
              <span key={idx} className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 px-1 py-0.5 rounded">
                {seg.char}
              </span>
            );
          }
          if (seg.status === 'wrong') {
            return (
              <span key={idx} className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/15 line-through px-1 py-0.5 rounded">
                {seg.char}
              </span>
            );
          }
          return (
            <span key={idx} className="text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1 py-0.5 rounded text-xs">
              +{seg.char}
            </span>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300">
        <span className="font-bold text-stone-500 dark:text-stone-400">Đáp án chuẩn: </span>
        <span className="font-jp font-bold text-stone-800 dark:text-stone-100">{targetText}</span>
        {targetKana && (
          <span className="block text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 font-jp">
            ({targetKana})
          </span>
        )}
      </div>
    </div>
  );
};
