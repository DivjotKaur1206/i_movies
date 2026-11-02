/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, Movie, Showtime, Theater, User, SeatTier, ConcessionItem } from '../types';
import { MOVIES, THEATERS, INITIAL_SHOWTIMES, GENERATE_SEAT_MAP, EPICS } from '../data/mockData';

const STORAGE_KEYS = {
  SHOWTIMES: 'imovies_showtimes_v1',
  BOOKINGS: 'imovies_bookings_v1',
  USER: 'imovies_user_v1',
  TASKS: 'imovies_task_statuses_v1',
  MENTOR: 'imovies_mentor_v1',
};

// Simple JWT generation helper for demo inspection
export function generateMockJwt(user: { id: string; email: string; name: string }) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: 'patron',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    })
  );
  const signature = 's8F92jK_qL09XwM83bVnRt1';
  return `${header}.${payload}.${signature}`;
}

export function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    return { header, payload, rawSignature: parts[2] };
  } catch (e) {
    return null;
  }
}

class ApiService {
  private showtimes: Showtime[];
  private bookings: Booking[];
  private currentUser: User | null;
  private mentor: { name: string; title: string; email: string; assignedAt: string } | null;

  constructor() {
    this.showtimes = this.loadShowtimes();
    this.bookings = this.loadBookings();
    this.currentUser = this.loadUser();
    this.mentor = this.loadMentor();
  }

  private loadShowtimes(): Showtime[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOWTIMES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return [...INITIAL_SHOWTIMES];
  }

