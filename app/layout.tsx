import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MiniAppReady } from "@/components/MiniAppReady";
import { SiteNav } from "@/components/SiteNav";
import { DarkVeil } from "@/components/reactbits/DarkVeil";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID || "6a23befeee0157745851b28a";
const appIcon = "/images/world-cup-trophy.png?v=2";
const shareImage = "/images/world-cup-share-hero.png?v=1";
const absoluteAppIcon = new URL(appIcon, appUrl).toString();
const absoluteShareImage = new URL(shareImage, appUrl).toString();

export const metadata: Metadata = {
  title: "World Cup Support Drop",
  description: "Pick a team, claim its ERC1155 support flag, and push it up the leaderboard.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "World Cup Support Drop",
    description: "Claim your team flag and support your country in the World Cup leaderboard race.",
    url: appUrl,
    siteName: "World Cup Support Drop",
    images: [{ url: shareImage, width: 1731, height: 909, alt: "World Cup Support Drop trophy in a stadium" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup Support Drop",
    description: "Claim your team flag and support your country in the World Cup leaderboard race.",
    images: [shareImage],
  },
  other: {
    "base:app_id": baseAppId,
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: absoluteShareImage,
      button: {
        title: "Pick your team",
        action: {
          type: "launch_frame",
          name: "World Cup Support Drop",
          url: appUrl,
          splashImageUrl: absoluteAppIcon,
          splashBackgroundColor: "#080a0d",
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080a0d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <MiniAppReady />
        <DarkVeil />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
