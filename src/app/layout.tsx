import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

const bodyFont = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body" });
const headingFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "SMTeam Platform",
  description: "Платформа команды SMTeam для публикации проектов."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="ru"><body className={`${bodyFont.variable} ${headingFont.variable}`}><Providers>{children}</Providers></body></html>;
}
