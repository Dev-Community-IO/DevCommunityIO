import { Plus } from 'lucide-react';

interface FloatingCreateButtonProps {
  onClick: () => void;
}

export function FloatingCreateButton({ onClick }: FloatingCreateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="sm:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 animate-float"
      aria-label="Create post"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
