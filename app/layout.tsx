// app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import 'katex/dist/katex.min.css'; // Keep for markdown LaTeX
import { Metadata, Viewport } from "next";
import { Syne } from 'next/font/google';
import { Toaster } from "sonner"; // Keep for notifications
import "./globals.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "A4F Playground",
  description: "A4F Playground is a minimalistic client with a good feature set.",
  metadataBase: new URL("https://playground.a4f.co"),
  openGraph: {
    type: "website",
    url: "https://playground.a4f.co",
    title: "A4F Playground",
    description: "A4F Playground is a minimalistic client with a good feature set.",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/628434de-a19f-4410-8607-40498378b4da.jpg?token=0TLdkOsd_8P3Fc-ORR_PUpkuALYbnA2n3NbL2kHuXSI&height=631&width=1200&expires=33284061187",
        width: 1200,
        height: 631,
        alt: "A4F Playground Preview"
      },
    ],
    siteName: "A4F Playground",
  },
  twitter: {
    card: "summary_large_image",
    title: "A4F Playground",
    description: "A4F Playground is a minimalistic client with a good feature set.",
    images: [
      "https://opengraph.b-cdn.net/production/images/628434de-a19f-4410-8607-40498378b4da.jpg?token=0TLdkOsd_8P3Fc-ORR_PUpkuALYbnA2n3NbL2kHuXSI&height=631&width=1200&expires=33284061187"
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' }
  ],
}

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
   preload: true,
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${syne.variable} font-sans antialiased`} suppressHydrationWarning>
          <Providers>
            <Toaster position="top-center" />
            {children}
          </Providers>
      </body>
    </html>
  );
}