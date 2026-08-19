import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CyberSync - Cybersecurity Learning Platform",
  description: "Track your cybersecurity learning progress long-term",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg">
      <header className="border-b dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">CyberSync</h1>
          <nav>
            <a
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors ml-4"
            >
              Signup
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-block animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Long-term cybersecurity learning platform
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track your growth, master new concepts, and stay ready for the
            evolving threat landscape. CyberSync helps you build lasting
            security skills over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-full px-8 py-3 transition-colors shadow-sm shadow-indigo-600/20"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="border border-gray-400 hover:border-white text-white font-medium rounded-full px-8 py-3 transition-colors"
            >
              Login
            </a>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t dark:border-gray-600 text-sm text-gray-500">
          <p className="mb-2">Version 0.1.0 - Foundation</p>
          <p className="mb-2">Cybersecurity learning platform</p>
        </div>
      </main>
    </div>
  );
}