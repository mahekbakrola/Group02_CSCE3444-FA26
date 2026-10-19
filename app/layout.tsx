import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/folio/shell";
export const metadata: Metadata = {
  title: { default: "Folio — Your career, connected", template: "%s · Folio" },
  description:
    "Discover the value in your experience. Build an evidence-backed résumé and explore your next chapter.",
  icons: { icon: "/favicon.svg" },
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
