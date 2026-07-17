import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppProviders } from '@/providers/app-providers';
import { OfflineBanner } from '@/components/feedback/offline-banner';
import { APP_CONFIG } from '@/constants/app';
import '@/styles/globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: APP_CONFIG.NAME, template: `%s · ${APP_CONFIG.NAME}` },
  description: APP_CONFIG.DESCRIPTION,
};

/**
 * Root Layout — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout System —
 * Root Layout": "<html>/<body>, font loading, ThemeProvider,
 * QueryClientProvider, global toast host — no auth/permission logic."
 * Frontend Milestone 1 — no business UI is rendered by any page under
 * this layout yet.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <OfflineBanner />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
