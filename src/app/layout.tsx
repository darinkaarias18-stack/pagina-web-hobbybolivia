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
  verification: {
    google: ['google82f8a7888f69d48f', 'HJPhoxp9YR0dtRGa3awwgtZ3DHGjs_vkSG-dV0j1PEM'],
  },
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
    <html lang="es" className={`${manrope.variable} max-w-full overflow-x-hidden`}>
      <head>
        <meta name="google-site-verification" content="google82f8a7888f69d48f" />
        <meta name="google-site-verification" content="HJPhoxp9YR0dtRGa3awwgtZ3DHGjs_vkSG-dV0j1PEM" />
        <meta name="theme-color" content="#161311" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${manrope.className} antialiased min-h-screen flex flex-col bg-[#F5F2EB] text-[#1A1817] max-w-full overflow-x-hidden`}>
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
