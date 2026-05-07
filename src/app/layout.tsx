import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/wallet/WalletContextProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus.ai | Web3 Operating System",
  description: "The Intelligent Operating System for Web3. Execute complex blockchain interactions effortlessly through natural language commands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen pt-20 flex flex-col`}>
        <WalletContextProvider>
          <Navbar />
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}