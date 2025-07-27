import type { Metadata } from "next";
import { Inter, Barlow, Poppins, Lobster } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";

export const metadata: Metadata = {
  title: "Minimal App",
  description: "A minimal Next.js app with authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#003883" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={``}>
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
