import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-black dark:text-white">

        {/* NAVBAR */}
        <header className="w-full border-b bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="font-bold text-lg">
              UX Audit Engine
            </Link>

            <nav className="flex gap-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/#features">Features</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>

      </body>
    </html>
  );
}