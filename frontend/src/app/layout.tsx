import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Saint Claire Beauty | Premium D2C Skincare",
  description: "Experience the pinnacle of skincare with technical transparency and one-click luxury.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="bg-primary text-white py-16 mt-20">
          <div className="container grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Saint Claire Beauty Logo" className="h-10 w-auto rounded-lg grayscale brightness-200" />
                <h2 className="text-2xl font-bold italic">Saint Claire</h2>
              </div>
              <p className="text-gray-400 max-w-xs">
                Crafting luxury skincare with technical precision and ingredient transparency.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-6 uppercase tracking-widest text-sm">Shop</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-secondary transition-colors">Serums</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Moisturizers</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Toners</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 uppercase tracking-widest text-sm">About</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-secondary transition-colors">Our Philosophy</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Ingredients Bible</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="container mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            © 2026 Saint Claire Beauty. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
