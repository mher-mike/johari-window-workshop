import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Johari Window Workshop",
  description: "A quiet team Johari Window workshop app."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
