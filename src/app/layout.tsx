import "./globals.css";

export const metadata = {
  title: "AtomQuest Portal",
  description: "Goal Tracking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
import { Geist } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
})