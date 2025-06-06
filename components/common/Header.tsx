
import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { SIDEBAR_LINKS, DEFAULT_USER_PHOTO, APP_NAME, SUPABASE_AVATARS_BUCKET } from '../../constants';
import { getStoragePublicUrl } from '../../supabaseClient';


interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getCurrentPageTitle = () => {
    const currentLink = SIDEBAR_LINKS.find(link => location.pathname.startsWith(link.href));
    return currentLink ? currentLink.name : APP_NAME;
  };

  // Resolve avatar URL. user.avatar_url might be a full public URL or just a path.
  // AuthContext now might store the path.
  let avatarDisplayUrl = DEFAULT_USER_PHOTO;
  if (user?.avatar_url) {
    // Check if it's already a full URL
    if (user.avatar_url.startsWith('http://') || user.avatar_url.startsWith('https://')) {
        avatarDisplayUrl = user.avatar_url;
    } else {
        // If it's a path, resolve it
        const resolvedUrl = getStoragePublicUrl(SUPABASE_AVATARS_BUCKET, user.avatar_url);
        if (resolvedUrl) {
            avatarDisplayUrl = resolvedUrl;
        }
    }
  }


  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-slate-800 shadow-md">
      <button
        type="button"
        className="px-4 border-r border-slate-700 text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-purple md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 flex">
          <h1 className="text-xl font-semibold text-slate-100">{getCurrentPageTitle()}</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <span className="text-sm text-slate-300 mr-3 hidden sm:block">Olá, {user?.name || user?.email}</span>
          <img 
            className="h-10 w-10 rounded-full border-2 border-primary-purple object-cover" 
            src={avatarDisplayUrl}
            alt="User avatar" 
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
