import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function MobileSidebar({ isOpen, onClose, activeCategory, onCategoryChange }: MobileSidebarProps) {
  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out md:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <Sidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              isMobileSidebar={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
