import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppStateProvider } from "../components/AppStateProvider";
import LoginGate from "../components/LoginGate";
import PhoneStatusBar from "../components/PhoneStatusBar";
import { auth0 } from "../lib/auth0";
import { upsertUser } from "../lib/syncUser";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascend",
  description: "Discipline is a team sport.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  let supabaseUser = null;
  if (session?.user) {
    supabaseUser = await upsertUser(session.user);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <div className="phone-frame">
          <PhoneStatusBar />
          <div className="phone-screen">
            {session ? (
              <AppStateProvider
                auth0Id={session.user.sub}
                displayName={
                  supabaseUser?.display_name ||
                  session.user.name ||
                  session.user.email ||
                  "Player"
                }
              >
                {children}
              </AppStateProvider>
            ) : (
              <LoginGate />
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
