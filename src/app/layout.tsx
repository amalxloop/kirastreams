import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import Providers from "@/components/Providers";

// This will be dynamically generated based on settings
export const metadata: Metadata = {
  metadataBase: new URL('https://kirastreams.com'),
  title: {
    default: "KiraStreams - Free Online Movies & TV Shows Streaming | Ad-Free HD Streaming",
    template: "%s | KiraStreams - Free Streaming"
  },
  description: "Watch free online movies and TV shows on KiraStreams. Ad-free streaming website with unlimited HD content. Stream thousands of movies and series without subscription. Best free streaming platform for movies and TV shows.",
  keywords: [
    "free online movies",
    "free streaming website",
    "ad free streaming",
    "kirastreams",
    "kirastream",
    "watch movies online free",
    "free tv shows streaming",
    "no ads streaming",
    "free hd movies",
    "stream movies free",
    "watch series online",
    "free movie streaming site",
    "online streaming platform",
    "watch movies without subscription",
    "free entertainment streaming"
  ],
  authors: [{ name: "KiraStreams" }],
  creator: "KiraStreams",
  publisher: "KiraStreams",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kirastreams.com",
    siteName: "KiraStreams",
    title: "KiraStreams - Free Online Movies & TV Shows Streaming | Ad-Free HD Streaming",
    description: "Watch free online movies and TV shows on KiraStreams. Ad-free streaming website with unlimited HD content. Stream thousands of movies and series without subscription.",
    images: [
      {
        url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?",
        width: 1200,
        height: 630,
        alt: "KiraStreams - Free Online Movies & TV Shows"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "KiraStreams - Free Online Movies & TV Shows Streaming",
    description: "Watch free online movies and TV shows. Ad-free streaming with unlimited HD content.",
    images: ["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?"],
    creator: "@kirastreams",
  },
  alternates: {
    canonical: "https://kirastreams.com"
  },
  icons: {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-favicon%2c--ecf4125d-20251001055539.jpg?",
    apple: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-favicon%2c--ecf4125d-20251001055539.jpg?",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KiraStreams",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "google-site-verification-code-here",
  },
  category: "entertainment",
};

// Separate viewport export (required in Next.js 15)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "KiraStreams",
              "alternateName": ["KiraStream", "Kira Streams"],
              "url": "https://kirastreams.com",
              "description": "Free online movies and TV shows streaming platform. Watch unlimited HD content without ads or subscription.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://kirastreams.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "KiraStreams",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?"
                }
              },
              "sameAs": [
                "https://twitter.com/kirastreams",
                "https://facebook.com/kirastreams"
              ]
            })
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EntertainmentBusiness",
              "name": "KiraStreams",
              "description": "Ad-free streaming platform offering free online movies and TV shows in HD quality",
              "url": "https://kirastreams.com",
              "logo": "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?",
              "priceRange": "Free",
              "paymentAccepted": "None - Free Service"
            })
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <Providers>{children}</Providers>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}