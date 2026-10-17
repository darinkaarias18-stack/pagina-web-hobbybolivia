import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { CartQuoteDrawer } from '@/components/catalog/CartQuoteDrawer';
import { ProductOptionsModal } from '@/components/catalog/ProductOptionsModal';
import { CustomArrangementModal } from '@/components/catalog/CustomArrangementModal';

export const metadata: Metadata = {
  title: 'Hobby Bolivia · Aeromodelismo y radio control',
  description: 'Repuestos, hélices, servos, combustibles y todo lo que necesitas para armar, reparar y volar.',
  keywords: 'aeromodelismo bolivia, radio control, rc bolivia, hobby bolivia, dubro bolivia, great planes, conectores ez, bellcrank, repuestos rc santa cruz',
  icons: {
    icon: 'https://hobbybolivia.com/icon.svg',
  },
  openGraph: {
    title: 'Hobby Bolivia · Aeromodelismo y radio control',
    description: 'Repuestos, hélices, servos, combustibles y todo lo que necesitas para armar, reparar y volar.',
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
    <html lang="es">
      <head>
        <meta name="theme-color" content="#162544" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-white text-[#1e293b]">
        <CartProvider>
          {children}
          <CartQuoteDrawer />
          <ProductOptionsModal />
          <CustomArrangementModal />
        </CartProvider>
      </body>
    </html>
  );
}
