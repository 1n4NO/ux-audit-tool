import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else if (theme === "light") {
                    document.documentElement.classList.remove("dark");
                  } else {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    if (prefersDark) {
                      document.documentElement.classList.add("dark");
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>

        {/* NAVBAR */}
        <header className="w-full border-b bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="font-bold text-lg">
              UX Audit Engine
            </Link>

            <nav className="flex gap-4 text-sm items-center">
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