import type { Metadata } from "next";
import "../../public/global/globals.css";
import { Providers } from "./provider";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "APARICIO | Developer Portfolio",
  description:
    "Aparicio's developer portfolio for full-stack web apps, practical interfaces, and project work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>
          <Header />

          <main className="min-h-dvh pt-32 pb-24 sm:pt-28 sm:pb-24">
            {children}
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  )
}
