/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Play, Pause, Star, Clock, Ticket, Volume2, ShieldCheck, Film, User } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onBookTickets: (movie: Movie) => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  onBookTickets,
}) => {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-950 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cinematic Backdrop / Trailer Player */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              isPlayingTrailer ? 'opacity-40 blur-xs scale-102' : 'opacity-70'
            }`}
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Interactive Simulated Trailer Player Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isPlayingTrailer ? (
              <div className="space-y-4 max-w-md bg-slate-950/85 backdrop-blur-md p-6 rounded-xl border border-slate-700/80 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Streaming Theatrical Trailer (Dolby Atmos)</span>
                </div>
                <p className="text-sm text-slate-200 font-medium italic">
                  "{movie.tagline}"
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-2/3 animate-pulse rounded-full" />
                </div>
                <button
                  onClick={() => setIsPlayingTrailer(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-md transition-colors flex items-center gap-1.5 mx-auto"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Trailer Preview</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPlayingTrailer(true)}
                className="group flex flex-col items-center gap-2 focus:outline-none"
              >
                <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 group-hover:scale-110 transition-transform duration-200">
                  <Play className="w-7 h-7 fill-slate-950 ml-1" />
                </div>
                <span className="text-xs font-semibold text-white tracking-wide uppercase font-mono group-hover:text-amber-400 transition-colors">
                  Play Official Trailer
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                <span>{movie.genres.join(' / ')}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.releaseYear}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-1">
                {movie.title}
              </h2>
              <p className="text-sm text-slate-400 italic mt-0.5">"{movie.tagline}"</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-mono font-bold text-white">{movie.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/10</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{movie.durationMinutes} min</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                {movie.certificate}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
              Synopsis & Plot
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* Lead Cast & Creative Crew */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3">
              Principal Cast & Direction
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] font-mono text-amber-400">Director</div>
                <div className="text-xs font-semibold text-white mt-1">{movie.director}</div>
                <div className="text-[11px] text-slate-500">Vision & Execution</div>
              </div>
              {movie.cast.map((actor, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Cast</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-1 truncate">{actor.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{actor.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Screening Formats & Tech Specs */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Theatrical Experience Certification</span>
              </div>
              <p className="text-xs text-slate-400">
                Optimized for Dual-Laser 4K Projection with 1.43:1 expanded aspect ratio in IMAX.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {movie.formats.map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 whitespace-nowrap"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              Close
            </button>
            {movie.nowShowing && (
              <button
                onClick={() => {
                  onClose();
                  onBookTickets(movie);
                }}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm shadow-amber-500/20 flex items-center gap-2 transition-colors active:scale-95"
              >
                <Ticket className="w-4 h-4 text-slate-950" />
                <span>Select Showtime & Reserve Seats</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
