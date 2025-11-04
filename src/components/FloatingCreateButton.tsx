import { useState, useEffect, useRef } from 'react';
import { Plus, FileText, Calendar, Briefcase, Code, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FloatingCreateButtonProps {
  onLoginRequired?: () => void;
}

export function FloatingCreateButton({ onLoginRequired }: FloatingCreateButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't show button if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleMainClick = () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (type: 'post' | 'event' | 'opportunity' | 'hackathon') => {
    setIsOpen(false);
    
    // Navigate to create post page with type parameter
    // You can modify this based on your routing structure
    if (type === 'post') {
      navigate('/create-post');
    } else {
      // For now, navigate to create-post with query param, or you can create separate routes
      navigate(`/create-post?type=${type}`);
    }
  };

  return (
    <div ref={menuRef} className="sm:hidden fixed bottom-6 right-6 z-50">
      {/* Sub-buttons */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-3 animate-slide-up">
          {/* Hackathon */}
          <button
            onClick={() => handleOptionClick('hackathon')}
            className="flex items-center gap-3 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Create hackathon"
          >
            <Code size={20} />
            <span className="text-sm font-medium pr-2">Hackathon</span>
          </button>

          {/* Opportunity */}
          <button
            onClick={() => handleOptionClick('opportunity')}
            className="flex items-center gap-3 p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Create opportunity"
          >
            <Briefcase size={20} />
            <span className="text-sm font-medium pr-2">Opportunity</span>
          </button>

          {/* Event */}
          <button
            onClick={() => handleOptionClick('event')}
            className="flex items-center gap-3 p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Create event"
          >
            <Calendar size={20} />
            <span className="text-sm font-medium pr-2">Event</span>
          </button>

          {/* Post */}
          <button
            onClick={() => handleOptionClick('post')}
            className="flex items-center gap-3 p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Create post"
          >
            <FileText size={20} />
            <span className="text-sm font-medium pr-2">Post</span>
          </button>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleMainClick}
        className={`p-4 rounded-full text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 animate-float ${
          isOpen
            ? 'bg-gradient-to-r from-gray-500 to-gray-600'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Create content'}
      >
        {isOpen ? <X size={24} strokeWidth={2.5} /> : <Plus size={24} strokeWidth={2.5} />}
      </button>
    </div>
  );
}
