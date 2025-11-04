import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User as UserIcon, Mail, TrendingUp } from 'lucide-react';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import adminService from '../../services/api/admin.service';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  reputation: number;
  role?: string;
  status?: string;
}

interface UserAutocompleteProps {
  value: string;
  onChange: (userId: string, user: User | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserAutocomplete({ value, onChange, placeholder = 'Search users by username or email...', disabled = false }: UserAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Load selected user if value is provided
  useEffect(() => {
    if (value && !selectedUser && query === '') {
      // Try to find user by searching - if value looks like a UUID, search won't help
      // So we'll just let the user search manually
      // The value prop is mainly for controlled component usage
    } else if (!value && selectedUser) {
      setSelectedUser(null);
      setQuery('');
    }
  }, [value]);

  // Search users with debounce
  useEffect(() => {
    // Don't search if user is already selected and query matches
    if (selectedUser && query === selectedUser.username) {
      return;
    }

    if (!query.trim() || query.length < 2) {
      setUsers([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getUsers({ 
          search: query.trim(),
          limit: 10 
        });
        
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
          setIsOpen(true);
          setHighlightedIndex(-1);
        } else {
          setUsers([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Failed to search users:', error);
        setUsers([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, selectedUser]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || users.length === 0) {
      if (e.key === 'Escape' && selectedUser) {
        // Clear selection on Escape
        handleClear();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < users.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && users[highlightedIndex]) {
          handleSelectUser(users[highlightedIndex]);
        } else if (users.length === 1) {
          // If only one result, select it on Enter
          handleSelectUser(users[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setQuery(user.username);
    setIsOpen(false);
    onChange(user.id, user);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setQuery('');
    setUsers([]);
    setIsOpen(false);
    onChange('', null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear selection if user is typing
    if (selectedUser && newQuery !== selectedUser.username) {
      setSelectedUser(null);
      onChange('', null);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {selectedUser ? (
            <UserIcon size={18} />
          ) : (
            <Search size={18} />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && users.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedUser ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' : ''
          }`}
        />
        {selectedUser && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-auto">
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-purple-500" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Searching users...</span>
            </div>
          )}

          {!isLoading && users.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No users found matching &quot;{query}&quot;
            </div>
          )}

          {!isLoading && users.length > 0 && (
            <ul ref={listRef} className="py-2">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    highlightedIndex === index
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={user.avatar} 
                      alt={user.username} 
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.username}
                        </span>
                        {user.role && user.role !== 'user' && (
                          <Badge variant="purple" size="sm">
                            {user.role}
                          </Badge>
                        )}
                        {user.status && user.status !== 'active' && (
                          <Badge 
                            variant={user.status === 'suspended' ? 'yellow' : user.status === 'banned' ? 'red' : 'gray'} 
                            size="sm"
                          >
                            {user.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {user.email && (
                          <div className="flex items-center gap-1 truncate">
                            <Mail size={12} />
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          <span>{user.reputation || 0} rep</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

