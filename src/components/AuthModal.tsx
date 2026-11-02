/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Key, Lock, Mail, User as UserIcon, Check } from 'lucide-react';
import { User } from '../types';
import { apiService, decodeJwt } from '../services/apiService';

interface AuthModalProps {
  currentUser: User | null;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('sarah.connor@imovies.com');
  const [name, setName] = useState('Sarah Connor');
  const [password, setPassword] = useState('CinemaPass2026!');
  const [showTokenDetails, setShowTokenDetails] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const loggedUser = apiService.loginUser(email, name);
    onLoginSuccess(loggedUser);
  };

  const decoded = currentUser?.jwtToken ? decodeJwt(currentUser.jwtToken) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-base text-white">
              {currentUser ? 'Patron JWT Session' : 'IMovies Authentication'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {currentUser ? (
            /* Logged In View + JWT Inspector */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{currentUser.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-400">
                      Active Session
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{currentUser.email}</div>
                  <div className="text-xs font-mono text-amber-400 mt-1">
                    Loyalty Points: {currentUser.loyaltyPoints} (10% Checkout Discount)
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-xs text-slate-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>

              {/* JWT Token Decoder */}
              {currentUser.jwtToken && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Decoded JSON Web Token (JWT)</span>
                    </span>
                    <button
                      onClick={() => setShowTokenDetails(!showTokenDetails)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {showTokenDetails ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {showTokenDetails && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-rose-400 block mb-1">// Header (Algorithm & Token Type)</span>
                        <pre className="text-slate-300 overflow-x-auto text-[11px]">
                          {JSON.stringify(decoded?.header, null, 2)}
                        </pre>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-purple-400 block mb-1">// Payload (Claims, User ID & Role)</span>
                        <pre className="text-slate-300 overflow-x-auto text-[11px]">
                          {JSON.stringify(decoded?.payload, null, 2)}
                        </pre>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-sky-400 block mb-1">// HMAC-SHA256 Signature</span>
                        <div className="text-slate-400 text-[11px] truncate">
                          {decoded?.rawSignature}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex border-b border-slate-800 pb-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className={`text-xs font-semibold pb-1.5 transition-colors ${
                    !isRegister
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className={`text-xs font-semibold pb-1.5 transition-colors ${
                    isRegister
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Sarah Connor"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sarah@imovies.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Signing in issues a stateless signed JWT token. Members receive an automatic 10% discount on cinema reservations and instant booking retrieval.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-slate-950" />
                <span>{isRegister ? 'Register & Generate JWT' : 'Sign In with JWT'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
