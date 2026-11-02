/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, Ticket, BookOpen, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeView: 'cinema' | 'docs';
  onViewChange: (view: 'cinema' | 'docs') => void;
  currentUser: User | null;
  bookingsCount: number;
  onOpenMyBookings: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickBook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  currentUser,
  bookingsCount,
  onOpenMyBookings,
  onOpenAuth,
  onLogout,
  onQuickBook,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => onViewChange('cinema')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 fill-slate-950 stroke-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
              IMovies<span className="text-amber-400">.</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Cinema & Tickets
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => {
              onViewChange('cinema');
              const el = document.getElementById('now-showing');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeView === 'cinema' ? 'text-slate-200' : 'text-slate-400'
            }`}
          >
            Now Showing
          </button>

          <button
            onClick={() => {
              onViewChange('cinema');
              const el = document.getElementById('showtimes-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-slate-400 hover:text-white whitespace-nowrap transition-colors"
          >
            Multiplex Showtimes
          </button>

          <button
            onClick={onOpenMyBookings}
            className="relative flex items-center gap-1.5 text-slate-400 hover:text-white whitespace-nowrap transition-colors"
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>My Bookings</span>
            {bookingsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                {bookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('docs')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeView === 'docs'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Project Docs & Architecture</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action / User profile */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                title="View JWT Session Claims"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium max-w-[100px] truncate">{currentUser.name}</span>
                <span className="text-[10px] text-amber-400 font-mono">JWT</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In / JWT</span>
            </button>
          )}

          <button
            onClick={onQuickBook}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </header>
  );
};
