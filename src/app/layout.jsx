import './globals.css';
import { Inter, Abyssinica_SIL } from 'next/font/google';
import { PortfolioProvider } from '@/context/PortfolioContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const abyssinica = Abyssinica_SIL({ subsets: ['ethiopic'], weight: '400', variable: '--font-abyssinica', display: 'swap' });

export const metadata = {
  title: 'Teketay Addis Kebede | IT Professional & Systems Analyst',
  description:
    'IT Professional, Systems Analyst and Infrastructure Specialist with 6+ years of experience supporting national border and migration systems in Ethiopia.',
};

const themeScript = `(function(){try{var t=localStorage.getItem('tk-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark');var l=localStorage.getItem('tk-lang');if(l==='am'||l==='en')document.documentElement.lang=l}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${abyssinica.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <PortfolioProvider>{children}</PortfolioProvider>
      </body>
    </html>
  );
}
