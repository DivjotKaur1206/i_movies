/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
  onOpenMyBookings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs, onOpenMyBookings }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                <Film className="w-3.5 h-3.5 fill-slate-950" />
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                IMovies Cinema Platform
              </span>
            </div>
            <p className="text-slate-500 text-xs max-w-sm">
              Real-time movie booking, seat availability tracking, and Express.js + MongoDB client-server architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <button
              onClick={() => {
                const el = document.getElementById('now-showing');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Theatrical Lineup
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('showtimes-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Auditoriums & Locations
            </button>
            <button
              onClick={onOpenMyBookings}
              className="text-slate-400 hover:text-white transition-colors"
            >
              My Passbook Tickets
            </button>
            <button
              onClick={onOpenDocs}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              6 Epics & System Architecture
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} IMovies Theaters, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Built with React 19 · Express.js · Node.js · MongoDB · JWT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
