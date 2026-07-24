import React from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, Plus, LogOut, ShieldCheck, User, BarChart2 } from 'lucide-react';
import { Clock } from './Clock';

export const Navbar = ({ onOpenCreate, onOpenPrivacy, activeTab, setActiveTab, onOpenAuth }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-ink-line">
      {/* Slim status strip */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 lg:px-8 h-7 text-[11px] border-b border-ink-line/60">
        <div className="flex items-center gap-1.5 text-paper-faint">
          <span className="w-1.5 h-1.5 rounded-full live-dot" />
          <span className="font-mono uppercase tracking-wider">Sistema operativo</span>
        </div>
        <Clock className="text-paper-faint" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="reg-mark w-8 h-8 rounded bg-signal-cyan flex items-center justify-center">
            <QrCode className="w-4 h-4 text-ink" strokeWidth={2.25} />
          </div>
          <span className="font-display text-base font-medium text-paper tracking-tight">
            PermQR<span className="text-paper-faint">/</span>Tracker
          </span>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-paper border-signal-cyan'
                  : 'text-paper-faint border-transparent hover:text-paper-dim'
              }`}
            >
              QR Code
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'text-paper border-signal-cyan'
                  : 'text-paper-faint border-transparent hover:text-paper-dim'
              }`}
            >
              Analytics
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPrivacy}
            className="hidden sm:flex items-center gap-1.5 text-xs text-paper-faint hover:text-paper px-2.5 py-2 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            GDPR
          </button>

          {user ? (
            <>
              <button
                onClick={onOpenCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-signal-cyan hover:bg-signal-cyan/90 text-ink text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Nuovo</span>
              </button>

              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-ink-line">
                <div className="hidden lg:block text-right leading-tight">
                  <div className="text-xs font-medium text-paper">{user.name}</div>
                  <div className="text-[11px] text-paper-faint font-mono">{user.email}</div>
                </div>

                <button
                  onClick={logout}
                  title="Disconnetti"
                  className="p-2 text-paper-faint hover:text-signal-magenta transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 border border-ink-line hover:border-signal-cyan/50 text-paper text-sm font-medium transition-all"
            >
              <User className="w-4 h-4" />
              Accedi
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
