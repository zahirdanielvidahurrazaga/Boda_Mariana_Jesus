import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Mariana & Jesús | Nuestra Historia",
  description: "Captura y comparte la magia de nuestro día especial en nuestra galería privada.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mariana & Jesús",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  applicationName: "Mariana & Jesús",
  keywords: ["wedding", "shared camera", "real-time photos", "event gallery"],
  openGraph: {
    title: "Mariana & Jesús | Nuestra Historia Compartida",
    description: "Comparte la magia de nuestra boda con nosotros.",
    type: "website",
    images: [
      {
        url: "/couple-1.png",
        width: 1200,
        height: 630,
        alt: "Mariana & Jesús",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${notoSerif.variable} antialiased`}
      >
        <main className="min-h-screen selection:bg-accent selection:text-white">
          {children}
        </main>
      </body>
    </html>
  );
}
