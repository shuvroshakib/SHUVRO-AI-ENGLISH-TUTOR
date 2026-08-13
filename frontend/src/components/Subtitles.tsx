import { useEffect, useRef } from 'react';

interface SubtitlesProps {
  userText: string;
  aiText: string;
  focusWord?: string;
  enabled: boolean;
}

export default function Subtitles({ userText, aiText, focusWord, enabled }: SubtitlesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [userText, aiText]);

  if (!enabled) return null;

  const highlightWord = (text: string) => {
    if (!focusWord || !text) return text;
    const regex = new RegExp(`(${focusWord})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-300 font-bold text-gray-900 px-1 rounded">{part}</span> : part
    );
  };

  return (
    <div ref={scrollRef} className="bg-black/80 rounded-xl p-4 h-40 overflow-y-auto space-y-3 text-sm">
      {userText && (
        <div className="text-blue-300">
          <span className="text-xs uppercase font-bold text-blue-400 block mb-1">You</span>
          <div className="leading-relaxed">{highlightWord(userText)}</div>
        </div>
      )}
      {aiText && (
        <div className="text-white">
          <span className="text-xs uppercase font-bold text-accent-400 block mb-1">SHUVRO AI</span>
          <div className="leading-relaxed">{highlightWord(aiText)}</div>
        </div>
      )}
      {!userText && !aiText && (
        <div className="text-gray-500 text-center py-8 text-xs">Subtitles will appear here</div>
      )}
    </div>
  );
}
