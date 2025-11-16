// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LomiGG News - League of Legends News Aggregator',
  description: 'Todas las últimas noticias de League of Legends agregadas en un solo lugar. Actualizaciones del juego, esports y más.',
  keywords: ['League of Legends', 'LoL', 'Esports', 'Gaming News', 'LomiGG', 'Renekton'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
