import { useEffect, useState } from 'react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const TITLES = [
  { pattern: '/', title: 'Dashboard', end: true },
  { pattern: '/complaints', title: 'All Complaints' },
  { pattern: '/complaints/:id', title: 'Complaint Details' },
  { pattern: '/users', title: 'Users' },
  { pattern: '/settings', title: 'Settings' },
];

function pageTitle(pathname) {
  for (const { pattern, title, end } of TITLES) {
    if (matchPath({ path: pattern, end: !!end }, pathname)) return title;
  }
  return 'ComplaintHub';
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const title = pageTitle(pathname);

  useEffect(() => {
    setAvatarFailed(false);
  }, [profile?.avatar_url]);

  return (
    <div className="flex h-screen overflow-hidden bg-blue-50">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center border-b-2 border-blue-100 bg-white px-6">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-800 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
          <h1 className="min-w-0 truncate text-xl font-semibold text-blue-900">{title}</h1>
          <div className="ml-auto hidden items-center gap-2 text-sm sm:flex">
            {profile?.avatar_url && !avatarFailed ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full border border-blue-100 bg-white object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-800">
                {(profile?.full_name || profile?.email || 'A')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-slate-800">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs capitalize text-slate-500">{profile?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
