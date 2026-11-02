/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Ticket, Calendar, Clock, MapPin, AlertTriangle, CheckCircle, QrCode, Trash2 } from 'lucide-react';
import { Booking } from '../types';
import { apiService } from '../services/apiService';

interface MyBookingsModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  onClose,
  onRefresh,
}) => {
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null);
  const [cancelFeedback, setCancelFeedback] = useState<string>('');
  const bookings = apiService.getBookings();

  const handleCancelBooking = (booking: Booking) => {
    if (confirm(`Are you sure you want to cancel booking ${booking.bookingRef} for seats ${booking.seats.join(', ')}? The seats will be immediately released back to the box office.`)) {
      const res = apiService.cancelBooking(booking.id);
      if (res.success) {
        setCancelFeedback(`Booking ${booking.bookingRef} cancelled. Seats ${res.releasedSeats.join(', ')} have been released back to real-time inventory.`);
        onRefresh();
      } else {
        setCancelFeedback(res.error || 'Failed to cancel reservation');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-white">
              My Cinema Bookings & Passbook
            </h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {bookings.length} {bookings.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {cancelFeedback && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{cancelFeedback}</span>
            </div>
            <button
              onClick={() => setCancelFeedback('')}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-200">No active bookings found</p>
              <p className="text-xs text-slate-500 mt-1">
                Browse our movie catalog and reserve your first IMAX or Dolby seats!
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isCancelled = booking.status === 'Cancelled';
              return (
                <div
                  key={booking.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isCancelled
                      ? 'bg-slate-950/50 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {booking.bookingRef}
                        </span>
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            isCancelled
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {booking.format}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base text-white pt-1">
                        {booking.movieTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{booking.theaterName} ({booking.screenName})</span>
                        </div>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{booking.showDate}</span>
                        </div>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-white font-mono">{booking.showTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-mono text-slate-500">Reserved Seats</span>
                      <div className="font-mono font-bold text-lg text-amber-400">
                        {booking.seats.join(', ')}
                      </div>
                      <div className="font-mono text-xs text-slate-300 mt-0.5">
                        Total Paid: ${booking.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {booking.concessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-900 text-xs text-slate-400">
                      <span className="text-slate-500">Concessions:</span>{' '}
                      {booking.concessions.map((c) => `${c.quantity}x ${c.item.name}`).join(', ')}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedBookingForQr(booking)}
                      className="text-xs text-slate-300 hover:text-amber-400 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>View QR Digital Pass</span>
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Reservation</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* QR Inspector Overlay */}
        {selectedBookingForQr && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {selectedBookingForQr.bookingRef}
                </span>
                <button
                  onClick={() => setSelectedBookingForQr(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-display font-bold text-white text-base">
                  {selectedBookingForQr.movieTitle}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seats: {selectedBookingForQr.seats.join(', ')} · {selectedBookingForQr.showTime}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl inline-block shadow-lg">
                <svg className="w-44 h-44" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="22" height="22" fill="black" />
                  <rect x="14" y="14" width="14" height="14" fill="white" />
                  <rect x="18" y="18" width="6" height="6" fill="black" />

                  <rect x="68" y="10" width="22" height="22" fill="black" />
                  <rect x="72" y="14" width="14" height="14" fill="white" />
                  <rect x="76" y="18" width="6" height="6" fill="black" />

                  <rect x="10" y="68" width="22" height="22" fill="black" />
                  <rect x="14" y="72" width="14" height="14" fill="white" />
                  <rect x="18" y="76" width="6" height="6" fill="black" />

                  <rect x="40" y="20" width="8" height="8" fill="black" />
                  <rect x="52" y="30" width="8" height="8" fill="black" />
                  <rect x="40" y="45" width="20" height="20" fill="black" />
                  <rect x="45" y="50" width="10" height="10" fill="white" />
                  <rect x="70" y="50" width="10" height="10" fill="black" />
                  <rect x="40" y="75" width="12" height="12" fill="black" />
                </svg>
              </div>

              <div className="font-mono text-xs text-slate-400 break-all">
                Token: {selectedBookingForQr.qrCodeToken}
              </div>

              <button
                onClick={() => setSelectedBookingForQr(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
