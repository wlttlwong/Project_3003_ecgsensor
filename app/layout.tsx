import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GlobalChatbot from "./components/GlobalChatbot";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BIOF3003 ECG Sensor",
  description: "ECG monitoring dashboard with API-backed session storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <GlobalChatbot />
      </body>
    </html>
  );
}
