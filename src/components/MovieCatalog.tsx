/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Ticket, Film, Calendar, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Movie, Theater } from '../types';

interface MovieCatalogProps {
  movies: Movie[];
  theaters: Theater[];
  onSelectMovie: (movie: Movie) => void;
  onBookTickets: (movie: Movie) => void;
}

export const MovieCatalog: React.FC<MovieCatalogProps> = ({
  movies,
  theaters,
  onSelectMovie,
  onBookTickets,
}) => {
  const [filter, setFilter] = useState<'all' | 'nowShowing' | 'imax' | 'comingSoon'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedTheater, setSelectedTheater] = useState<string>(theaters[0]?.id || '');

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return ['All', ...Array.from(set)];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Filter tab
      if (filter === 'nowShowing' && !movie.nowShowing) return false;
      if (filter === 'imax' && !movie.formats.includes('IMAX 3D')) return false;
      if (filter === 'comingSoon' && !movie.comingSoon) return false;

      // Genre filter
      if (selectedGenre !== 'All' && !movie.genres.includes(selectedGenre as any)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = movie.title.toLowerCase().includes(q);
        const inDirector = movie.director.toLowerCase().includes(q);
        const inCast = movie.cast.some((c) => c.name.toLowerCase().includes(q));
        const inGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
        if (!inTitle && !inDirector && !inCast && !inGenre) return false;
      }

      return true;
    });
  }, [movies, filter, selectedGenre, searchQuery]);

  return (
    <div id="now-showing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
            Current Box Office & Lineup
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-1">
            Now Screening in Theaters
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search films, actors, directors..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs (Interactive buttons with click handlers) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Films ({movies.length})
          </button>
          <button
            onClick={() => setFilter('nowShowing')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filter === 'nowShowing'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setFilter('imax')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filter === 'imax'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            IMAX 3D Exclusives
          </button>
          <button
            onClick={() => setFilter('comingSoon')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filter === 'comingSoon'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Genre Selector */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 shrink-0">Genre:</span>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-slate-800 text-amber-400 font-medium border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Cards Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-lg font-medium text-slate-300">No movies match your filter criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search terms or genre filter</p>
          <button
            onClick={() => {
              setFilter('all');
              setSelectedGenre('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900 border border-slate-800/90 hover:border-slate-700 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
            >
              {/* Poster Artwork (65-75% card visual weight per retail design guideline) */}
              <div
                onClick={() => onSelectMovie(movie)}
                className="relative aspect-[3/4] overflow-hidden bg-slate-950 cursor-pointer"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Rating & Duration Badge (clean unboxed or subtle corner anchor) */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-md px-2.5 py-1 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-mono font-semibold text-white">{movie.rating.toFixed(1)}</span>
                </div>

                <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-md px-2 py-1 text-[11px] font-mono text-slate-300">
                  {movie.certificate}
                </div>

                {/* Bottom poster overlay info */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{movie.durationMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300">
                    {movie.formats[0]}
                  </div>
                </div>
              </div>

              {/* Card Body & Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Clean unboxed category with separator */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{movie.genres.join(' · ')}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{movie.releaseYear}</span>
                  </div>

                  <h3
                    onClick={() => onSelectMovie(movie)}
                    className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors cursor-pointer leading-tight"
                  >
                    {movie.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Director & Cast Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[170px] text-slate-400">
                    <span className="text-slate-500">Dir:</span> {movie.director}
                  </div>
                  <button
                    onClick={() => onSelectMovie(movie)}
                    className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>

                {/* Primary Card Action */}
                <div className="pt-1">
                  {movie.nowShowing ? (
                    <button
                      onClick={() => onBookTickets(movie)}
                      className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Book Seats ({movie.formats[0]})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectMovie(movie)}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Notify on Release</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multiplex Locations & Screen Formats Strip */}
      <div id="showtimes-section" className="mt-16 pt-12 border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
              IMovies Multiplex Network
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              Select Cinema Location & Experience
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            All auditoriums feature Christie Laser 4K illumination, motorized plush recliners, and concession delivery directly to your seat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {theaters.map((theater) => (
            <div
              key={theater.id}
              onClick={() => setSelectedTheater(theater.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                selectedTheater === theater.id
                  ? 'bg-slate-900 border-amber-400/80 ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-bold text-white text-base">
                    {theater.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{theater.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500">
                  Available Screens
                </span>
                <div className="space-y-1.5">
                  {theater.screens.map((screen) => (
                    <div
                      key={screen.id}
                      className="flex items-center justify-between text-xs text-slate-300"
                    >
                      <span>{screen.name}</span>
                      <span className="font-mono text-[11px] text-amber-400">
                        {screen.format}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
