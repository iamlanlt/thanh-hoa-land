import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { getPublicSettings } from "@/services/setting.service";
import { siteConfig } from "@/lib/config";
import { jsonLdScriptProps } from "@/lib/json-ld";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "optional",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const title =
    settings.seoTitle || `${settings.brandName} | Bất động sản Thanh Hóa`;
  const description =
    settings.seoDescription ||
    "Nhà đất chọn lọc, thông tin rõ ràng và tư vấn tận tâm tại Thanh Hóa.";
  const image = settings.ogImageUrl || settings.logoUrl;
  const brandIcon = settings.faviconUrl || settings.logoUrl || "/icon.svg";
  return {
    title,
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || siteConfig.siteUrl,
    ),
    alternates: { canonical: "/" },
    icons: {
      icon: brandIcon,
      shortcut: brandIcon,
      apple: brandIcon,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      siteName: settings.brandName,
      ...(image
        ? {
            images: [
              { url: image, width: 1200, height: 630, alt: settings.brandName },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || siteConfig.siteUrl
  ).replace(/\/$/, "");
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: settings.brandName,
    url: siteUrl,
    ...(settings.logoUrl ? { logo: settings.logoUrl, image: settings.logoUrl } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressRegion: "Thanh Hóa",
            addressCountry: "VN",
          },
        }
      : {}),
    areaServed: "Thanh Hóa",
    sameAs: [settings.facebookUrl, settings.tiktokUrl].filter(Boolean),
  };

  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#0f4c3f" />
        <script
          type="application/ld+json"
          {...jsonLdScriptProps(organizationJsonLd)}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />
            <Script
              id="google-analytics"
              strategy="lazyOnload"
            >{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
