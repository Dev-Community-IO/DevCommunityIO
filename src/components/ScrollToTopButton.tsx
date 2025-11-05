import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Listen to scroll events
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`hidden lg:flex fixed bottom-6 right-6 z-40 p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 animate-float ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp size={24} strokeWidth={2.5} />
    </button>
  );
}

