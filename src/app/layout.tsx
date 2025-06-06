
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// GeistMono import was removed, ensuring it stays removed.
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: 'Relax - 4-7-8 Breathing Exercise',
  description: 'Relax and unwind with a guided 4-7-8 breathing exercise. Improve focus and reduce stress.',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#008080' }, // Accent color for light mode
    { media: '(prefers-color-scheme: dark)', color: '#15B8B8' },  // Lighter accent for dark mode
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // Or 'black-translucent' or 'black'
    title: 'Relax',
    // startupImage: [ // Optional: add paths to splash screen images
    //   { url: '/splash/iphone5_splash.png', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
    // ],
  },
  formatDetection: {
    telephone: false,
  },
  // Icons can also be specified here, but direct links in <head> offer more control for specific types.
  // icons: {
  //   icon: '/icons/icon-32x32.png', // Default favicon
  //   shortcut: '/favicon.ico',
  //   apple: '/icons/apple-touch-icon.png',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Standard meta tags from metadata object are automatically injected by Next.js */}
        
        {/* Additional PWA-specific meta tags not fully covered by Next.js Metadata object */}
        <meta name="application-name" content="Relax" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#008080" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons - referencing files you'll need to create in /public/icons/ */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" data-ai-hint="app icon" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" data-ai-hint="app icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" data-ai-hint="app icon" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" data-ai-hint="app icon" />
        
        {/* Other specific icons (mask-icon for Safari pinned tabs, shortcut icon) */}
        {/* User needs to create safari-pinned-tab.svg in /public/icons/ */}
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#008080" data-ai-hint="app icon" /> 
        {/* User needs to provide /public/favicon.ico */}
        <link rel="shortcut icon" href="/favicon.ico" data-ai-hint="app icon" /> 
        {/* PNG Favicons for modern browsers */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" data-ai-hint="app icon" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" data-ai-hint="app icon" />
        
        {/* Fallback theme-color, though metadata.themeColor is preferred and more specific */}
        {/* <meta name="theme-color" content="#008080" /> */}
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Script id="service-worker-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
                  .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                  })
                  .catch(registrationError => {
                    console.log('Service Worker registration failed:', registrationError);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
