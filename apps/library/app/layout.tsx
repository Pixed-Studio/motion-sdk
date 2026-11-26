import "@ui-sdk/core/web.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Motion SDK library", template: "%s · Motion SDK" },
  description: "Motion atoms for agents: each one playing live, with the decisions it leaves to its author.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="wordmark">
            Motion SDK <span>library</span>
          </Link>
          <nav aria-label="Project">
            <a href="https://github.com/Pixed-Studio/motion-sdk">GitHub</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          Every atom here is drawn in your browser from the same document an agent would write. Nothing on this page is a video.
        </footer>
      </body>
    </html>
  );
}
