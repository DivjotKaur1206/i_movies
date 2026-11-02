/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MovieFormat = 'IMAX 3D' | 'Dolby Cinema' | 'Laser 4K' | 'Standard Digital';

export type MovieGenre = 'Sci-Fi' | 'Action' | 'Thriller' | 'Crime' | 'Adventure' | 'Drama' | 'Mystery' | 'Animation';

export interface CastMember {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  rating: number; // e.g. 9.4
  votesCount: number;
  durationMinutes: number;
  certificate: 'PG-13' | 'R' | 'PG' | 'NC-17';
  releaseYear: number;
  genres: MovieGenre[];
  director: string;
  cast: CastMember[];
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  formats: MovieFormat[];
  featured?: boolean;
  nowShowing: boolean;
  comingSoon?: boolean;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  screens: {
    id: string;
    name: string;
    format: MovieFormat;
    totalSeats: number;
  }[];
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  theaterName: string;
  screenName: string;
  format: MovieFormat;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  basePrice: number;
  occupiedSeats: string[]; // e.g. ["A1", "A2", "D5"]
}

export type SeatTier = 'VIP Recliner' | 'Premium' | 'Executive' | 'Standard';

export interface Seat {
  id: string; // e.g. "A1"
  row: string;
  col: number;
  tier: SeatTier;
  price: number;
  isWheelchair?: boolean;
}

export interface ConcessionItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Combos' | 'Snacks' | 'Beverages';
  iconName: string;
}

export interface Booking {
  id: string;
  bookingRef: string; // e.g. "IMV-9481-B"
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theaterName: string;
  screenName: string;
  format: MovieFormat;
  showDate: string;
  showTime: string;
  seats: string[];
  seatDetails: { id: string; tier: SeatTier; price: number }[];
  concessions: { item: ConcessionItem; quantity: number }[];
  subtotal: number;
  tax: number;
  convenienceFee: number;
  discount: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingTimestamp: string;
  qrCodeToken: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  isMember: boolean;
  jwtToken?: string;
}

// Documentation types
export interface TaskItem {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  epicId: string;
  acceptanceCriteria: string[];
  techStack: string[];
  apiEndpoint?: string;
  status: 'Completed' | 'In Progress' | 'Planned';
}

export interface EpicItem {
  id: string;
  epicNumber: number;
  title: string;
  summary: string;
  objective: string;
  tasksCount: number;
  tasks: TaskItem[];
}

export interface ApiRouteDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  authRequired: boolean;
  sampleRequest?: Record<string, any>;
  sampleResponse: Record<string, any>;
  statusCodes: number[];
}

export interface MongoSchemaDoc {
  collectionName: string;
  description: string;
  fields: {
    field: string;
    type: string;
    required: boolean;
    description: string;
    indexed?: boolean;
    unique?: boolean;
  }[];
  sampleDocument: Record<string, any>;
}
