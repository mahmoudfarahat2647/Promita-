import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClerkProvider } from "@/components/layout/providers";
import { Analytics } from "@/components/layout/analytics";
import { Shell } from "@/components/layout/shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "Promptita — AI Prompts for POD & Marketing",
  description: "Curated AI prompts for print-on-demand design and marketing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${dancingScript.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-black">
          <ConvexClerkProvider>
            <Analytics />
            <Shell>{children}</Shell>
          </ConvexClerkProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
