import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/layout/query-provider';

export const metadata: Metadata = {
  title: 'Inzar Admin Dashboard',
  description: 'Control room for Inzar real-time incident reports',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="antialiased font-sans bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
