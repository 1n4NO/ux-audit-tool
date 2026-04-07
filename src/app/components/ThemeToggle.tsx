"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeToBrowserState() {
  return () => {};
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const isClient = useSyncExternalStore(
    subscribeToBrowserState,
    () => true,
    () => false
  );
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [isClient, theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!isClient) return null;

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 shadow"
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
