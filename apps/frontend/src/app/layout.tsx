import type { Metadata } from 'next';
import { Montserrat, Open_Sans, Cabin } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

const cabin = Cabin({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-cabin',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gestor Multiprojetos | HW1',
  description: 'Sistema de Gestão de Multiprojetos — HW1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${openSans.variable} ${cabin.variable}`}
    >
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
