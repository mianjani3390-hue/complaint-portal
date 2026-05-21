import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const links = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/complaints', icon: 'complaints', label: 'All Complaints' },
  { to: '/users', icon: 'users', label: 'Users' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

function Icon({ name }) {
  const paths = {
    dashboard: (
      <>
        <path d="M4 13h6V4H4v9Z" />
        <path d="M14 20h6V4h-6v16Z" />
        <path d="M4 20h6v-3H4v3Z" />
      </>
    ),
    complaints: (
      <>
        <path d="M7 4h10a2 2 0 0 1 2 2v14l-4-3H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M8 8h8" />
        <path d="M8 12h6" />
      </>
    ),
    users: (
      <>
        <path d="M16 19a4 4 0 0 0-8 0" />
        <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M21 19a3.5 3.5 0 0 0-4-3.45" />
        <path d="M17 5.2a2.5 2.5 0 0 1 0 4.6" />
      </>
    ),
    settings: (
      <>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

export default function Sidebar({ open, onClose }) {
  const { signOut, profile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = useState(true);

  const handleLogout = async () => {
    navigate('/login', { replace: true, state: { clearLogin: true } });
    await signOut();
  };

  const visibleLinks = links.filter((l) => (l.to === '/users' ? isSuperAdmin : true));

  return (
    <aside
      className={`fixed z-50 flex h-full w-64 flex-col bg-gradient-to-b from-blue-800 to-blue-600 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-blue-400/50 p-6">
        {logoOk ? (
          <img
            src={logo}
            alt=""
            className="h-8 w-8 rounded-lg bg-white object-contain p-1"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400 font-bold">Q</span>
        )}
        <h1 className="text-xl font-semibold">ComplaintHub</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {visibleLinks.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-blue-500/80 ${
                isActive ? 'bg-sky-400 text-white' : ''
              }`
            }
          >
            <span className="flex h-6 w-6 items-center justify-center">
              <Icon name={icon} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-blue-400/50 p-4">
        <p className="truncate px-4 py-2 text-xs text-white-200">{profile?.email}</p>
        <p className="px-4 pb-3 text-xs capitalize text-white-300">{profile?.role?.replace('_', ' ')}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center">
            <Icon name="logout" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
