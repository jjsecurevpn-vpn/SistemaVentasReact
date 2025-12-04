import React from 'react';
import { MdMenu } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] text-white border-b border-neutral-800/50 z-[9999] flex items-center justify-between px-4">
      {/* Left side: Menu button and logo */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
          >
            <MdMenu size={20} />
          </button>
        )}
        <div className="flex items-center gap-3">
          <img src="/Secure.svg" alt="Logo" className="h-7 w-7" />
          <span className="hidden md:inline text-sm font-medium text-white">{title}</span>
        </div>
      </div>

      {/* Right side: User info */}
      {user && (
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs text-neutral-500">{user.email}</span>
          <button
            onClick={signOut}
            className="text-xs text-neutral-500 hover:text-white transition-colors px-3 py-1.5 hover:bg-neutral-800/50 rounded-md"
          >
            Salir
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;