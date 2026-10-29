'use client';

import React, { useState } from 'react';
import { Mail, Check, Bell } from 'lucide-react';

export function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 2000);
    }
  };

  return (
    <section className="relative overflow-hidden py-16 bg-[#161311] text-[#FAF8F5] border-t border-[#2D2622]">
      {/* Background radial gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D4A359]/6 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#211E1C] border border-[#D4A359]/30 text-[#D4A359] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Bell className="w-3.5 h-3.5 text-[#F85606]" />
            <span>Alertas de Stock & Novedades Técnicas</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight uppercase">
            Sé el primero en enterarte de la llegada de repuestos
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-[#A89F91] max-w-xl mx-auto leading-relaxed">
            Avisos cuando desembarquen lotes de hélices APC, varillaje Dubro, conectores y baterías LiPo para aeromodelistas en Bolivia.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="Ingresa tu correo electrónico..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#211E1C] text-[#FAF8F5] placeholder-[#8C827A] rounded-full border border-[#3D352E] focus:border-[#D4A359] outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 text-[#161311]" />
                  <span>¡Suscrito!</span>
                </>
              ) : (
                <span>Suscribirme</span>
              )}
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
