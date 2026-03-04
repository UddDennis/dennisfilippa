import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dennis och Filippas bröllop",
  description: "Dennis och Filippa ska gifta sig och du är bjuden",
  openGraph: {
    images: ["/puss2.svg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/puss2.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
