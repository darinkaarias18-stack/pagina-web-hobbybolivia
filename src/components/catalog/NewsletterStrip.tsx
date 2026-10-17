'use client';

import React, { useState } from 'react';

export function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setEmail('');
    }
  };

  return (
    <section className="w-full bg-[#162544] text-white py-5 px-4 mt-12 border-t border-[#1d2b53]" aria-label="Boletín de novedades">
      <div className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Airplane Icon + Text */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-9 h-9 rounded-full bg-[#1d2b53] flex items-center justify-center flex-shrink-0 text-white">
            <svg className="w-5 h-5 -rotate-45 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              Reciba nuestras novedades
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-normal">
              ...y acceda a <strong className="text-white font-bold">ofertas especiales</strong>
            </span>
          </div>
        </div>

        {/* Right: Email Input + Suscribir Button */}
        <form onSubmit={handleSubmit} className="flex items-center w-full md:w-auto max-w-md gap-0">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su correo"
            className="w-full sm:w-72 h-10 px-4 text-xs sm:text-sm bg-white text-[#162544] placeholder-[#94a3b8] rounded-l-md outline-none border border-white"
          />
          <button
            type="submit"
            className="h-10 px-5 sm:px-6 bg-[#0f1b33] hover:bg-[#1a2e56] text-white text-xs sm:text-sm font-bold rounded-r-md transition-colors whitespace-nowrap border border-[#0f1b33]"
          >
            {submitted ? '¡Suscrito!' : 'Suscribir'}
          </button>
        </form>
      </div>
    </section>
  );
}