  private saveShowtimes() {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOWTIMES, JSON.stringify(this.showtimes));
    } catch (e) {}
  }

  private loadBookings(): Booking[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Seed initial demo booking so user immediately sees their ticket
    return [
      {
        id: 'bk-demo-1',
        bookingRef: 'IMV-7842-A',
        movieId: 'mov-cyber-2099',
        movieTitle: 'Cyber Odyssey 2099',
        moviePoster: '/src/assets/images/poster_cyber_odyssey_1793607823601.jpg',
        theaterName: 'IMovies Grand Multiplex',
        screenName: 'Auditorium 1 (IMAX Laser)',
        format: 'IMAX 3D',
        showDate: '2026-11-02',
        showTime: '06:30 PM',
        seats: ['A5', 'A6'],
        seatDetails: [
          { id: 'A5', tier: 'VIP Recliner', price: 22.00 },
          { id: 'A6', tier: 'VIP Recliner', price: 22.00 },
        ],
        concessions: [
          {
            item: {
              id: 'c-combo-duo',
              name: 'Artisan Duo Combo',
              description: '1 Large Gourmet Popcorn + 2 Cold Craft Sodas',
              price: 15.50,
              category: 'Combos',
              iconName: 'Popcorn',
            },
            quantity: 1,
          },
        ],
        subtotal: 59.50,
        tax: 4.76,
        convenienceFee: 3.50,
        discount: 0,
        totalAmount: 67.76,
        customerName: 'Guest Patron',
        customerEmail: 'patron@imovies.com',
        customerPhone: '+1 (555) 019-2834',
        bookingTimestamp: '2026-11-02T00:15:00.000Z',
        qrCodeToken: 'IMV-PASS-7842-CYBER-A5A6',
        status: 'Confirmed',
      },
    ];
  }

  private saveBookings() {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
    } catch (e) {}
  }

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  private saveUser(user: User | null) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {}
  }

  private loadMentor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MENTOR);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null; // "No mentor assigned yet" per prompt
  }

  public getMentor() {
    return this.mentor;
  }

  public assignMentor(name: string, title: string, email: string) {
    this.mentor = {
      name,
      title,
      email,
      assignedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.MENTOR, JSON.stringify(this.mentor));
    } catch (e) {}
    return this.mentor;
  }

  public removeMentor() {
    this.mentor = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.MENTOR);
    } catch (e) {}
  }

  public getMovies(): Movie[] {
    return MOVIES;
  }

  public getMovieById(id: string): Movie | undefined {
    return MOVIES.find((m) => m.id === id);
  }

  public getTheaters(): Theater[] {
    return THEATERS;
  }

  public getShowtimes(movieId?: string): Showtime[] {
    if (movieId) {
      return this.showtimes.filter((s) => s.movieId === movieId);
    }
    return this.showtimes;
  }

  public getShowtimeById(showtimeId: string): Showtime | undefined {
    return this.showtimes.find((s) => s.id === showtimeId);
  }

  public getSeatsMap(): ReturnType<typeof GENERATE_SEAT_MAP> {
    return GENERATE_SEAT_MAP();
  }

  public getAvailableSeatCounts(showtimeId: string): { total: number; occupied: number; available: number } {
    const showtime = this.getShowtimeById(showtimeId);
    const total = 72;
    const occupied = showtime ? showtime.occupiedSeats.length : 0;
    return {
      total,
      occupied,
      available: total - occupied,
    };
  }

  public createBooking(params: {
    showtimeId: string;
    movie: Movie;
    theater: Theater;
    showtime: Showtime;
    seats: string[];
    concessions: { item: ConcessionItem; quantity: number }[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const stIndex = this.showtimes.findIndex((s) => s.id === params.showtimeId);
    if (stIndex === -1) {
      return { success: false, error: 'Showtime not found' };
    }

    const currentShowtime = this.showtimes[stIndex];
    // Check for seat conflicts
    const conflict = params.seats.some((seat) => currentShowtime.occupiedSeats.includes(seat));
    if (conflict) {
      return {
        success: false,
        error: 'One or more selected seats were just reserved by another patron. Please select alternative seats.',
      };
    }

    // Calculate seat details & prices
    const seatMap = GENERATE_SEAT_MAP();
    const seatDetails = params.seats.map((seatId) => {
      const match = seatMap.find((s) => s.id === seatId);
      const tier: SeatTier = match?.tier || 'Standard';
      const price = match?.price || currentShowtime.basePrice;
      return { id: seatId, tier, price };
    });

    const seatsSubtotal = seatDetails.reduce((sum, s) => sum + s.price, 0);
    const concessionsSubtotal = params.concessions.reduce(
      (sum, c) => sum + c.item.price * c.quantity,
      0
    );
    const subtotal = seatsSubtotal + concessionsSubtotal;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const convenienceFee = params.seats.length * 1.75;
    const discount = this.currentUser?.isMember ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const totalAmount = Math.max(0, Math.round((subtotal + tax + convenienceFee - discount) * 100) / 100);

    // Random booking reference
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingRef = `IMV-${randomHex}-${params.seats[0] || 'X'}`;
    const qrCodeToken = `IMV-VALID-${bookingRef}-${Date.now()}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingRef,
      movieId: params.movie.id,
      movieTitle: params.movie.title,
      moviePoster: params.movie.posterUrl,
      theaterName: params.showtime.theaterName,
      screenName: params.showtime.screenName,
      format: params.showtime.format,
      showDate: params.showtime.date,
      showTime: params.showtime.time,
      seats: params.seats,
      seatDetails,
      concessions: params.concessions,
      subtotal,
      tax,
      convenienceFee,
      discount,
      totalAmount,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      bookingTimestamp: new Date().toISOString(),
      qrCodeToken,
      status: 'Confirmed',
    };

    // Update showtime occupied seats atomically
    this.showtimes[stIndex] = {
      ...currentShowtime,
      occupiedSeats: [...currentShowtime.occupiedSeats, ...params.seats],
    };
    this.saveShowtimes();

    // Add to bookings
    this.bookings.unshift(newBooking);
    this.saveBookings();

    return { success: true, booking: newBooking };
  }

  public cancelBooking(bookingId: string): { success: boolean; releasedSeats: string[]; error?: string } {
    const bookingIndex = this.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return { success: false, releasedSeats: [], error: 'Booking not found' };
    }

    const booking = this.bookings[bookingIndex];
    if (booking.status === 'Cancelled') {
      return { success: false, releasedSeats: [], error: 'Booking is already cancelled' };
    }

    // Release seats in showtime
    const stIndex = this.showtimes.findIndex(
      (s) => s.movieId === booking.movieId && s.date === booking.showDate && s.time === booking.showTime
    );

    if (stIndex !== -1) {
      const showtime = this.showtimes[stIndex];
      this.showtimes[stIndex] = {
        ...showtime,
        occupiedSeats: showtime.occupiedSeats.filter((seat) => !booking.seats.includes(seat)),
      };
      this.saveShowtimes();
    }

    // Update booking status
    this.bookings[bookingIndex] = {
      ...booking,
      status: 'Cancelled',
    };
    this.saveBookings();

    return { success: true, releasedSeats: booking.seats };
  }

  public getBookings(): Booking[] {
    return this.bookings;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public loginUser(email: string, name = 'Patron'): User {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      phone: '+1 (555) 234-5678',
      loyaltyPoints: 250,
      isMember: true,
    };
    user.jwtToken = generateMockJwt(user);
    this.saveUser(user);
    return user;
  }

  public logoutUser() {
    this.saveUser(null);
  }

  // REST API Tester execution for the interactive documentation playground
  public async executeApiTest(endpoint: string, method: string, payload?: any): Promise<any> {
    // Simulate slight network latency
    await new Promise((r) => setTimeout(r, 220));

    if (endpoint === '/api/v1/health') {
      return {
        status: 200,
        data: {
          status: 'healthy',
          runtime: 'Node.js v20.12.0',
          framework: 'Express.js v4.21.2',
          database: 'MongoDB Atlas (Replica Set)',
          activeConnections: 14,
          timestamp: new Date().toISOString(),
        },
      };
    }

    if (endpoint === '/api/v1/movies') {
      return {
        status: 200,
        data: {
          success: true,
          count: MOVIES.length,
          data: MOVIES.map((m) => ({
            id: m.id,
            title: m.title,
            rating: m.rating,
            genres: m.genres,
            formats: m.formats,
            durationMinutes: m.durationMinutes,
            nowShowing: m.nowShowing,
          })),
        },
      };
    }

    if (endpoint.startsWith('/api/v1/seats/')) {
      const showtimeId = endpoint.replace('/api/v1/seats/', '');
      const st = this.showtimes.find((s) => s.id === showtimeId) || this.showtimes[0];
      return {
        status: 200,
        data: {
          showtimeId: st.id,
          movieTitle: MOVIES.find((m) => m.id === st.movieId)?.title,
          totalSeats: 72,
          occupiedSeats: st.occupiedSeats,
          occupiedCount: st.occupiedSeats.length,
          availableCount: 72 - st.occupiedSeats.length,
        },
      };
    }

    if (endpoint === '/api/v1/auth/login') {
      const email = payload?.email || 'sarah.connor@imovies.com';
      const user = {
        id: 'usr-98124',
        name: email.split('@')[0],
        email,
        role: 'patron',
        loyaltyPoints: 340,
        isMember: true,
      };
      return {
        status: 200,
        data: {
          token: generateMockJwt(user),
          user,
        },
      };
    }

    if (endpoint === '/api/v1/bookings/user') {
      return {
        status: 200,
        data: {
          success: true,
          count: this.bookings.length,
          bookings: this.bookings,
        },
      };
    }

    if (endpoint === '/api/v1/bookings/reserve') {
      return {
        status: 201,
        data: {
          success: true,
          bookingRef: `IMV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-B2`,
          status: 'Confirmed',
          qrCodeToken: 'IMV-QR-SIMULATED-PAYLOAD',
          totalAmount: 48.60,
          reservationTimestamp: new Date().toISOString(),
        },
      };
    }

    if (endpoint.startsWith('/api/v1/bookings/') && method === 'DELETE') {
      return {
        status: 200,
        data: {
          success: true,
          message: 'Booking successfully cancelled and seats released back to inventory.',
        },
      };
    }

    return {
      status: 200,
      data: { message: 'Route acknowledged', endpoint, method, timestamp: new Date().toISOString() },
    };
  }
}

export const apiService = new ApiService();
