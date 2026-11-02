/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Ticket, Star, Clock, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onBookTickets: (movie: Movie) => void;
  onWatchTrailer: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onBookTickets,
  onWatchTrailer,
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800">
      {/* Background Image with Cinematic Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdropUrl}
          alt="Cinema Hall"
          className="w-full h-full object-cover object-center opacity-30 brightness-75 scale-105 transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Movie Editorial & Booking CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Unboxed Metadata Header (No static pills per anti-slop rules) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-mono tracking-wide">
              <span className="font-semibold text-amber-300">FEATURED IMAX PREMIERE</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">DAILY SCREENINGS</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">DOLBY ATMOS 64-CH</span>
            </div>

            {/* Display Headline with balanced wrapping */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.1] [text-wrap:balance]">
                {movie.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-medium italic">
                "{movie.tagline}"
              </p>
            </div>

            {/* Clean Unboxed Metadata Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="tabular-nums font-mono">{movie.rating.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">/10 ({movie.votesCount.toLocaleString()} votes)</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1 text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="tabular-nums font-mono">{movie.durationMinutes} min</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="font-mono text-slate-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs">
                {movie.certificate}
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-slate-400">{movie.genres.join(' / ')}</span>
            </div>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              {movie.synopsis}
            </p>

            {/* Formats and Director note */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Directed by</span>{' '}
                <span className="text-slate-200 font-medium">{movie.director}</span>
              </div>
              <span aria-hidden="true" className="hidden sm:inline text-slate-700">·</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Audio/Visual Formats:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                  {movie.formats.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onBookTickets(movie)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
              >
                <Ticket className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Select Showtime & Reserve Seats</span>
              </button>

              <button
                onClick={() => onWatchTrailer(movie)}
                className="px-5 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-medium text-sm rounded-lg border border-slate-700/80 hover:border-slate-600 transition-all duration-200 flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Trailer & Film Notes</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Theatrical Poster Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group max-w-[320px] sm:max-w-[360px] w-full">
              {/* Subtle background glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-sky-500/30 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition duration-500" />

              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                <img
                  src={movie.posterUrl}
                  alt={`${movie.title} official poster`}
                  className="w-full h-auto aspect-[3/4] object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auditorium 1 Laser</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">
                    Live Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI / Capability strip placed in a full-width row below hero split */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Seat Matrix</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">Atomic conflict locking</p>
            <p className="text-slate-500 text-xs mt-0.5">Instant availability sync across 72 seats</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Express & JWT Security</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">HMAC-SHA256 Token Auth</p>
            <p className="text-slate-500 text-xs mt-0.5">Stateless patron sessions & QR signing</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Ticket className="w-3.5 h-3.5" />
              <span>Instant Passbook Ticket</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">Digital QR & Barcode Pass</p>
            <p className="text-slate-500 text-xs mt-0.5">Mobile turnstile & hall entry ready</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Multiplex Scheduling</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">3 Premier Locations</p>
            <p className="text-slate-500 text-xs mt-0.5">IMAX 3D, Dolby Atmos & Laser 4K</p>
          </div>
        </div>
      </div>
    </section>
  );
};
