/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Popcorn,
  Utensils,
  Sparkles,
  CupSoda,
  Cookie,
  CreditCard,
  QrCode,
  Printer,
  ShieldCheck,
  AlertCircle,
  Armchair,
  Accessibility,
} from 'lucide-react';
import { Movie, Theater, Showtime, ConcessionItem, Booking, User, SeatTier } from '../types';
import { CONCESSIONS } from '../data/mockData';
import { apiService } from '../services/apiService';

interface BookingModalProps {
  movie: Movie;
  theaters: Theater[];
  currentUser: User | null;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  movie,
  theaters,
  currentUser,
  onClose,
  onBookingComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Theater, Date, Showtime
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>(theaters[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  // Step 2: Seats
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatError, setSeatError] = useState<string>('');

  // Step 3: Concessions
  const [concessionQuantities, setConcessionQuantities] = useState<Record<string, number>>({});

  // Step 4: Patron Info & Payment
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Step 5: Confirmed Booking
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Date choices (Today + next 4 days)
  const availableDates = [
    { label: 'Today', date: '2026-11-02', dayOfWeek: 'Mon' },
    { label: 'Tomorrow', date: '2026-11-03', dayOfWeek: 'Tue' },
    { label: 'Nov 04', date: '2026-11-04', dayOfWeek: 'Wed' },
    { label: 'Nov 05', date: '2026-11-05', dayOfWeek: 'Thu' },
    { label: 'Nov 06', date: '2026-11-06', dayOfWeek: 'Fri' },
  ];

  const currentTheater = useMemo(() => {
    return theaters.find((t) => t.id === selectedTheaterId) || theaters[0];
  }, [theaters, selectedTheaterId]);

  // Showtimes for the selected movie and theater
  const filteredShowtimes = useMemo(() => {
    const list = apiService.getShowtimes(movie.id);
    return list.filter((st) => st.theaterId === selectedTheaterId && st.date === selectedDate);
  }, [movie.id, selectedTheaterId, selectedDate]);

  // Auto-select first showtime if not chosen
  useEffect(() => {
    if (filteredShowtimes.length > 0 && !selectedShowtimeId) {
      setSelectedShowtimeId(filteredShowtimes[0].id);
    } else if (filteredShowtimes.length > 0 && !filteredShowtimes.some((s) => s.id === selectedShowtimeId)) {
      setSelectedShowtimeId(filteredShowtimes[0].id);
    }
  }, [filteredShowtimes, selectedShowtimeId]);

  const currentShowtime = useMemo(() => {
    return apiService.getShowtimeById(selectedShowtimeId) || filteredShowtimes[0];
  }, [selectedShowtimeId, filteredShowtimes]);

  // Seat map
  const seatMap = useMemo(() => apiService.getSeatsMap(), []);

  // Handle seat click
  const toggleSeat = (seatId: string) => {
    setSeatError('');
    if (!currentShowtime) return;

    if (currentShowtime.occupiedSeats.includes(seatId)) {
      setSeatError(`Seat ${seatId} is already occupied by another cinema patron.`);
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        setSeatError('Maximum 8 seats per booking allowed.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Concession quantity updates
  const updateConcession = (itemId: string, delta: number) => {
    setConcessionQuantities((prev) => {
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [itemId]: updated };
    });
  };

  // Calculations
  const seatTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seatMap.find((s) => s.id === seatId);
      return sum + (seat?.price || currentShowtime?.basePrice || 14.50);
    }, 0);
  }, [selectedSeats, seatMap, currentShowtime]);

  const concessionsTotal = useMemo(() => {
    return Object.entries(concessionQuantities).reduce((sum, [itemId, qty]) => {
      const item = CONCESSIONS.find((c) => c.id === itemId);
      return sum + (item?.price || 0) * qty;
    }, 0);
  }, [concessionQuantities]);

  const convenienceFee = selectedSeats.length * 1.75;
  const subtotal = seatTotal + concessionsTotal;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const discount = currentUser?.isMember ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const grandTotal = Math.max(0, Math.round((subtotal + tax + convenienceFee - discount) * 100) / 100);

  // Finalize reservation
  const handleFinalizeBooking = () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setSeatError('Please provide your name and email address for ticket issuance.');
      return;
    }

    setIsProcessing(true);
    setSeatError('');

    setTimeout(() => {
      const activeConcessions: { item: ConcessionItem; quantity: number }[] = [];
      Object.entries(concessionQuantities).forEach(([itemId, qty]) => {
        if (qty > 0) {
          const item = CONCESSIONS.find((c) => c.id === itemId);
          if (item) activeConcessions.push({ item, quantity: qty });
        }
      });

      const res = apiService.createBooking({
        showtimeId: currentShowtime.id,
        movie,
        theater: currentTheater,
        showtime: currentShowtime,
        seats: selectedSeats,
        concessions: activeConcessions,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '+1 (555) 012-3456',
      });

      setIsProcessing(false);

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setStep(5);
        onBookingComplete(res.booking);

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#38bdf8', '#10b981', '#ffffff'],
        });
      } else {
        setSeatError(res.error || 'Failed to complete reservation. Please try again.');
      }
    }, 700);
  };

  const getConcessionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Popcorn':
        return <Popcorn className="w-5 h-5 text-amber-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'CupSoda':
        return <CupSoda className="w-5 h-5 text-sky-400" />;
      case 'Cookie':
        return <Cookie className="w-5 h-5 text-amber-500" />;
      default:
        return <Popcorn className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              IMV
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white truncate max-w-xs sm:max-w-md">
                {movie.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{movie.certificate}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.durationMinutes} min</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-mono">{currentShowtime?.format || 'IMAX 3D'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Breadcrumbs */}
        {step < 5 && (
          <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`font-mono font-medium ${step === 1 ? 'text-amber-400' : 'text-slate-400'}`}>
                1. Showtime
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className={`font-mono font-medium ${step === 2 ? 'text-amber-400' : 'text-slate-400'}`}>
                2. Seat Matrix
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className={`font-mono font-medium ${step === 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                3. Concessions
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className={`font-mono font-medium ${step === 4 ? 'text-amber-400' : 'text-slate-400'}`}>
                4. Checkout
              </span>
            </div>

            {selectedSeats.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-mono">
                <span>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} ({selectedSeats.join(', ')})</span>
                <span className="text-amber-400 font-semibold">${seatTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {seatError && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{seatError}</span>
            </div>
          )}

          {/* STEP 1: THEATER, DATE & SHOWTIME */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Multiplex Location Selector */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
                  Select Multiplex Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {theaters.map((theater) => (
                    <button
                      key={theater.id}
                      onClick={() => setSelectedTheaterId(theater.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedTheaterId === theater.id
                          ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-white text-xs sm:text-sm">
                        {theater.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{theater.location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
                  Select Screening Date
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {availableDates.map((item) => (
                    <button
                      key={item.date}
                      onClick={() => setSelectedDate(item.date)}
                      className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-xl border text-xs transition-all ${
                        selectedDate === item.date
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-mono">{item.dayOfWeek}</span>
                      <span className="text-sm font-semibold mt-0.5">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Showtimes Available */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
                  Available Showtime Slots & Availability
                </label>
                {filteredShowtimes.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-950/50">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">No screenings available for this date at this location.</p>
                    <p className="text-xs text-slate-500 mt-1">Please choose another multiplex or date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredShowtimes.map((st) => {
                      const avail = 72 - st.occupiedSeats.length;
                      const isSelected = selectedShowtimeId === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setSelectedShowtimeId(st.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-white text-base">
                              {st.time}
                            </span>
                            <span className="font-mono text-xs text-amber-400 font-semibold">
                              ${st.basePrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 mt-1">
                            {st.format}
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{st.screenName.split(' ')[0]}</span>
                            <span className={`font-mono ${avail < 10 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}`}>
                              {avail} seats left
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: REAL-TIME SEAT MATRIX */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Screen Curved Graphic with Laser Illumination */}
              <div className="relative text-center pt-2 pb-6">
                <div className="w-4/5 mx-auto h-2 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full shadow-lg shadow-sky-400/40 mb-1" />
                <div className="cinema-screen-glow h-6 w-3/4 mx-auto -mt-2 opacity-50" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
                  ALL EYES TOWARDS THE CURVED LASER SCREEN
                </span>
              </div>

              {/* Seating Grid */}
              <div className="max-w-2xl mx-auto overflow-x-auto pb-4">
                <div className="min-w-[480px] space-y-2.5">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((rowLetter, rIdx) => {
                    const rowSeats = seatMap.filter((s) => s.row === rowLetter);
                    const tierName = rowSeats[0]?.tier || 'Standard';

                    return (
                      <div key={rowLetter} className="flex items-center gap-2 justify-center">
                        <span className="w-5 text-xs font-mono font-bold text-slate-500 text-center">
                          {rowLetter}
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {rowSeats.map((seat, cIdx) => {
                            const isOccupied = currentShowtime.occupiedSeats.includes(seat.id);
                            const isSelected = selectedSeats.includes(seat.id);

                            let seatBg = 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400 hover:bg-slate-700';

                            if (isOccupied) {
                              seatBg = 'bg-slate-950/70 border-slate-800/80 text-slate-700 cursor-not-allowed';
                            } else if (isSelected) {
                              seatBg = 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-500/30 scale-105';
                            } else if (seat.tier === 'VIP Recliner') {
                              seatBg = 'bg-slate-900 border-amber-500/40 text-amber-200 hover:bg-slate-800';
                            } else if (seat.tier === 'Premium') {
                              seatBg = 'bg-slate-900 border-sky-500/40 text-sky-200 hover:bg-slate-800';
                            }

                            return (
                              <React.Fragment key={seat.id}>
                                {/* Aisle gap after col 3 and col 6 */}
                                {(cIdx === 3 || cIdx === 6) && (
                                  <div className="w-3 sm:w-4" />
                                )}

                                <button
                                  type="button"
                                  disabled={isOccupied}
                                  onClick={() => toggleSeat(seat.id)}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg rounded-b-xs border text-[11px] font-mono flex items-center justify-center transition-all ${seatBg}`}
                                  title={`${seat.id} - ${seat.tier} ($${seat.price.toFixed(2)}) ${
                                    isOccupied ? '(Occupied)' : ''
                                  }`}
                                >
                                  {isOccupied ? (
                                    <X className="w-3 h-3 text-slate-700" />
                                  ) : isSelected ? (
                                    <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                                  ) : seat.isWheelchair ? (
                                    <Accessibility className="w-3 h-3 text-sky-400" />
                                  ) : (
                                    seat.col
                                  )}
                                </button>
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <span className="w-5 text-xs font-mono font-bold text-slate-500 text-center">
                          {rowLetter}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend & Tier Pricing */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-t bg-slate-800 border border-slate-700" />
                    <span className="text-slate-400">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-t bg-amber-400 border border-amber-300" />
                    <span className="text-white font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-t bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700">
                      <X className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-slate-500">Reserved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Accessibility className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-slate-400">Wheelchair</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>VIP: $22.00</span>
                  <span>·</span>
                  <span>Premium: $18.50</span>
                  <span>·</span>
                  <span>Standard: $14.00</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONCESSIONS & GOURMET BITES */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Cinema Concessions & Gourmet Bites
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-order freshly prepared snacks to bypass concession counter lines upon arrival.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONCESSIONS.map((item) => {
                  const qty = concessionQuantities[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {getConcessionIcon(item.iconName)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs sm:text-sm">
                            {item.name}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="text-xs font-mono font-bold text-amber-400 mt-2">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateConcession(item.id, -1)}
                          disabled={qty === 0}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono text-xs font-semibold text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateConcession(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: CHECKOUT & PAYMENT SIMULATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Patron Info Form */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-base font-display font-bold text-white">
                    Patron Admission Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Email Address (for E-Ticket QR delivery)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="sarah@imovies.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mobile Phone (SMS Gate Notifications)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Payment Method Preview */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>Instant Checkout Verification</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400">Sandbox Verified</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Payment processing is fully authorized via Express REST engine. No real credit card charge occurs in this sandbox demonstration.
                    </p>
                  </div>
                </div>

                {/* Right: Itemized Fare Summary */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
                    Booking Fare Breakdown
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Seats ({selectedSeats.length} × Tier Avg)</span>
                      <span className="font-mono tabular-nums text-white">${seatTotal.toFixed(2)}</span>
                    </div>

                    {concessionsTotal > 0 && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Concessions & Snacks</span>
                        <span className="font-mono tabular-nums text-white">${concessionsTotal.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Convenience & Booking Fee</span>
                      <span className="font-mono tabular-nums">${convenienceFee.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>State Entertainment Tax (8%)</span>
                      <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Member Loyalty Discount (10%)</span>
                        <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="font-display font-bold text-sm text-white">Total Charge</span>
                    <span className="font-display font-extrabold text-xl text-amber-400 font-mono">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1">
                    Screening at <span className="text-slate-300">{currentTheater.name}</span> on <span className="text-slate-300">{selectedDate}</span> at <span className="text-amber-400">{currentShowtime?.time}</span>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: INSTANT E-TICKET PASSBOOK */}
          {step === 5 && confirmedBooking && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Reservation Confirmed & Cryptographically Signed</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white">
                  Your Cinema E-Ticket is Ready!
                </h3>
                <p className="text-xs text-slate-400">
                  Present this digital QR code at the turnstile or box office kiosk.
                </p>
              </div>

              {/* Theatrical Ticket Design */}
              <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Perforation notched circles on sides */}
                <div className="absolute top-[68%] -left-3 w-6 h-6 rounded-full bg-slate-900 border border-slate-800" />
                <div className="absolute top-[68%] -right-3 w-6 h-6 rounded-full bg-slate-900 border border-slate-800" />

                {/* Ticket Header Banner */}
                <div className="p-5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-amber-400" />
                    <span className="font-display font-bold text-white text-base tracking-tight">
                      IMovies Cinema Pass
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {confirmedBooking.bookingRef}
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500">Film Screening</span>
                    <h4 className="text-lg font-display font-bold text-white leading-tight">
                      {confirmedBooking.movieTitle}
                    </h4>
                    <span className="text-xs font-mono text-amber-400">{confirmedBooking.format}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-900">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500">Date</span>
                      <div className="font-medium text-white">{confirmedBooking.showDate}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500">Time</span>
                      <div className="font-medium text-amber-400 font-mono">{confirmedBooking.showTime}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500">Cinema & Screen</span>
                      <div className="font-medium text-white truncate">{confirmedBooking.theaterName}</div>
                      <div className="text-[11px] text-slate-400">{confirmedBooking.screenName}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500">Reserved Seats</span>
                      <div className="font-bold text-white font-mono text-sm text-amber-400">
                        {confirmedBooking.seats.join(', ')}
                      </div>
                    </div>
                  </div>

                  {confirmedBooking.concessions.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 text-xs">
                      <span className="text-[10px] uppercase font-mono text-slate-500">Concessions</span>
                      <div className="text-slate-300 text-[11px] mt-0.5">
                        {confirmedBooking.concessions.map((c) => `${c.quantity}x ${c.item.name}`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Perforated Divider */}
                <div className="border-t border-dashed border-slate-800 mx-4" />

                {/* QR Code & Barcode Pass Stub */}
                <div className="p-6 bg-slate-950/60 flex flex-col items-center text-center space-y-3">
                  {/* High contrast SVG QR token */}
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      {/* Stylized QR Matrix Pattern */}
                      <rect width="100" height="100" fill="white" />
                      {/* Corner positioning boxes */}
                      <rect x="10" y="10" width="22" height="22" fill="black" />
                      <rect x="14" y="14" width="14" height="14" fill="white" />
                      <rect x="18" y="18" width="6" height="6" fill="black" />

                      <rect x="68" y="10" width="22" height="22" fill="black" />
                      <rect x="72" y="14" width="14" height="14" fill="white" />
                      <rect x="76" y="18" width="6" height="6" fill="black" />

                      <rect x="10" y="68" width="22" height="22" fill="black" />
                      <rect x="14" y="72" width="14" height="14" fill="white" />
                      <rect x="18" y="76" width="6" height="6" fill="black" />

                      {/* Random scannable pattern squares */}
                      <rect x="40" y="15" width="6" height="6" fill="black" />
                      <rect x="52" y="15" width="6" height="6" fill="black" />
                      <rect x="46" y="25" width="6" height="6" fill="black" />
                      <rect x="15" y="42" width="6" height="6" fill="black" />
                      <rect x="25" y="48" width="6" height="6" fill="black" />
                      <rect x="40" y="40" width="20" height="20" fill="black" />
                      <rect x="45" y="45" width="10" height="10" fill="white" />
                      <rect x="48" y="48" width="4" height="4" fill="black" />
                      <rect x="68" y="45" width="8" height="6" fill="black" />
                      <rect x="80" y="55" width="6" height="8" fill="black" />
                      <rect x="40" y="68" width="8" height="6" fill="black" />
                      <rect x="55" y="75" width="6" height="10" fill="black" />
                      <rect x="70" y="72" width="16" height="6" fill="black" />
                      <rect x="76" y="82" width="8" height="8" fill="black" />
                    </svg>
                  </div>

                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-semibold text-slate-300 tracking-wider">
                      {confirmedBooking.qrCodeToken}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Scan at Entrance Turnstile · Admittance for {confirmedBooking.seats.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Ticket Pass</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Return to Movie Lineup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        {step < 5 && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setSeatError('');
                  setStep((prev) => (prev - 1) as any);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step === 1 && (
                <button
                  type="button"
                  disabled={!selectedShowtimeId}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Select Seats</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Continue to Concessions ({selectedSeats.length} Selected)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Proceed to Checkout (${grandTotal.toFixed(2)})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleFinalizeBooking}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Locking Seats & Signing Pass...</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>Pay & Generate QR Ticket (${grandTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
