import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { ClientModals } from '@/components/layout/ClientModals';

/* Optimized Font Self-Hosting (Zero render-blocking network requests) */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Hobby Bolivia · Aeromodelismo y radio control',
  description: 'Productos, hélices, servos, combustibles y todo lo que necesitas para armar, reparar y volar.',
  keywords: 'aeromodelismo bolivia, radio control, rc bolivia, hobby bolivia, dubro bolivia, great planes, conectores ez, bellcrank, productos rc santa cruz',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Hobby Bolivia · Aeromodelismo y radio control',
    description: 'Productos, hélices, servos, combustibles y todo lo que necesitas para armar, reparar y volar.',
    url: 'https://hobbybolivia.com',
    siteName: 'Hobby Bolivia',
    locale: 'es_BO',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={manrope.variable}>
      <head>
        <meta name="theme-color" content="#161311" />
      </head>
      <body className={`${manrope.className} antialiased min-h-screen flex flex-col bg-[#F5F2EB] text-[#1A1817]`}>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
              <ClientModals />
              <FloatingWhatsApp phone="+591 77293446" />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
