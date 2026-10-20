import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/folio/shell";
export const metadata = {
     title: "Folio | Free Résumé Builder for Students",
     description: "Build a professional résumé for free. Answer guided questions, get a polished résumé, and find jobs that fit.",
     keywords: ["resume builder", "free resume builder", "student resume", "resume for internships"],
   };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
