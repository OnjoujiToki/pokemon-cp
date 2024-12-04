// app/layout.tsx
import './globals.css';
import Navbar from '../components/Navbar';

import { Toaster } from 'sonner';

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
