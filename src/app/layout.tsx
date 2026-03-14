import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Credovia | Build Your Digital Trust",
  description: "Calculate and display your credibility score based on your online presence and community reviews.",
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} gradient-bg min-h-screen antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="pt-24 pb-12 px-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
