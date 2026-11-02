/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MovieCatalog } from './components/MovieCatalog';
import { MovieDetailModal } from './components/MovieDetailModal';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AuthModal } from './components/AuthModal';
import { DocumentationHub } from './components/documentation/DocumentationHub';
import { Footer } from './components/Footer';
import { apiService } from './services/apiService';
import { Movie, Booking, User } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'cinema' | 'docs'>('cinema');
  const [currentUser, setCurrentUser] = useState<User | null>(apiService.getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>(apiService.getBookings());

  // Modals state
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState<Movie | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const movies = apiService.getMovies();
  const theaters = apiService.getTheaters();
  const featuredMovie = movies.find((m) => m.featured) || movies[0];

  const refreshBookings = () => {
    setBookings([...apiService.getBookings()]);
  };

  const handleBookingComplete = (newBooking: Booking) => {
    refreshBookings();
  };

  const handleQuickBook = () => {
    setActiveView('cinema');
    setSelectedMovieForBooking(featuredMovie);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Contract */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        currentUser={currentUser}
        bookingsCount={bookings.filter((b) => b.status === 'Confirmed').length}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          apiService.logoutUser();
          setCurrentUser(null);
        }}
        onQuickBook={handleQuickBook}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'cinema' ? (
          <div>
            {/* Theatrical IMAX Hero Banner */}
            <HeroBanner
              movie={featuredMovie}
              onBookTickets={(m) => setSelectedMovieForBooking(m)}
              onWatchTrailer={(m) => setSelectedMovieForDetails(m)}
            />

            {/* Movie Catalog Grid & Multiplex Showcase */}
            <MovieCatalog
              movies={movies}
              theaters={theaters}
              onSelectMovie={(m) => setSelectedMovieForDetails(m)}
              onBookTickets={(m) => setSelectedMovieForBooking(m)}
            />
          </div>
        ) : (
          /* Interactive Project Documentation & Architecture Center */
          <DocumentationHub />
        )}
      </main>

      {/* Modals */}
      {selectedMovieForDetails && (
        <MovieDetailModal
          movie={selectedMovieForDetails}
          onClose={() => setSelectedMovieForDetails(null)}
          onBookTickets={(m) => {
            setSelectedMovieForDetails(null);
            setSelectedMovieForBooking(m);
          }}
        />
      )}

      {selectedMovieForBooking && (
        <BookingModal
          movie={selectedMovieForBooking}
          theaters={theaters}
          currentUser={currentUser}
          onClose={() => setSelectedMovieForBooking(null)}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {isMyBookingsOpen && (
        <MyBookingsModal
          onClose={() => setIsMyBookingsOpen(false)}
          onRefresh={refreshBookings}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          onLogout={() => {
            apiService.logoutUser();
            setCurrentUser(null);
          }}
        />
      )}

      {/* Footer */}
      <Footer
        onOpenDocs={() => setActiveView('docs')}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />
    </div>
  );
}
