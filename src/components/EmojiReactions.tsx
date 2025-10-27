import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

interface EmojiReaction {
  emoji: string;
  label: string;
  count: number;
  hasReacted: boolean;
}

interface EmojiReactionsProps {
  onClick?: (e: React.MouseEvent) => void;
}

const availableEmojis = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🚀', label: 'Rocket' }
];

export function EmojiReactions({ onClick }: EmojiReactionsProps) {
  const [reactions, setReactions] = useState<EmojiReaction[]>([
    { emoji: '👍', label: 'Like', count: 12, hasReacted: false },
    { emoji: '❤️', label: 'Love', count: 8, hasReacted: false },
    { emoji: '😂', label: 'Laugh', count: 5, hasReacted: false },
    { emoji: '🎉', label: 'Celebrate', count: 3, hasReacted: false },
    { emoji: '🚀', label: 'Rocket', count: 15, hasReacted: false }
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReactions(prev =>
      prev.map(r => {
        if (r.emoji === emoji) {
          return {
            ...r,
            count: r.hasReacted ? r.count - 1 : r.count + 1,
            hasReacted: !r.hasReacted
          };
        }
        return r;
      })
    );
    setShowPicker(false);
  };

  const handlePickerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPicker(!showPicker);
    onClick?.(e);
  };

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-1">
        {activeReactions.slice(0, 3).map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={(e) => handleEmojiClick(reaction.emoji, e)}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-sm transition-all duration-200 ${
              reaction.hasReacted
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={reaction.label}
          >
            <span className="text-xs">{reaction.emoji}</span>
            <span className="text-xs font-medium">{reaction.count}</span>
          </button>
        ))}

        <button
          onClick={handlePickerToggle}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          title="Add reaction"
        >
          <Smile size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-scale-in">
          <div className="flex gap-0.5">
            {availableEmojis.map(({ emoji, label }) => {
              const reaction = reactions.find(r => r.emoji === emoji);
              return (
                <button
                  key={emoji}
                  onClick={(e) => handleEmojiClick(emoji, e)}
                  className={`w-8 h-8 flex items-center justify-center text-lg rounded-md transition-all duration-200 ${
                    reaction?.hasReacted
                      ? 'bg-blue-500/20 scale-110'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110'
                  }`}
                  title={label}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
