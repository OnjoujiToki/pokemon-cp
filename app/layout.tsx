// app/layout.tsx
import './globals.css';
import Navbar from '../components/Navbar';

import { Toaster } from 'sonner';
import type {Metadata} from 'next';


export const metadata: Metadata = {
  title: {
    default: 'Pokémon CP Platform',
    template: '%s | Pokémon CP Platform'
  },
  description: 'Learn competitive programming while catching Pokémon',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
