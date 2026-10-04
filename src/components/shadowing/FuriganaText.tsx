import React from 'react';
import { FuriganaToken } from '../../types/shadowing';

interface FuriganaTextProps {
  tokens?: FuriganaToken[];
  fallbackText: string;
  showFurigana?: boolean;
  className?: string;
  rubyClassName?: string;
}

export const FuriganaText: React.FC<FuriganaTextProps> = ({
  tokens,
  fallbackText,
  showFurigana = true,
  className = '',
  rubyClassName = '',
}) => {
  if (!tokens || tokens.length === 0) {
    return <span className={className}>{fallbackText}</span>;
  }

  return (
    <span className={`inline-block leading-relaxed tracking-wide font-jp ${className}`}>
      {tokens.map((token, idx) => {
        if (!token.ruby || !showFurigana) {
          return <span key={idx}>{token.text}</span>;
        }

        return (
          <ruby key={idx} className="group/ruby relative inline-flex flex-col items-center">
            <rt className={`text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-normal select-none -mb-1 leading-none ${rubyClassName}`}>
              {token.ruby}
            </rt>
            <span className="text-inherit">{token.text}</span>
          </ruby>
        );
      })}
    </span>
  );
};
